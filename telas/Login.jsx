// telas/Login.js - VERSÃO ATUALIZADA
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import ondaTopo from "../assets/ondaTopo.png";
import ondaBaixo from "../assets/ondaBaixo.png";
import Input from "../componentes/Input";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import Toast from 'react-native-toast-message';
import LogoHidroCvel from '../assets/logoHidroCascavel.png';

const Login = ({ navigation }) => {
  let { width } = useWindowDimensions();
  const isCellPhone = width < 800;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, userData } = useAuth();

  // ✅ CORREÇÃO: Redirecionamento automático para os Stacks corretos
  useEffect(() => {
    console.log('🔍 Login - Estado do usuário:', user ? `Logado: ${user.uid}` : 'Deslogado');
    console.log('📊 Dados do usuário:', userData);
    
    if (user && userData) {
      console.log('✅ Usuário logado com dados, redirecionando para o Stack correto...');
      
      // Pequeno delay para garantir que tudo foi carregado
      const timer = setTimeout(() => {
        redirecionarParaStackCorreto(userData.tipoUsuario);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, userData, navigation]);

  // ✅ FUNÇÃO: Redirecionar para o Stack correto
  const redirecionarParaStackCorreto = (tipoUsuario) => {
    console.log('🎯 Redirecionando para Stack do tipo:', tipoUsuario);
    
    switch (tipoUsuario) {
      case 'administrador':
      case 'admin':
        console.log('🚀 Redirecionando para AdministradorStack');
        navigation.replace('AdministradorStack');
        break;
      case 'analista':
        console.log('🔬 Redirecionando para AnalistaStack');
        navigation.replace('AnalistaStack');
        break;
      case 'proprietario':
      case 'proprietário':
        console.log('🏠 Redirecionando para ProprietarioStack');
        navigation.replace('ProprietarioStack');
        break;
      default:
        console.log('❌ Tipo de usuário desconhecido:', tipoUsuario);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Tipo de usuário não reconhecido'
        });
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido';

    if (!senha) newErrors.senha = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Por favor, preencha todos os campos corretamente.'
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 Tentando login com:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const userFirebase = userCredential.user;

      console.log('✅ Usuário autenticado no Firebase:', userFirebase.uid);

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Login realizado com sucesso!'
      });

      // ✅ O redirecionamento agora é automático pelo useEffect
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }

      Toast.show({
        type: 'error',
        text1: 'Erro no login',
        text2: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se o usuário já estiver logado, mostrar loading
  if (user && userData) {
    const getNomeStack = () => {
      switch (userData.tipoUsuario) {
        case 'administrador':
        case 'admin':
          return 'Administrador';
        case 'analista':
          return 'Analista';
        case 'proprietario':
        case 'proprietário':
          return 'Proprietário';
        default:
          return 'Sistema';
      }
    };

    return (
      <View style={[styles.container, isCellPhone && styles.containerCellPhone, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Redirecionando para {getNomeStack()}...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, isCellPhone && styles.containerCellPhone]}>

        {!isCellPhone && (
          <View style={styles.containerLeft}>
            <Image source={LogoHidroCvel} style={styles.LogoHidroCvel} />
          </View>
        )}

        <View style={[styles.containerRight, isCellPhone && styles.containerRightCellPhone]}>
          <View style={[styles.topContainer]}>
            <Image
              source={ondaTopo}
              style={[styles.ondaTopo, isCellPhone && styles.ondaTopoCellPhone]}
              resizeMode="cover"
            />
            <Text style={[styles.titleSobreImagem, isCellPhone && styles.titleSobreImagemCellPhone]}>
              Olá, vamos fazer login!
            </Text>
          </View>

          <View style={[styles.content]}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Input
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu e-mail"
                  keyboardType="email-address"
                  style={{ width: "100%" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Senha"
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Digite sua senha"
                  secureTextEntry={true} // ✅ Agora com olho para mostrar/ocultar
                  style={{ width: "100%" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
              </View>

              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Cadastro");
                  }}
                >
                  <Text style={styles.loginText}>Não tem conta? Cadastre-se!</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.botao, isLoading && styles.botaoDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoBotao}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
              <Image
                source={ondaBaixo}
                style={[styles.ondaBaixo, isCellPhone && styles.ondaBaixoCellPhone]}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  containerCellPhone: {
    flexDirection: "column",
  },
  containerLeft: {
    backgroundColor: "#2685BF",
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  containerRight: {
    flex: 1,
    width: "60%"
  },
  containerRightCellPhone: {
    width: "100%",
  },
  LogoHidroCvel: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  topContainer: {
    position: "relative",
    alignItems: "center",
  },
  ondaTopo: {
    width: "100%",
    height: 140,
  },
  titleSobreImagem: {
    marginTop: 30,
    fontSize: 25,
    color: "#2685BF",
    fontWeight: "bold",
  },
  ondaBaixo: {
    width: "100%",
    height: 140,
  },
  ondaTopoCellPhone: {
    height: 100,
  },
  titleSobreImagemCellPhone: {
    marginTop: 70,
    fontSize: 20,
  },
  ondaBaixoCellPhone: {
    height: 100,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  inputContainer: {
    width: "80%",
    marginBottom: 20,
  },
  bottomContainer: {
    width: "100%",
    justifyContent: "flex-end"
  },
  botao: {
    marginTop: 20,
    backgroundColor: "#2685BF",
    paddingVertical: 15,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botaoDisabled: {
    backgroundColor: "#ccc",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    color: "#2685BF",
    marginTop: 5,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2685BF',
  },
});

export default Login;
