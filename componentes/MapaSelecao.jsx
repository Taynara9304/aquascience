import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MapaSelecao = ({ onLocationSelected, initialLocation }) => {
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Localização inicial (Cascavel-PR)
  const defaultLocation = initialLocation || { 
    latitude: -24.9555, 
    longitude: -53.4562 
  };

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
          
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .custom-marker {
            background-color: #2685BF;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
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
            map = L.map('map', {
              zoomControl: true,
              dragging: true,
              touchZoom: true,
              scrollWheelZoom: true,
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
              
              // Mover marcador para nova posição
              marker.setLatLng([lat, lng]);
              
              // Enviar coordenadas para React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationSelected',
                latitude: lat,
                longitude: lng
              }));
            });

            // Evento de arrastar marcador
            marker.on('dragend', function(e) {
              const { lat, lng } = marker.getLatLng();
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationSelected',
                latitude: lat,
                longitude: lng
              }));
            });

            // Sinalizar que o mapa carregou
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));

            setTimeout(function() {
              map.invalidateSize(true);
            }, 100);
          }

          // Função para obter localização atual
          function getCurrentLocation() {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function(position) {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  
                  // Mover mapa para localização atual
                  map.setView([lat, lng], 15);
                  marker.setLatLng([lat, lng]);
                  
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    latitude: lat,
                    longitude: lng
                  }));
                },
                function(error) {
                  console.error('Erro ao obter localização:', error);
                }
              );
            }
          }

          window.addEventListener('load', initMap);
          
          // Expor função para React Native
          window.getCurrentLocation = getCurrentLocation;
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapLoaded') {
        setMapLoaded(true);
      } else if (data.type === 'locationSelected' && onLocationSelected) {
        onLocationSelected({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.log('Erro ao processar mensagem:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof getCurrentLocation === 'function') {
          getCurrentLocation();
        }
        true;
      `);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Toque no mapa para selecionar a localização do poço
      </Text>
      
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ html: generateMapHTML() }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onLoadEnd={() => {
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  if (map) {
                    map.invalidateSize(true);
                    setTimeout(function() { map.invalidateSize(true); }, 300);
                  }
                  true;
                `);
              }
            }, 500);
          }}
        />
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlText}>
          💡 Dica: Toque em qualquer lugar do mapa ou use o botão abaixo
        </Text>
        
        <button 
          style={styles.locationButton}
          onClick={handleUseCurrentLocation}
        >
          📍 Usar Minha Localização Atual
        </button>
      </View>
    </View>
  );
};

// Estilos para web (React Native Web)
const styles = {
  container: {
    flex: 1,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '500',
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
    borderStyle: 'solid',
  },
  webview: {
    flex: 1,
  },
  controls: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  controlText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#2685BF',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
};

// Para React Native, vamos usar StyleSheet
if (Platform.OS !== 'web') {
  const { StyleSheet } = require('react-native');
  styles = StyleSheet.create({
    container: {
      flex: 1,
      marginBottom: 16,
    },
    instruction: {
      fontSize: 16,
      fontWeight: '500',
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
    },
    webview: {
      flex: 1,
    },
    controls: {
      marginTop: 16,
      padding: 16,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#dee2e6',
    },
    controlText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      textAlign: 'center',
    },
  });
}

export default MapaSelecao;