// navigation/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../telas/Login';
import Cadastro from '../telas/Cadastro';
import TipoUsuario from '../telas/TipoUsuario';
import CadastroAnalista from '../telas/CadastroAnalista';
import CadastroAdm from '../telas/CadastroAdm';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="TipoUsuario" component={TipoUsuario} />
      <Stack.Screen name="CadastroAnalista" component={CadastroAnalista} />
      <Stack.Screen name="CadastroAdm" component={CadastroAdm} />
    </Stack.Navigator>
  );
};

export default AuthStack;