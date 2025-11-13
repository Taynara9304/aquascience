// navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeAdm from '../telas/HomeAdm';
import GerenciarUsuarios from '../telas/GerenciarUsuarios';
import GerenciarAnalises from '../telas/GerenciarAnalises';
import GerenciarVisitas from '../telas/GerenciarVisitas';
import GerenciarPocos from '../telas/GerenciarPocos';
import GerenciarRelatorios from '../telas/GerenciarRelatorios';
import PerfilUsuario from '../telas/PerfilUsuario';
import GerenciarSolicitacoesWhatsApp from '../telas/GerenciarSolicitacoesWhatsApp';
import CadastrarVisitaWhatsApp from '../telas/CadastrarVisitaWhatsApp';
import NotificacoesAdm from '../telas/NotificacoesAdm';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  const isWeb = typeof window !== 'undefined' && window.document;
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeAdm" component={HomeAdm} />
      <Stack.Screen 
        name="GerenciarUsuarios" 
        component={GerenciarUsuarios}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Usuários" 
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
        name="GerenciarVisitas" 
        component={GerenciarVisitas}
        options={{ 
          headerShown: isWeb,
          title: "Gerenciar Visitas" 
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
        name="PerfilUsuario" 
        component={PerfilUsuario}
        options={{ 
          headerShown: isWeb,
          title: "Meu Perfil" 
        }}
      />
      <Stack.Screen 
        name="GerenciarSolicitacoesWhatsApp" 
        component={GerenciarSolicitacoesWhatsApp}
      />
      <Stack.Screen 
        name="CadastrarVisitaWhatsApp" 
        component={CadastrarVisitaWhatsApp}
      />
      <Stack.Screen 
        name="NotificacoesAdm" 
        component={NotificacoesAdm}
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
          title: "Gerenciar Relatórios" 
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminStack;