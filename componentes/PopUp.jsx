import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const PopUp = prop => {
    return (
        <View style={styles.container}>
            <View style={styles.numero}>
                <Text style={styles.numeroText}>{prop.num}</Text>
            </View>

            <Text style={styles.texto} numberOfLines={2}>{prop.texto}</Text>

            <View style={styles.containerIcone}>
                <Image style={styles.icone} source={prop.img} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 60,
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        margin: 5,
        borderColor: '#3D9DD9',
        borderWidth: 2,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    numero: {
        width: 40,
        height: 40,
        backgroundColor: "#F0F8FF",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3D9DD9',
        marginRight: 12,
    },
    numeroText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#3D9DD9",
    },
    containerIcone: {
        width: 44,
        height: 44,
        backgroundColor: "#3D9DD9",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    icone: {
        width: 24,
        height: 24,
    },
    texto: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        textAlign: "center",
        paddingHorizontal: 8,
    }
})

export default PopUp;