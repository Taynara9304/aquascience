import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const TipoUsuario = () => {
    const navigation = useNavigation();
        
    const navigateToCadastroAdm = () => {
        navigation.navigate("CadastroAdm");
    };

    const navigateToCadastroAnalista = () => {
        navigation.navigate("CadastroAnalista");
    };

    return (
        <View style={styles.container}>
            <View style={styles.outroContainer}>
                <Text style={styles.titulo}>Escolha como quer se cadastrar:</Text>

                <TouchableOpacity style={styles.botao}
                    onPress={navigateToCadastroAdm}
                >
                    <Text style={styles.texto}>Quero me cadastrar como administrador</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botao}
                    onPress={navigateToCadastroAnalista}
                >
                    <Text style={styles.texto}>Quero me cadastrar como analista</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
        },
        outroContainer: {
            width: '60%',
            height: '60%',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#d9e9f3ff',
            gap: 10,
        },
        botao: {
            backgroundColor: '#2685BF',
            padding: 10,
            borderRadius: 10,
            width: '35%',
            alignItems: 'center',
        },
        titulo: {
            fontSize: 18,
            marginBottom: 10,
        },
        texto: {
            color: 'white',
        }
    }
)

export default TipoUsuario;