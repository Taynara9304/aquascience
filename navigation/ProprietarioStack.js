// navigation/ProprietarioStack.js - VERSÃO COMPLETA
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeProprietario from '../telas/HomeProprietario';
import MeusDados from '../telas/MeusDados';
import MinhasVisitas from '../telas/MinhasVisitas';
import PerfilUsuario from '../telas/PerfilUsuario';
import NotificacoesProprietario from '../telas/NotificacoesProprietario';

// ✅ ADICIONE ESTAS IMPORTACÕES
import GerenciarPocos from '../telas/GerenciarPocos';
import GerenciarVisitas from '../telas/GerenciarVisitas';

const Stack = createNativeStackNavigator();

const ProprietarioStack = () => {
  const isWeb = typeof window !== 'undefined' && window.document;
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeProprietario" component={HomeProprietario} />
      <Stack.Screen 
        name="MeusDados" 
        component={MeusDados}
        options={{ 
          headerShown: isWeb,
          title: "Meus Dados" 
        }}
      />
      <Stack.Screen 
        name="MinhasVisitas" 
        component={MinhasVisitas}
        options={{ 
          headerShown: isWeb,
          title: "Minhas Visitas" 
        }}
      />
      <Stack.Screen 
        name="PerfilUsuario" 
        component={PerfilUsuario}
        options={{ 
          headerShown: isWeb,
          title: "Meu Perfil" 
        }}
      />
      
      {/* ✅ ADICIONE ESTAS NOVAS ROTAS */}
      <Stack.Screen 
        name="GerenciarPocos" 
        component={GerenciarPocos}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Poços" 
        }}
      />
      <Stack.Screen 
        name="GerenciarVisitas" 
        component={GerenciarVisitas}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Visitas" 
        }}
      />
      <Stack.Screen 
        name="NotificacoesProprietario" 
        component={NotificacoesProprietario}
        options={{ 
          headerShown: isWeb,
          title: "Notificações" 
        }}
      />
    </Stack.Navigator>
  );
};

export default ProprietarioStack;