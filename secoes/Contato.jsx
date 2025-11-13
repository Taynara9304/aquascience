import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import imgInstagram from "../assets/Instagram.png";
import imgWhatsApp from "../assets/WhatsApp.png";
import imgIfpr from "../assets/iconeIfpr2.png";

const Contato = () => {
  const abrirLink = async (url) => {
    // Verifica se o link pode ser aberto
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      // Abre o link
      await Linking.openURL(url);
    } else {
      console.log("Não foi possível abrir o link: " + url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerContato}>
        <Text style={styles.titulo}>CONTATO</Text>
        <Text style={styles.texto}>hidrocascavel.ifpr@gmail.com</Text>
        <View style={styles.containerImagem}>
          <TouchableOpacity
            onPress={() =>
              abrirLink("https://www.instagram.com/hidrocascavel_ifpr/")
            }
          >
            <Image style={styles.imagem} source={imgInstagram} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.imagem} source={imgWhatsApp} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => abrirLink("https://ifpr.edu.br/cascavel/")}
          >
            <Image style={styles.imagem} source={imgIfpr} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Rodapé aprimorado sem a linha preta */}
      <View style={styles.containerRodape}>
        <Text style={styles.ano}>
          2025 © <Text style={styles.bold}>HidroCascavel</Text>
        </Text>
        <Text style={styles.credito}>
          {" "}
          Feito por <Text style={styles.nome}>Lucas & Taynara</Text>{" "}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  containerContato: {
    backgroundColor: "#266188",
    alignItems: "center",
    padding: 10,
  },
  containerImagem: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  imagem: {
    width: 30,
    height: 30,
  },
  titulo: {
    fontSize: 30,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  texto: {
    color: "#ffffff",
    marginBottom: 10,
  },
  containerRodape: {
    backgroundColor: "#192F38",
    alignItems: "center",
    paddingVertical: 12,
  },
  ano: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  bold: {
    fontWeight: "bold",
  },
  credito: {
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 4,
  },
  nome: {
    color: "#1da7a7",
    fontStyle: "italic",
  },
});

export default Contato;