// componentes/Cadastro.jsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Platform
} from "react-native";
import ondaTopo from "../assets/ondaTopo.png";
import Input from "../componentes/Input";
import LocationPicker from "../componentes/LocationPicker";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import Toast from 'react-native-toast-message';
import { useNavigation } from "@react-navigation/native";
import { USER_TYPES } from '../services/firebaseConfig';

const Cadastro = () => {
    const { width } = useWindowDimensions();
    const contentWidth = width < 800 ? width : width * 0.6;

    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [SIAPE, setSIAPE] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [coordenadas, setCoordenadas] = useState(null);
    const [endereco, setEndereco] = useState({
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      complemento: "",
      referencia: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigation = useNavigation();

    const navigateToLogin = () => {
      navigation.navigate("Login");
    }

    const handleLocationSelect = (coordenadas) => {
      setCoordenadas(coordenadas);
      if (errors.coordenadas) {
        setErrors(prev => ({ ...prev, coordenadas: '' }));
      }
    };

    const handleAddressSelect = (enderecoSelecionado) => {
      setEndereco(prev => ({
        ...prev,
        rua: enderecoSelecionado.rua || prev.rua,
        bairro: enderecoSelecionado.bairro || prev.bairro,
        cidade: enderecoSelecionado.cidade || prev.cidade,
        estado: enderecoSelecionado.estado || prev.estado,
        cep: enderecoSelecionado.cep || prev.cep
      }));
    };

    const validateFields = () => {
      const newErrors = {};

      if (!email) newErrors.email = 'E-mail é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido';

      if (!nome) newErrors.nome = 'Nome é obrigatório';
      if (!sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório';
      if (!telefone) newErrors.telefone = 'Telefone é obrigatório';
      if (!SIAPE) newErrors.SIAPE = 'SIAPE é obrigatório';
      
      if (!senha) newErrors.senha = 'Senha é obrigatória';
      else if (senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      
      if (!confirmacao) newErrors.confirmacao = 'Confirmação de senha é obrigatória';
      else if (senha !== confirmacao) newErrors.confirmacao = 'As senhas não coincidem';
      
      if (!coordenadas) newErrors.coordenadas = 'Localização é obrigatória';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleCadastro = async () => {
      if (!validateFields()) {
        Toast.show({
          type: 'error',
          text1: 'Atenção',
          text2: 'Por favor, corrija os erros no formulário.'
        });
        return;
      }

      setLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          nome: nome,
          sobrenome: sobrenome,
          telefone: telefone,
          SIAPE: SIAPE,
          tipoUsuario: USER_TYPES.ADMINISTRADOR,
          coordenadas: coordenadas,
          endereco: {
            ...endereco,
            numero: endereco.numero || '',
            complemento: endereco.complemento || '',
            referencia: endereco.referencia || ''
          },
          createdAt: new Date(),
        });

        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Cadastro realizado com sucesso!'
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeAdm' }],
        });
      } catch (error) {
        console.error('Erro ao cadastrar:', error);
        let errorMessage = 'Ocorreu um erro durante o cadastro. Tente novamente.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este e-mail já está em uso.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'E-mail inválido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };

    const handleSenhaChange = (text) => {
      setSenha(text);
      if (confirmacao && text !== confirmacao) {
        setErrors(prev => ({ ...prev, confirmacao: 'As senhas não coincidem' }));
      } else if (confirmacao && text === confirmacao) {
        setErrors(prev => ({ ...prev, confirmacao: '' }));
      }
    };

    const handleConfirmacaoChange = (text) => {
      setConfirmacao(text);
      if (text !== senha) {
        setErrors(prev => ({ ...prev, confirmacao: 'As senhas não coincidem' }));
      } else {
        setErrors(prev => ({ ...prev, confirmacao: '' }));
      }
    };

    return(
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={[styles.topContainer, { width: contentWidth }]}>
                    <Image
                    source={ondaTopo}
                    style={[styles.image, { width: contentWidth }]}
                    resizeMode="contain"
                    />

                    <TouchableOpacity style={styles.setaSobreImagem}
                      onPress={navigateToLogin}
                    >
                        ←
                    </TouchableOpacity>

                    <Text style={styles.titleSobreImagem}>Cadastre-se!</Text>
                </View>

                <View style={[styles.content, { width: contentWidth }]}>
                    <View style={styles.containerDivisao}>
                        <Text style={styles.titulo}>Dados pessoais</Text>
                        <View style={styles.linhaAzul} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Digite seu e-mail"
                            keyboardType="email-address"
                            style={styles.input}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Nome"
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Digite seu nome"
                            style={styles.input}
                        />
                        {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Sobrenome"
                            value={sobrenome}
                            onChangeText={setSobrenome}
                            placeholder="Digite seu sobrenome"
                            style={styles.input}
                        />
                        {errors.sobrenome && <Text style={styles.errorText}>{errors.sobrenome}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Telefone"
                            value={telefone}
                            onChangeText={setTelefone}
                            placeholder="Digite seu telefone"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                        {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="SIAPE"
                            value={SIAPE}
                            onChangeText={setSIAPE}
                            placeholder="Digite seu SIAPE"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />
                        {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Senha"
                            value={senha}
                            onChangeText={handleSenhaChange}
                            placeholder="Digite sua senha (mín. 6 caracteres)"
                            secureTextEntry
                            style={styles.input}
                        />
                        {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Confirmação de Senha"
                            value={confirmacao}
                            onChangeText={handleConfirmacaoChange}
                            placeholder="Confirme sua senha"
                            secureTextEntry
                            style={styles.input}
                        />
                        {errors.confirmacao && <Text style={styles.errorText}>{errors.confirmacao}</Text>}
                    </View>

                    <View style={styles.containerDivisao}>
                        <Text style={styles.titulo}>Endereço</Text>
                        <View style={styles.linhaAzul} />
                    </View>

                    <View style={styles.mapContainer}>
                      <LocationPicker 
                        onLocationSelect={handleLocationSelect}
                        onAddressSelect={handleAddressSelect}
                      />
                      {errors.coordenadas && <Text style={styles.errorText}>{errors.coordenadas}</Text>}
                    </View>

                    <View style={styles.containerEndereco}>
                        <Input
                            label="Rua"
                            value={endereco.rua}
                            onChangeText={(text) => setEndereco({...endereco, rua: text})}
                            placeholder="Nome da rua"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Número"
                            value={endereco.numero}
                            onChangeText={(text) => setEndereco({...endereco, numero: text})}
                            placeholder="Número"
                            keyboardType="numeric"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Bairro"
                            value={endereco.bairro}
                            onChangeText={(text) => setEndereco({...endereco, bairro: text})}
                            placeholder="Bairro"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Cidade"
                            value={endereco.cidade}
                            onChangeText={(text) => setEndereco({...endereco, cidade: text})}
                            placeholder="Cidade"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Estado"
                            value={endereco.estado}
                            onChangeText={(text) => setEndereco({...endereco, estado: text})}
                            placeholder="Estado"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="CEP"
                            value={endereco.cep}
                            onChangeText={(text) => setEndereco({...endereco, cep: text})}
                            placeholder="Digite seu CEP"
                            keyboardType="numeric"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Complemento"
                            value={endereco.complemento}
                            onChangeText={(text) => setEndereco({...endereco, complemento: text})}
                            placeholder="Complemento (opcional)"
                            style={styles.inputEndereco}
                        />

                        <Input
                            label="Referência"
                            value={endereco.referencia}
                            onChangeText={(text) => setEndereco({...endereco, referencia: text})}
                            placeholder="Ponto de referência"
                            style={styles.inputEndereco}
                        />
                    </View>

                    <View style={styles.loginContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Login");
                            }}
                        >
                            <Text style={styles.loginText}>Já tem conta? Faça login!</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={[styles.botao, loading && styles.botaoDisabled]}
                      onPress={handleCadastro}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.textoBotao}>Cadastrar</Text>
                      )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

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
  },
  topContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    alignSelf: "center",
    marginTop: -35,
  },
  setaSobreImagem: {
    position: "absolute",
    top: "20%",
    left: "20%",
    transform: [{ translateX: -100 }, { translateY: -10 }],
    color: "#fff",
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleSobreImagem: {
    position: "absolute",
    top: "20%",
    left: "23%",
    transform: [{ translateX: -100 }, { translateY: -10 }],
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    alignItems: "center",
    paddingBottom: 30,
  },
  containerLink: {
    flex: 1,
    width: Platform.OS === 'web' ? "80%" : "90%",
  },
  link: {
    color: '#2685BF',
    textAlign: 'left',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    width: Platform.OS === 'web' ? "80%" : "90%",
    marginBottom: 15,
  },
  input: {
    width: '100%',
  },
  botao: {
    marginTop: 20,
    backgroundColor: "#2685BF",
    paddingVertical: 12,
    borderRadius: 8,
    width: Platform.OS === 'web' ? "50%" : "80%",
    alignItems: "center",
  },
  botaoDisabled: {
    backgroundColor: "#99cde0",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  containerEndereco: {
    width: Platform.OS === 'web' ? '80%' : '90%',
    marginTop: 10,
  },
  inputEndereco: {
    width: '100%',
    marginBottom: 10,
  },
  containerDivisao: {
    display: 'flex',
    width: Platform.OS === 'web' ? '80%' : '90%',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 14,
    color: '#2196F3',
    width: Platform.OS === 'web' ? '20%' : '30%',
    minWidth: 100,
  },
  linhaAzul: {
    height: 2,
    backgroundColor: '#2196F3',
    flex: 1,
  },
  loginContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  loginText: {
    color: '#2685BF',
    textDecorationLine: 'underline',
  },
  mapContainer: {
    width: Platform.OS === 'web' ? '80%' : '90%',
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default Cadastro;