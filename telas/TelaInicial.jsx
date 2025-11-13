// === MUDANÇA AQUI ===
import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
// === MUDANÇA AQUI ===
import { useRoute } from '@react-navigation/native'; 

import CarosselInicial from '../secoes/CarosselInicial';
import Apresentacao from '../secoes/Apresentacao';
import EducacaoAmbiental from '../secoes/EducacaoAmbiental';
import Avaliacoes from '../secoes/Avaliacoes';
import Contato from '../secoes/Contato';
import NavBar from '../componentes/NavBar';

const TelaInicial = () => {
  const { width } = useWindowDimensions();
  const contentWidth = width < 800 ? width : width * 0.6;
  const scrollViewRef = useRef(null);
  
  // === MUDANÇA AQUI ===
  const route = useRoute(); // Pega os parâmetros da navegação

  const [layoutY, setLayoutY] = useState({
    apresentacao: 0,
    educacao: 0,
    avaliacoes: 0,
    contato: 0,
  });

  // Funções de rolagem dinâmicas (originais)
  const scrollToApresentacao = () => {
    scrollViewRef.current?.scrollTo({ y: layoutY.apresentacao, animated: true });
  };
  
  const scrollToEducacao = () => {
    scrollViewRef.current?.scrollTo({ y: layoutY.educacao, animated: true });
  };

  const scrollToAvaliacoes = () => {
    scrollViewRef.current?.scrollTo({ y: layoutY.avaliacoes, animated: true });
  };

  const scrollToContato = () => {
    scrollViewRef.current?.scrollTo({ y: layoutY.contato, animated: true });
  };

  // Função genérica para medir (original)
  const onLayout = (key) => (event) => {
    const { y } = event.nativeEvent.layout;
    setLayoutY((prev) => ({ ...prev, [key]: y - 20 })); 
  };

  // === MUDANÇA AQUI ===
  // Este Effect "ouve" o parâmetro 'scrollTo' da rota
  useEffect(() => {
    // Pega o parâmetro 'scrollTo'
    const section = route.params?.scrollTo;
    
    // Se não houver parâmetro, não faz nada
    if (!section) return;

    // Precisamos esperar um pouco para o 'layoutY' ser preenchido
    // 300ms é geralmente seguro
    const timer = setTimeout(() => {
      console.log(`Tentando rolar para: ${section}`);
      if (section === 'sobre' || section === 'servicos') {
        scrollToApresentacao();
      } else if (section === 'educacao') {
        scrollToEducacao();
      } else if (section === 'contato') {
        scrollToContato();
      }
      // Limpa o parâmetro para não rolar de novo se o usuário
      // sair e voltar para a tela
      // (Isso depende de como seu navigator está configurado, 
      // mas é uma boa prática)
      // navigation.setParams({ scrollTo: null }); 
      // Nota: para usar setParams, você precisaria do useNavigation() aqui.
      // Por enquanto, vamos deixar sem, é mais simples.

    }, 300); // Ajuste o tempo se necessário

    // Limpa o timer se o componente for desmontado
    return () => clearTimeout(timer);

    // Roda o efeito se o parâmetro 'scrollTo' mudar,
    // ou se as posições de layoutY forem atualizadas.
  }, [route.params?.scrollTo, layoutY]);


  return (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.containerApp}>
        <View style={[styles.contentContainer, { width: contentWidth }]}>
          
          <NavBar
            onScrollToApresentacao={scrollToApresentacao}
            onScrollToEducacao={scrollToEducacao}
            onScrollToContato={scrollToContato}
            onScrollToServicos={scrollToApresentacao} // "Serviços" leva para "Apresentação"
          />
          
          <CarosselInicial 
            containerWidth={contentWidth} 
            onScrollToAvaliacoes={scrollToAvaliacoes}
          />

          {/* O resto do seu código está correto */}
          <View onLayout={onLayout('apresentacao')} style={{ width: '100%' }}>
            <Apresentacao />
          </View>

          <View onLayout={onLayout('educacao')} style={{ width: '100%' }}>
            <EducacaoAmbiental />
          </View>
          
          <View onLayout={onLayout('avaliacoes')} style={{ width: '100%' }}>
            <Avaliacoes />
          </View>
          
          <View onLayout={onLayout('contato')} style={{ width: '100%' }}>
            <Contato />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ... (Seus estilos originais)
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  containerApp: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center', // Isso centraliza o 'contentContainer'
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  contentContainer: {
    alignItems: 'center', // Isso centraliza os filhos (e causa o problema de largura)
  },
});

export default TelaInicial;