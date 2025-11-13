import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const BotaoFuncionalidades = text => {
    return (
        <View style={styles.container} >
            <TouchableOpacity>
                <Text style={styles.texto}>{text.texto}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            width: 300,
            height: 50,
            backgroundColor: '#455bbcff',
            display: 'flex',
            justifyContent: "center",
            alignItems: 'center',
            borderRadius: 10,
        },
        texto: {
            color: '#ffffff'
        },
    }
)

export default BotaoFuncionalidades;