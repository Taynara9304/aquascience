import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MapaPocos = ({ markers = [] }) => {
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Gerar HTML com Leaflet para mostrar os marcadores
  const generateMapHTML = () => {
    const markersHTML = markers.map(poco => `
      L.marker([${poco.latitude}, ${poco.longitude}], {
        title: '${poco.titulo.replace(/'/g, "\\'")}',
        alt: '${poco.endereco.replace(/'/g, "\\'")}'
      })
      .addTo(map)
      .bindPopup(
        '<div style=\"padding: 10px; min-width: 250px;\">' +
          '<h3 style=\"margin: 0 0 8px 0; color: #333; font-size: 16px;\">${poco.titulo.replace(/'/g, "\\'")}</h3>' +
          '<p style=\"margin: 0 0 5px 0; color: #666; font-size: 14px;\">${poco.endereco.replace(/'/g, "\\'")}</p>' +
          '<p style=\"margin: 0 0 5px 0; color: #666; font-size: 14px;\">Data: ${poco.data}</p>' +
          '<p style=\"margin: 0; color: ${getColorByStatus(poco.status)}; font-weight: bold; font-size: 14px;\">Status: ${poco.status}</p>' +
        '</div>'
      );
    `).join('');

    // Calcular centro baseado nos marcadores
    const centerLat = markers.length > 0 ? markers[0].latitude : -23.5505;
    const centerLng = markers.length > 0 ? markers[0].longitude : -46.6333;
    const zoom = markers.length > 0 ? 13 : 10;

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
          
          .leaflet-popup-content {
            margin: 12px;
            line-height: 1.4;
          }
          
          .custom-marker {
            background-color: ${getColorByStatus('default')};
            border: 2px solid white;
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
          const centerLat = ${centerLat};
          const centerLng = ${centerLng};
          const zoom = ${zoom};

          function initMap() {
            map = L.map('map', {
              zoomControl: true,
              dragging: true,
              touchZoom: true,
              scrollWheelZoom: false,
              doubleClickZoom: true,
              boxZoom: true,
              keyboard: false
            }).setView([centerLat, centerLng], zoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
              minZoom: 3
            }).addTo(map);

            // Adicionar marcadores
            ${markersHTML}

            // Ajustar view para mostrar todos os marcadores
            if (${markers.length} > 0) {
              const group = new L.featureGroup(${markers.length} > 0 ? 
                [${markers.map(m => `L.marker([${m.latitude}, ${m.longitude}])`).join(',')}] : []);
              map.fitBounds(group.getBounds().pad(0.1));
            }

            // Sinalizar que o mapa carregou
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));

            setTimeout(function() {
              map.invalidateSize(true);
            }, 100);
          }

          window.addEventListener('load', initMap);
          
          // Fallback caso o evento load não dispare
          setTimeout(initMap, 1000);
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
      }
    } catch (error) {
      console.log('Erro ao processar mensagem:', error);
    }
  };

  if (markers.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Nenhum poço cadastrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            // Forçar redimensionamento após carregamento
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
        
        {!mapLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2685BF" />
            <Text style={styles.loadingText}>Carregando mapa...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getColorByStatus = (status) => {
  switch (status) {
    case 'Agendado': return '#2196F3';
    case 'Pendente': return '#FF9800';
    case 'Concluído': return '#4CAF50';
    default: return '#2685BF'; // Cor padrão azul
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 400,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2685BF',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2685BF',
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    height: 400,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MapaPocos;