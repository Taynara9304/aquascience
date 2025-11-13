import React from "react";
import { View, StyleSheet, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native';
import Calendario from "../componentes/Calendario";
import TabelaVisitas from '../componentes/TabelaVisitas';
import NavBar from '../componentes/NavBar';
import BotaoFuncionalidades from "../componentes/BotaoFuncionalidades";
import { useNavigation } from "@react-navigation/native";

const HomeProprietario = () => {
    const { width } = useWindowDimensions();
    const contentWidth = width < 800 ? width : width * 0.6;
    const isMobile = width < 800;
    
    const navigation = useNavigation();

    // Função simples para lidar com seleção de localização (se necessário)
    const handleLocationSelect = (location) => {
        console.log('Localização selecionada:', location);
    };

    const navigateToGerenciarAnalises = () => {
        navigation.navigate("GerenciarAnalises");
    };

    // Funções de navegação
    const navigateToGerenciarPocos = () => {
        navigation.navigate("GerenciarPocos");
    };

    const navigateToGerenciarVisitas = () => {
        navigation.navigate("GerenciarVisitas");
    };

    // Styles DEFINIDOS DENTRO do componente para acessar isMobile
    const styles = StyleSheet.create({
        scrollView: {
            flex: 1,
            backgroundColor: "#fff",
        },
        container: {
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "flex-start",
            margin: 'auto',
            padding: 10,
        },
        containerNavBar: {
            top: isMobile ? 20 : 0,
            width: '100%',
            height: 150,
        },
        containerPopUps: {
            top: isMobile ? -50 : 0,
            display: 'flex',
            justifyContent: "center",
            flexDirection: "row",
            flexWrap: 'wrap',
            gap: 10,
            width: '100%',
            marginVertical: 10,
        },
        containerItems: {
            top: isMobile ? -60 : 0,
            width: '100%',
            marginVertical: 10,
        },
        containerBotaoRelatorio: {
            width: '100%',
            marginTop: 20,
            marginBottom: 40,
            display: 'flex',
            justifyContent: "center",
            flexDirection: "row",
        },
        navItem: {
            margin: 5,
        }
    });

    return (
        <ScrollView style={styles.scrollView}>
            <View style={[styles.container, { width: contentWidth }]}>
                <View style={styles.containerNavBar}>
                    <NavBar isDashboard={true}/>
                </View>

                <View style={styles.containerItems}>
                    <Calendario />
                </View>

                <View style={styles.containerItems}>
                    <TabelaVisitas />
                </View>

                <View style={styles.containerPopUps}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={navigateToGerenciarPocos}
                    >
                        <BotaoFuncionalidades texto="Gerenciar poços" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={navigateToGerenciarVisitas}
                    >
                        <BotaoFuncionalidades texto="Gerenciar visitas" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={navigateToGerenciarAnalises}
                    >
                        <BotaoFuncionalidades texto="Gerenciar análises" />
                    </TouchableOpacity>
                </View>

                <View style={styles.containerBotaoRelatorio}>
                    <BotaoFuncionalidades texto="Gerar relatórios" />
                </View>
            </View>
        </ScrollView>
    );
}

export default HomeProprietario;