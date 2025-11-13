// navigation/AnalistaStack.js - VERSÃO COMPLETA
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeAnalista from '../telas/HomeAnalista';
import MinhasSolicitacoes from '../telas/MinhasSolicitacoes';
import NovaSolicitacao from '../telas/NovaSolicitacao';
import PerfilUsuario from '../telas/PerfilUsuario';
import NotificacoesAnalista from '../telas/NotificacoesAnalista';
import GerenciarRelatorios from '../telas/GerenciarRelatorios';

import GerenciarPocos from '../telas/GerenciarPocos';
import GerenciarVisitas from '../telas/GerenciarVisitas';
import GerenciarAnalises from '../telas/GerenciarAnalises';
import GerenciarUsuarios from '../telas/GerenciarUsuarios';

const Stack = createNativeStackNavigator();

const AnalistaStack = () => {
  const isWeb = typeof window !== 'undefined' && window.document;
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeAnalista" component={HomeAnalista} />
      <Stack.Screen 
        name="MinhasSolicitacoes" 
        component={MinhasSolicitacoes}
        options={{ 
          headerShown: isWeb,
          title: "Minhas Solicitações" 
        }}
      />
      <Stack.Screen 
        name="NovaSolicitacao" 
        component={NovaSolicitacao}
        options={{ 
          headerShown: isWeb,
          title: "Nova Solicitação" 
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
        name="GerenciarAnalises" 
        component={GerenciarAnalises}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Análises" 
        }}
      />
      <Stack.Screen 
        name="GerenciarUsuarios" 
        component={GerenciarUsuarios}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Usuários" 
        }}
      />
      <Stack.Screen 
        name="NotificacoesAnalista" 
        component={NotificacoesAnalista}
        options={{ 
          headerShown: isWeb,
          title: "Notificações" 
        }}
      />
      <Stack.Screen 
        name="GerenciarRelatorios" 
        component={GerenciarRelatorios}
        options={{ 
          headerShown: isWeb,
          title: "GerenciarRelatorios" 
        }}
      />
    </Stack.Navigator>
  );
};

export default AnalistaStack;