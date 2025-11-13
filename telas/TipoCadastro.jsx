import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

const TipoCadastro = () => {
    const navigation = useNavigation();
    
    const navigateToCadastrarAnalista = () => {
        navigation.navigate("CadastrarAnalista");
    }

    const navigateToCadastrarAdm = () => {
        navigation.navigate("CadastrarAdm");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Escolha como você quer se cadastrar</Text>
            
            <TouchableOpacity
                onPress={navigateToCadastrarAnalista}
                style={styles.botao}
            >
                <Text style={styles.textoBotao}>Quero me cadastrar como analista</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={navigateToCadastrarAdm}
                style={styles.botao}
            >
                <Text style={styles.textoBotao}>Quero me cadastrar como administrador</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    botao: {
        width: '30%',
        backgroundColor: '#2685BF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    textoBotao: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TipoCadastro;