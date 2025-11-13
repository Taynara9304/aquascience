// componentes/MapaWebPocos.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapaWebPocos = ({ markers = [], onLocationSelected }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }

      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(leafletCss);

      const leafletJs = document.createElement('script');
      leafletJs.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      leafletJs.onload = () => {
        setTimeout(initMap, 100);
      };
      document.head.appendChild(leafletJs);
    };

    const initMap = () => {
      if (!window.L || !mapRef.current) return;

      try {
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        // Centro do Brasil como padrão
        const centerLat = markers.length > 0 ? markers[0].latitude : -15.7797;
        const centerLng = markers.length > 0 ? markers[0].longitude : -47.9297;
        const zoom = markers.length > 0 ? 6 : 4;
        
        const map = window.L.map(mapRef.current).setView([centerLat, centerLng], zoom);
        mapInstance.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Adicionar marcadores
        markers.forEach(marker => {
          const customIcon = window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${getColorByStatus(marker.status)}; 
                           width: 20px; height: 20px; border-radius: 50%; 
                           border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const popupContent = `
            <div style="padding: 12px; min-width: 280px; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 12px 0; color: #2685BF; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">
                ${marker.titulo}
              </h3>
              
              <div style="margin-bottom: 8px;">
                <strong style="color: #333;">Proprietário:</strong>
                <span style="color: #666; margin-left: 4px;">${marker.proprietario}</span>
              </div>

              <div style="margin-bottom: 8px;">
                <strong style="color: #333;">Localização:</strong>
                <span style="color: #666; margin-left: 4px;">${marker.latitude.toFixed(6)}°, ${marker.longitude.toFixed(6)}°</span>
              </div>

              <div style="margin-bottom: 8px;">
                <strong style="color: #333;">Data de Cadastro:</strong>
                <span style="color: #666; margin-left: 4px;">${marker.data}</span>
              </div>

              <div style="margin-bottom: 8px;">
                <strong style="color: #333;">Tipo de Cadastro:</strong>
                <span style="color: #666; margin-left: 4px; text-transform: capitalize;">
                  ${formatarTipoCadastro(marker.tipoCadastro)}
                </span>
              </div>

              <div style="margin-bottom: ${marker.observacoes ? '8px' : '0'};">
                <strong style="color: #333;">Status:</strong>
                <span style="color: ${getColorByStatus(marker.status)}; font-weight: bold; margin-left: 4px; text-transform: capitalize;">
                  ${formatarStatus(marker.status)}
                </span>
              </div>

              ${marker.observacoes ? `
                <div style="margin-top: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #2685BF;">
                  <strong style="color: #333; display: block; margin-bottom: 4px;">Observações:</strong>
                  <span style="color: #666; font-size: 13px;">${marker.observacoes}</span>
                </div>
              ` : ''}
            </div>
          `;

          window.L.marker([marker.latitude, marker.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent);
        });

        // Evento de clique no mapa
        if (onLocationSelected) {
          map.on('click', function(e) {
            onLocationSelected({
              lat: e.latlng.lat,
              lng: e.latlng.lng
            });
          });
        }

        // Ajustar view para mostrar todos os marcadores
        if (markers.length > 0) {
          const group = new window.L.featureGroup(
            markers.map(m => window.L.marker([m.latitude, m.longitude]))
          );
          map.fitBounds(group.getBounds().pad(0.1));
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [markers, onLocationSelected]);

  if (markers.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Nenhum poço com localização cadastrada</Text>
        <Text style={styles.placeholderSubtext}>
          Os poços aparecerão aqui automaticamente quando forem cadastrados com localização no sistema
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '10px',
          minHeight: '400px'
        }}
      />
      {!mapLoaded && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}
    </View>
  );
};

// Funções auxiliares
const getColorByStatus = (status) => {
  const statusLower = status?.toLowerCase() || 'pendente_aprovacao';
  
  switch (statusLower) {
    case 'aprovado':
    case 'ativo':
      return '#4CAF50'; // Verde
    case 'pendente_aprovacao':
    case 'pendente':
      return '#FF9800'; // Laranja
    case 'rejeitado':
    case 'inativo':
      return '#F44336'; // Vermelho
    default:
      return '#2685BF'; // Azul padrão
  }
};

const formatarStatus = (status) => {
  const statusLower = status?.toLowerCase() || 'pendente_aprovacao';
  
  switch (statusLower) {
    case 'pendente_aprovacao':
      return 'Pendente Aprovação';
    case 'aprovado':
      return 'Aprovado';
    case 'rejeitado':
      return 'Rejeitado';
    default:
      return statusLower.replace(/_/g, ' ');
  }
};

const formatarTipoCadastro = (tipoCadastro) => {
  const tipoLower = tipoCadastro?.toLowerCase() || 'solicitacao_analista';
  
  switch (tipoLower) {
    case 'solicitacao_analista':
      return 'Solicitação Analista';
    case 'solicitacao_proprietario':
      return 'Solicitação Proprietário';
    case 'cadastro_admin':
      return 'Cadastro Administrador';
    default:
      return tipoLower.replace(/_/g, ' ');
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 400,
    position: 'relative',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    height: 400,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MapaWebPocos;