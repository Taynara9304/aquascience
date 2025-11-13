// components/MobileMap.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Linking, Platform, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { getAddressFromCoordinatesWithRetry } from '../services/geocodingService';

const { width, height } = Dimensions.get('window');

// Coordenadas fixas do IFPR Cascavel
const IFPR_CASCAVEL = {
  latitude: -24.943611,
  longitude: -53.495806
};

const MobileMap = ({
  onLocationSelect,
  onAddressSelect,
  initialLocation = IFPR_CASCAVEL
}) => {
  const [selectedLocation, setSelectedLocation] = useState(IFPR_CASCAVEL);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [lastMapState, setLastMapState] = useState({
    latitude: IFPR_CASCAVEL.latitude,
    longitude: IFPR_CASCAVEL.longitude,
    zoom: 16
  });

  const [webViewKey, setWebViewKey] = useState(1);
  const [expandedMapState, setExpandedMapState] = useState(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (error) {
      console.log('Erro ao verificar permissão:', error);
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    setLoadingAddress(true);
    try {
      const endereco = await getAddressFromCoordinatesWithRetry(latitude, longitude, 2);
      if (onAddressSelect) {
        onAddressSelect(endereco);
      }
      return endereco;
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      const enderecoFallback = {
        enderecoCompleto: `Localização: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        latitude: latitude,
        longitude: longitude
      };
      if (onAddressSelect) {
        onAddressSelect(enderecoFallback);
      }
      return enderecoFallback;
    } finally {
      setLoadingAddress(false);
    }
  };

  // FUNÇÃO htmlContent ADICIONADA DE VOLTA
  const htmlContent = (lat, lng, zoom) => `
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
        .leaflet-control-attribution { font-size: 10px; }
        
        .leaflet-touch .leaflet-control-layers, 
        .leaflet-touch .leaflet-bar {
            border: 2px solid rgba(0,0,0,0.2);
        }
        .leaflet-touch .leaflet-bar a {
            width: 35px;
            height: 35px;
            line-height: 35px;
            font-size: 18px;
        }
        
        .address-info {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 8px;
            border: 2px solid #2685BF;
            z-index: 1000;
            max-height: 120px;
            overflow-y: auto;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .location-marker {
            background-color: #2685BF;
            border: 2px solid white;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        .ifpr-marker {
            background-color: #ff0000;
            border: 2px solid white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        
        .expand-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            border-radius: 4px;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .leaflet-layer,
        .leaflet-tile-container {
            will-change: auto !important;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="addressInfo" class="address-info" style="display: none;"></div>
    
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>
        let map, marker;
        const initialLat = ${lat};
        const initialLng = ${lng};
        const initialZoom = ${zoom};
        const IFPR_CASCAVEL = {
            lat: -24.943611,
            lng: -53.495806
        };

        function initMap() {
            map = L.map('map', {
                zoomControl: true,
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: false,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: false,
                tap: true,
                zoomSnap: 0.5,
                preferCanvas: true
            }).setView([initialLat, initialLng], initialZoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
                minZoom: 3,
                crossOrigin: true,
                detectRetina: false
            }).addTo(map);

            const ifprIcon = L.divIcon({
                className: 'ifpr-marker',
                html: '<div style="color: white; font-weight: bold; text-align: center; font-size: 10px;">IFPR</div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            L.marker([IFPR_CASCAVEL.lat, IFPR_CASCAVEL.lng], {
                title: 'IFPR - Campus Cascavel',
                icon: ifprIcon,
                zIndexOffset: 1000
            }).addTo(map).bindPopup('<strong>IFPR Campus Cascavel</strong><br>Avenida das Palmas, 2020');

            marker = L.marker([initialLat, initialLng], {
                draggable: true,
                autoPan: true,
                title: 'Local selecionado'
            }).addTo(map);

            map.on('click', function(e) {
                const { lat, lng } = e.latlng;
                updateMarkerPosition(lat, lng);
            });

            marker.on('dragend', function(e) {
                const { lat, lng } = marker.getLatLng();
                updateMarkerPosition(lat, lng);
            });

            setTimeout(function() {
                map.invalidateSize(true);
                map.setView([initialLat, initialLng], initialZoom);
                marker.setLatLng([initialLat, initialLng]);
                
                setTimeout(function() {
                    map.invalidateSize(true);
                }, 300);
            }, 100);

            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            map.dragging.enable();

            map.zoomControl.setPosition('bottomright');

            setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLoaded',
                    latitude: initialLat,
                    longitude: initialLng,
                    zoom: initialZoom
                }));
                
                setTimeout(function() {
                    map.invalidateSize(true);
                }, 500);
            }, 800);
        }

        function updateMarkerPosition(lat, lng) {
            marker.setLatLng([lat, lng]);
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationSelected',
                latitude: lat,
                longitude: lng
            }));
        }

        function setMapLocation(lat, lng, zoom = 15) {
            if (map && marker) {
                map.setView([lat, lng], zoom);
                marker.setLatLng([lat, lng]);
                updateMarkerPosition(lat, lng);
                
                setTimeout(function() {
                    map.invalidateSize(true);
                }, 100);
            }
        }

        function showAddressInfo(addressText) {
            const addressDiv = document.getElementById('addressInfo');
            addressDiv.innerHTML = addressText;
            addressDiv.style.display = 'block';
            
            setTimeout(() => {
                addressDiv.style.display = 'none';
            }, 8000);
        }

        window.addEventListener('load', function() {
            initMap();
        });

        setTimeout(initMap, 1000);
    </script>
