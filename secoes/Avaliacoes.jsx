import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import Card from "../componentes/Card";
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const Avaliacoes = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardWidth = isMobile ? width * 0.85 : 280;
  const cardHeight = 280;

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'avaliacoes'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.userName,
          rating: data.rating,
          comment: data.comment,
        });
      });
      setAvaliacoes(list);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar avaliações: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {avaliacoes.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex 
                ? styles.paginationDotActive 
                : styles.paginationDotInactive
            ]}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando avaliações...</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isMobile && styles.containerMobile
    ]}>
      <Text style={[
        styles.title,
        isMobile && styles.titleMobile
      ]}>
        AVALIAÇÕES E DEPOIMENTOS
      </Text>

      {avaliacoes.length === 0 ? (
        <Text style={styles.loadingText}>Ainda não há avaliações.</Text>
      ) : (
        <View style={styles.content}>
          {isMobile ? (
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                data={avaliacoes} 
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={width}
                snapToAlignment="center"
                decelerationRate="fast"
                getItemLayout={(data, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <View style={[styles.slide, { width }]}>
                    <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
                      <Card {...item} />
                    </View>
                  </View>
                )}
              />
              {renderPagination()}
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {avaliacoes.map((item) => ( 
                <View key={item.id} style={[styles.cardWrapper, { width: cardWidth }]}>
                  <Card {...item} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ... (Estilos de Avaliacoes.jsx) ...
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2c84be",
    padding: 20,
    paddingTop: 40,
    marginTop: 0,
    borderRadius: 0,
    width: '100%',
    marginBottom: 0,
    minHeight: 400,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  containerMobile: {
    padding: 16,
    paddingTop: 30,
    marginTop: 0,
  },
  content: {
    gap: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  titleMobile: {
    fontSize: 24,
    marginBottom: 10,
  },
  carouselContainer: {
    minHeight: 320,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  cardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#ffffff",
    width: 20,
    height: 8,
  },
  paginationDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});

export default Avaliacoes;