// componentes/MapaUniversalPocos.js
import React from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import MapaWebPocos from './MapaWebPocos';
import MapaMobilePocos from './MapaMobilePocos';
import { useWells } from '../hooks/useWells';

const MapaUniversalPocos = ({ onLocationSelected }) => {
  const { wells, loading } = useWells();

  console.log('🗺️ MapaUniversalPocos - Poços:', wells.length);
  console.log('🗺️ MapaUniversalPocos - Loading:', loading);

  // Converter poços para marcadores do mapa
  const markers = wells.map(well => {
    // Extrair latitude e longitude do campo localizacao (GeoPoint)
    let latitude, longitude;
    
    if (well.localizacao && well.localizacao.latitude && well.localizacao.longitude) {
      // Se for um GeoPoint do Firebase
      latitude = well.localizacao.latitude;
      longitude = well.localizacao.longitude;
    } else if (well.localizacao && well.localizacao._lat && well.localizacao._long) {
      // Formato alternativo do GeoPoint
      latitude = well.localizacao._lat;
      longitude = well.localizacao._long;
    } else {
      // Coordenadas padrão se não tiver localização
      latitude = -15.7797; // Centro do Brasil
      longitude = -47.9297;
    }

    // Formatar data de cadastro
    const formatarData = (timestamp) => {
      if (!timestamp) return 'Data não informada';
      
      try {
        if (timestamp.toDate) {
          // Se for um Timestamp do Firebase
          return timestamp.toDate().toLocaleDateString('pt-BR');
        } else if (timestamp instanceof Date) {
          return timestamp.toLocaleDateString('pt-BR');
        } else {
          return new Date(timestamp).toLocaleDateString('pt-BR');
        }
      } catch (error) {
        return 'Data inválida';
      }
    };

    return {
      id: well.id,
      latitude: latitude,
      longitude: longitude,
      titulo: `Poço ${well.nomeProprietario || 'Sem nome'}`,
      endereco: well.localizacao ? `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°` : 'Localização não informada',
      status: well.status || 'pendente_aprovacao',
      data: formatarData(well.dataCadastro),
      proprietario: well.nomeProprietario || 'Proprietário não informado',
      observacoes: well.observacoes || '',
      tipoCadastro: well.tipoCadastro || 'solicitacao_analista',
      // Dados completos do poço para usar no popup
      wellData: well
    };
  });

  // Filtrar apenas poços com localização válida (não é a padrão)
  const validMarkers = markers.filter(marker => 
    marker.latitude !== -15.7797 && marker.longitude !== -47.9297
  );

  console.log('🗺️ Marcadores válidos:', validMarkers.length);
  console.log('🗺️ Primeiro marcador válido:', validMarkers[0]);

  const handleMapClick = (event) => {
    if (onLocationSelected) {
      const { lat, lng } = event.latlng || event;
      onLocationSelected({ latitude: lat, longitude: lng });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando mapa de poços...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mapa de Poços Cadastrados</Text>
        <Text style={styles.subtitulo}>
          {validMarkers.length} poço{validMarkers.length !== 1 ? 's' : ''} com localização
          {wells.length > validMarkers.length && ` (${wells.length - validMarkers.length} sem localização)`}
        </Text>
      </View>

      {Platform.OS === 'web' ? (
        <MapaWebPocos 
          markers={validMarkers} 
          onLocationSelected={handleMapClick}
        />
      ) : (
        <MapaMobilePocos 
          markers={validMarkers} 
          onLocationSelected={handleMapClick}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#2685BF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
});

export default MapaUniversalPocos;