</body>
</html>
`;

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'locationSelected') {
        const location = { latitude: data.latitude, longitude: data.longitude };
        setSelectedLocation(location);
        onLocationSelect(location);
        
        await getAddressFromCoordinates(data.latitude, data.longitude);
      }
      
      if (data.type === 'mapLoaded') {
        setMapLoaded(true);
        setIsWebViewReady(true);
      }
    } catch (error) {
      console.log('Erro ao processar mensagem:', error);
    }
  };

  const focusOnCurrentLocation = async () => {
    try {
      if (!hasLocationPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária',
            'Precisamos da permissão de localização para encontrar sua posição.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const { latitude, longitude } = location.coords;
      const newLocation = { latitude, longitude };
      
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);

      if (webViewRef.current && mapLoaded) {
        webViewRef.current.injectJavaScript(`
          setMapLocation(${latitude}, ${longitude}, 15);
          true;
        `);
      }

      await getAddressFromCoordinates(latitude, longitude);

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const handleModalClose = () => {
    setIsExpanded(false);
    setWebViewKey(prev => prev + 1);
  };

  const handleModalOpen = () => {
    if (webViewRef.current && mapLoaded) {
      webViewRef.current.injectJavaScript(`
        const center = map.getCenter();
        const zoom = map.getZoom();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'currentMapState',
          latitude: center.lat,
          longitude: center.lng,
          zoom: zoom
        }));
        true;
      `);
    }
    setIsExpanded(true);
  };

  const getExpandedMapLocation = () => {
    if (expandedMapState) {
      return expandedMapState;
    }
    return lastMapState;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Toque no mapa para selecionar sua localização
      </Text>
      
      <View style={styles.mapContainer}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          style={styles.webview}
          source={{ html: htmlContent(
            lastMapState.latitude,
            lastMapState.longitude,
            lastMapState.zoom
          ) }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          automaticallyAdjustContentInsets={false}
          overScrollMode="never"
          bounces={false}
          scrollEnabled={false}
          onLoadEnd={() => {
            setIsWebViewReady(true);
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
        
        <TouchableOpacity 
          style={styles.currentLocationButton}
          onPress={focusOnCurrentLocation}
          disabled={!mapLoaded}
        >
          <Ionicons name="locate" size={24} color="#2685BF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.expandButton}
          onPress={handleModalOpen}
        >
          <Ionicons name="expand" size={24} color="#2685BF" />
        </TouchableOpacity>

        {!isWebViewReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2685BF" style={styles.mapLoadingIndicator} />
            <Text style={styles.loadingText}>Carregando mapa...</Text>
          </View>
        )}
      </View>

      {loadingAddress && (
        <View style={styles.loadingAddressContainer}>
          <ActivityIndicator size="small" color="#2685BF" />
          <Text style={styles.loadingAddressText}>Buscando endereço...</Text>
        </View>
      )}

      <Modal
        visible={isExpanded}
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mapa - Toque para selecionar</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleModalClose}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          <WebView
            key={`expanded-${webViewKey}`}
            ref={webViewRef}
            style={styles.expandedWebview}
            source={{ html: htmlContent(
              getExpandedMapLocation().latitude,
              getExpandedMapLocation().longitude,
              getExpandedMapLocation().zoom
            ) }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
          />
          
          <View style={styles.modalControls}>
            <TouchableOpacity 
              style={styles.modalLocationButton}
              onPress={focusOnCurrentLocation}
            >
              <Ionicons name="locate" size={20} color="white" />
              <Text style={styles.modalButtonText}>Minha Localização</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalLocationButton, styles.modalCloseButton]}
              onPress={handleModalClose}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  instructionText: {
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#2685BF',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    borderRadius: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2685BF',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  expandButton: {
    position: 'absolute',
    bottom: 70,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
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
  loadingAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(38, 133, 191, 0.1)',
    borderRadius: 8,
    marginTop: 10,
  },
  loadingAddressText: {
    marginLeft: 10,
    color: '#1976d2',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  expandedWebview: {
    flex: 1,
  },
  modalControls: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    gap: 10,
  },
  modalLocationButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2685BF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    flex: 0.5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MobileMap;