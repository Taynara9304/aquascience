import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// Importação condicional do WebView
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

const MapaSelecaoSimples = ({ onLocationSelected, initialLocation }) => {
  const webViewRef = useRef(null);
  const iframeRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Localização padrão (Cascavel-PR)
  const defaultLocation = initialLocation || { 
    latitude: -24.9555, 
    longitude: -53.4562 
  };

  // Função para gerar HTML do mapa
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html { width: 100%; height: 100%; overflow: hidden; }
          #map { width: 100%; height: 100%; background: #f8f9fa; }
          .leaflet-container { background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          let map;
          let marker;
          const centerLat = ${defaultLocation.latitude};
          const centerLng = ${defaultLocation.longitude};

          function initMap() {
            try {
              map = L.map('map', {
                zoomControl: true,
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: ${Platform.OS === 'web'}, // Só habilita scroll na web
                doubleClickZoom: true,
                boxZoom: true
              }).setView([centerLat, centerLng], 13);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);

              // Criar marcador inicial
              marker = L.marker([centerLat, centerLng], {
                draggable: true,
                title: 'Local selecionado'
              }).addTo(map);

              // Evento de clique no mapa
              map.on('click', function(e) {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                handleLocationSelected(lat, lng);
              });

              // Evento de arrastar marcador
              marker.on('dragend', function(e) {
                const { lat, lng } = marker.getLatLng();
                handleLocationSelected(lat, lng);
              });

              // Sinalizar que o mapa carregou
              signalMapLoaded();

              // Corrigir tamanho do mapa
              setTimeout(function() {
                map.invalidateSize(true);
              }, 100);

            } catch (error) {
              console.error('Erro ao inicializar mapa:', error);
            }
          }

          function handleLocationSelected(lat, lng) {
            // Enviar coordenadas para React Native (mobile) ou parent (web)
            if (window.ReactNativeWebView) {
              // Mobile
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationSelected',
                latitude: lat,
                longitude: lng
              }));
            } else if (window.parent) {
              // Web - usando postMessage para iframe
              window.parent.postMessage({
                type: 'locationSelected',
                latitude: lat,
                longitude: lng
              }, '*');
            }
          }

          function signalMapLoaded() {
            if (window.ReactNativeWebView) {
              // Mobile
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLoaded'
              }));
            } else if (window.parent) {
              // Web
              window.parent.postMessage({
                type: 'mapLoaded'
              }, '*');
            }
          }

          // Função para obter localização atual
          function getCurrentLocation() {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function(position) {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  
                  map.setView([lat, lng], 15);
                  marker.setLatLng([lat, lng]);
                  handleLocationSelected(lat, lng);
                },
                function(error) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'geolocationError',
                      error: error.message
                    }));
                  } else if (window.parent) {
                    window.parent.postMessage({
                      type: 'geolocationError',
                      error: error.message
                    }, '*');
                  }
                },
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 60000
                }
              );
            }
          }

          // Inicializar mapa quando a página carregar
          window.addEventListener('load', initMap);
          
          // Redimensionar mapa quando a orientação mudar
          window.addEventListener('resize', function() {
            if (map) {
              setTimeout(function() {
                map.invalidateSize(true);
              }, 300);
            }
          });

          // Expor função globalmente
          window.getCurrentLocation = getCurrentLocation;
          window.initMap = initMap;

        </script>
      </body>
      </html>
    `;
  };

  // Handler para mensagens do WebView (mobile) e iframe (web)
  const handleMessage = (event) => {
    try {
      let data;
      
      if (Platform.OS === 'web') {
        // Web - evento direto do postMessage
        data = event.data;
      } else {
        // Mobile - evento do WebView
        data = JSON.parse(event.nativeEvent.data);
      }

      console.log('Mensagem recebida:', data);
      
      if (data.type === 'mapLoaded') {
        setMapLoaded(true);
      } else if (data.type === 'locationSelected') {
        const location = {
          latitude: data.latitude,
          longitude: data.longitude
        };
        setSelectedLocation(location);
        if (onLocationSelected) {
          onLocationSelected(location);
        }
      } else if (data.type === 'geolocationError') {
        Alert.alert('Erro de Localização', data.error || 'Não foi possível obter a localização atual.');
      }
    } catch (error) {
      console.log('Erro ao processar mensagem:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (Platform.OS === 'web') {
      // Web - chamar função diretamente no iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.getCurrentLocation();
      }
    } else {
      // Mobile - usar injectJavaScript
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (typeof getCurrentLocation === 'function') {
            getCurrentLocation();
          }
          true;
        `);
      }
    }
  };

  // Efeito para configurar event listener na web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessageEvent = (event) => handleMessage(event);
      window.addEventListener('message', handleMessageEvent);
      
      return () => {
        window.removeEventListener('message', handleMessageEvent);
      };
    }
  }, []);

  // Efeito para redimensionar o mapa quando carregar
  useEffect(() => {
    if (mapLoaded) {
      const resizeMap = () => {
        if (Platform.OS === 'web') {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            setTimeout(() => {
              iframeRef.current.contentWindow.initMap?.();
            }, 100);
          }
        } else {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              if (map) {
                map.invalidateSize(true);
                setTimeout(function() { map.invalidateSize(true); }, 300);
              }
              true;
            `);
          }
        }
      };

      setTimeout(resizeMap, 500);
    }
  }, [mapLoaded]);

  // Renderização para Web
  const renderWebMap = () => (
    <View style={styles.mapContainer}>
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2685BF" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={generateMapHTML()}
        style={styles.iframe}
        allow="geolocation"
        onLoad={() => {
          // Forçar redimensionamento após carregar
          setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
              iframeRef.current.contentWindow.initMap?.();
            }
          }, 100);
        }}
      />
    </View>
  );

  // Renderização para Mobile
  const renderMobileMap = () => (
    <View style={styles.mapContainer}>
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2685BF" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{ html: generateMapHTML() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        onLoadEnd={() => {
          setTimeout(() => {
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                if (map) {
                  map.invalidateSize(true);
                  setTimeout(function() { map.invalidateSize(true); }, 500);
                }
                true;
              `);
            }
          }, 1000);
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {selectedLocation ? '✅ Localização selecionada' : 'Toque no mapa para selecionar a localização'}
      </Text>
      
      {Platform.OS === 'web' ? renderWebMap() : renderMobileMap()}

      <TouchableOpacity 
        style={styles.locationButton}
        onPress={handleUseCurrentLocation}
      >
        <Text style={styles.buttonText}>
          📍 Usar Minha Localização Atual
        </Text>
      </TouchableOpacity>

      {selectedLocation && (
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>
            Localização selecionada:
          </Text>
          <Text style={styles.previewText}>
            Latitude: {selectedLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.previewText}>
            Longitude: {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  mapContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2685BF',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2685BF',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#2685BF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewSection: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 4,
  },
});

export default MapaSelecaoSimples;