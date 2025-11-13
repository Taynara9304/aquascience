// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/authContext';

import TelaInicial from './telas/TelaInicial';
import Login from './telas/Login';
import Cadastro from './telas/Cadastro';
import HomeAdm from './telas/HomeAdm';
import GerenciarUsuarios from './telas/GerenciarUsuarios';
import GerenciarAnalises from './telas/GerenciarAnalises';
import GerenciarVisitas from './telas/GerenciarVisitas';
import GerenciarPocos from './telas/GerenciarPocos';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Usuário logado - telas autenticadas
        <Stack.Screen name="HomeAdm" component={HomeAdm} />
        // ... outras telas autenticadas
      ) : (
        // Usuário não logado - telas de auth
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;