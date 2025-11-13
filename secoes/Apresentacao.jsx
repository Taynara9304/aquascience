import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";

const Apresentacao = () => {
  const [secaoAtiva, setSecaoAtiva] = useState("QUEM SOMOS");

  const screenWidth = Dimensions.get("window").width;
  const isMobile = screenWidth < 850;

  // Ajustes proporcionais para mobile
  const imageSize = Math.min(250, isMobile ? screenWidth * 0.7 : 250);
  const fontSize = isMobile ? 14 : 20;
  const lineHeight = fontSize * 1.4;
  
  // Tamanhos de fonte menores para mobile
  const linkFontSize = isMobile ? 10 : 16;

  const conteudo = {
    "QUEM SOMOS": {
      texto:
        "Somos o Projeto de Extensão HIDROCASCAVEL, uma iniciativa do Instituto Federal do Paraná – Campus Cascavel, que integra ensino, pesquisa e extensão para promover conhecimento técnico e conscientização ambiental sobre os recursos hídricos locais. Nosso grupo é formado por docentes e estudantes de diferentes cursos, comprometidos com a sustentabilidade e com o fortalecimento do protagonismo comunitário em torno da gestão da água.",
      imagem: require("../assets/imgMembrosGrupo.png"),
    },
    "O QUE FAZEMOS": {
      lista: [
        "O projeto realiza avaliações da qualidade da água de poços e nascentes em diferentes regiões de Cascavel-PR, por meio de coletas de campo e análises físico-químicas e microbiológicas em laboratório. Além do diagnóstico técnico, promovemos ações educativas e oficinas participativas, com o objetivo de aproximar a ciência da comunidade, estimular práticas sustentáveis e disseminar informações sobre o uso responsável da água. Dessa forma, contribuímos para a saúde pública, o meio ambiente e a conscientização social."
      ],
      imagem: require("../assets/imgMembrosGrupo2.png"),
    },
    "NOSSA MISSÃO": {
      texto:
        "Nossa missão é avaliar, educar e transformar, promovendo a conscientização ambiental e o uso sustentável da água. Buscamos despertar o senso de responsabilidade coletiva quanto à preservação dos mananciais, fortalecer o vínculo entre ciência e comunidade e formar cidadãos críticos, informados e comprometidos com o futuro dos recursos hídricos.",
      imagem: require("../assets/imgMembrosGrupo3.png"),
    },
  };

  return (
    <View style={styles.container}>
      {/* Menu - Em mobile vira coluna */}
      <View style={[styles.menu, { flexDirection: isMobile ? "column" : "row" }]}>
        <TouchableOpacity 
          onPress={() => setSecaoAtiva("QUEM SOMOS")}
          style={[
            styles.botaoMenu,
            isMobile && styles.botaoMenuMobile,
            secaoAtiva === "QUEM SOMOS" && styles.botaoMenuAtivo
          ]}
        >
          <Text style={[
            styles.link, 
            secaoAtiva === "QUEM SOMOS" && styles.linkAtivo,
            { fontSize: linkFontSize }
          ]}>
            QUEM SOMOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setSecaoAtiva("O QUE FAZEMOS")}
          style={[
            styles.botaoMenu,
            isMobile && styles.botaoMenuMobile,
            secaoAtiva === "O QUE FAZEMOS" && styles.botaoMenuAtivo
          ]}
        >
          <Text style={[
            styles.link, 
            secaoAtiva === "O QUE FAZEMOS" && styles.linkAtivo,
            { fontSize: linkFontSize }
          ]}>
            O QUE FAZEMOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setSecaoAtiva("NOSSA MISSÃO")}
          style={[
            styles.botaoMenu,
            isMobile && styles.botaoMenuMobile,
            secaoAtiva === "NOSSA MISSÃO" && styles.botaoMenuAtivo
          ]}
        >
          <Text style={[
            styles.link, 
            secaoAtiva === "NOSSA MISSÃO" && styles.linkAtivo,
            { fontSize: linkFontSize }
          ]}>
            NOSSA MISSÃO
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <View style={[styles.conteudo, { flexDirection: isMobile ? "column" : "row" }]}>
        <Image
          source={conteudo[secaoAtiva].imagem}
          style={{
            width: imageSize,
            height: imageSize,
            marginRight: isMobile ? 0 : 15,
            marginBottom: isMobile ? 15 : 0,
            borderRadius: 10,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />

        <View style={styles.conteudoTexto}>
          {conteudo[secaoAtiva].lista ? (
            <View style={styles.listaContainer}>
              {conteudo[secaoAtiva].lista.map((item, index) => (
                <View key={index} style={styles.itemListaContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.itemLista, { fontSize, lineHeight }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.texto, { fontSize, lineHeight }]}>
              {conteudo[secaoAtiva].texto}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    padding: 20,
    backgroundColor: "#2c84be",
    flex: 1,
    width: "100%",
    borderRadius: 0,
    alignItems: "center",
    marginBottom: 0,
  },
  menu: {
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 5,
    width: "100%",
  },
  botaoMenu: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    marginVertical: 2,
  },
  botaoMenuMobile: {
    minWidth: "90%",
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  botaoMenuAtivo: {
    backgroundColor: "#2B7BB9",
    borderColor: "#fff",
  },
  link: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  linkAtivo: {
    color: "#fff",
  },
  conteudo: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  conteudoTexto: {
    flex: 1,
    justifyContent: "center",
  },
  texto: {
    color: "#000",
    textAlign: "justify",
    textAlignVertical: "center",
  },
  listaContainer: {
    width: "100%",
  },
  itemListaContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    width: "100%",
  },
  bullet: {
    color: "#000",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  itemLista: {
    color: "#000",
    flex: 1,
    textAlign: "left",
  },
});

export default Apresentacao;