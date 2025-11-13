import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ondaTopo from "../assets/ondaTopo.png";

const VoltarHome = ({ navigation, tela = "Home", titulo = "Título" }) => {
    const { width } = useWindowDimensions();
    const contentWidth = width < 800 ? width : width * 0.8;

    const voltar = () => {
        navigation.navigate(tela);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.topContainer, { width: contentWidth }]}>
                <Image
                    source={ondaTopo}
                    style={[styles.image, { width: contentWidth }]}
                    resizeMode="contain"
                />
                
                {/* Container principal com flex row */}
                <View style={[styles.headerContent, { width: contentWidth }]}>
                    {/* Botão de voltar */}
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={voltar}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        <Text style={styles.titleSobreImagem}>{titulo}</Text>
                    </TouchableOpacity>
                    
                    
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white', // Fundo branco para todo o componente
    },
    topContainer: {
        position: "relative",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: 'white', // Fundo branco
    },
    image: {
        alignSelf: "center",
        marginTop: -35,
        backgroundColor: 'white', // Fundo branco atrás da imagem
    },
    headerContent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 15,
        height: 60,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    titleSobreImagem: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    placeholder: {
        width: 40, // Ajustado para o tamanho do ícone
    },
});

export default VoltarHome;