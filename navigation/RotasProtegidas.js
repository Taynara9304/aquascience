// navigation/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/authContext';
import Loading from '../componentes/Loading';

const RotasProtegidas = ({ children, allowedTypes }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Verificando permissões..." />;
  }

  if (!user) {
    return <Loading message="Redirecionando..." />;
  }

  // Verifica se o tipo de usuário está nos tipos permitidos
  if (allowedTypes && !allowedTypes.includes(user.tipo)) {
    return <Loading message="Acesso não autorizado..." />;
  }

  return children;
};

export default RotasProtegidas;