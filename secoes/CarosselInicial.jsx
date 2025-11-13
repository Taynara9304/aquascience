import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import NavBar from '../componentes/NavBar';
import { useNavigation } from '@react-navigation/native';

const CarosselInicial = ({ containerWidth, onScrollToAvaliacoes }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const carouselData = [
    {
      id: 1,
      title: 'RETROSPECTIVA HIDROCASCAVEL 2025',
      image: require('../assets/img1Carrossel.png'),
      type: 'external',
      url: 'https://www.instagram.com/hidrocascavel_ifpr',
    },
    {
      id: 2,
      title: 'QUERO DAR MINHA AVALIAÇÃO!',
      image: require('../assets/img2Carrossel.png'),
      type: "scroll",
      action: 'scrollToAvaliacoes',
    },
    {
      id: 3,
      title: 'QUERO AGENDAR UMA VISITA!',
      image: require('../assets/img3Carrossel.png'),
      type: 'internal',
      screen: 'Login',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleButtonPress = (item) => {
    if (item.type === 'external' && item.url) {
      Linking.openURL(item.url);
    } else if (item.type === 'internal' && item.screen) {
      navigation.navigate(item.screen);
    } else if (item.type === 'scroll' && item.action === 'scrollToAvaliacoes') {
      onScrollToAvaliacoes();
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width: containerWidth }]}>
      <Image
        source={item.image}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => handleButtonPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        getItemLayout={(data, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 600,
    marginVertical: 0,
    margin: 0,
    borderRadius: 0,
  },
  slide: {
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    borderRadius: 0,
  },
  textContainer: {
    backgroundColor: '#3D9DD9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
});

export default CarosselInicial;