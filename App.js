// App.js - VERSÃO CORRIGIDA E FUNCIONAL
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/authContext'; // Verifique o caminho
import Toast from 'react-native-toast-message';
import { toastConfig } from './services/toastConfig'; // Verifique o caminho
import { ActivityIndicator, View, Text } from 'react-native';
import DeixarAvaliacao from './telas/DeixarAvaliacao';

// Stacks
import ProprietarioStack from './navigation/ProprietarioStack';
import AnalistaStack from './navigation/AnalistaStack';
import AdministradorStack from './navigation/AdminStack';

// Telas de Auth
import TelaInicial from './telas/TelaInicial';
import Login from './telas/Login';
import Cadastro from './telas/Cadastro';
import CadastroAnalista from './telas/CadastroAnalista';
import CadastroAdm from './telas/CadastroAdm';
import TipoUsuario from './telas/TipoUsuario';
import TipoCadastro from './telas/TipoCadastro';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  // 1. Determinar qual é a ROTA INICIAL
  let initialRoute = "TelaInicial"; // Padrão: usuário deslogado

  if (user && userData?.tipoUsuario) {
    // Usuário está logado, vamos definir a rota inicial correta
    switch (userData.tipoUsuario) {
      case 'proprietario':
        initialRoute = "ProprietarioStack"; // <-- Nome da tela do stack
        break;
      case 'analista':
        initialRoute = "AnalistaStack";
        break;
      case 'administrador':
        initialRoute = "AdministradorStack";
        break;
      default:
        initialRoute = "TelaInicial"; // Fallback
    }
  }

  return (
    // 2. Definir a rota inicial DINAMICAMENTE
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute} // <--- A MÁGICA ACONTECE AQUI
    >
      {/* 3. DEFINIR TODAS AS TELAS SEMPRE 
           Não usamos mais "if/else" ou ternário aqui dentro 
      */}

      {/* === TELAS PÚBLICAS (Sempre existem) === */}
      <Stack.Screen name="TelaInicial" component={TelaInicial} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="TipoUsuario" component={TipoUsuario} />
      <Stack.Screen name="TipoCadastro" component={TipoCadastro} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="CadastroAnalista" component={CadastroAnalista} />
      <Stack.Screen name="CadastroAdm" component={CadastroAdm} />

      {/* === TELAS/STACKS PRIVADAS (Sempre existem) === */}
      {/* Damos a elas um nome único */}
      <Stack.Screen name="ProprietarioStack" component={ProprietarioStack} />
      <Stack.Screen name="AnalistaStack" component={AnalistaStack} />
      <Stack.Screen name="AdministradorStack" component={AdministradorStack} />
      <Stack.Screen name='DeixarAvaliacao' component={DeixarAvaliacao} />

      
      
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;