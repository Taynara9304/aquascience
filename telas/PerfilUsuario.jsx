// telas/PerfilUsuario.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/authContext';
import Input from '../componentes/Input';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Toast from 'react-native-toast-message';

const PerfilUsuario = ({ navigation }) => {
  const { user, userData, logout, buscarDadosUsuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados para os dados editáveis
  const [dados, setDados] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    email: ''
  });

  // Estados para endereço
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
    referencia: ''
  });

  // Carrega os dados do usuário quando a tela abre
  useEffect(() => {
    if (userData) {
      setDados({
        nome: userData.nome || '',
        sobrenome: userData.sobrenome || '',
        telefone: userData.telefone || '',
        email: userData.email || ''
      });

      setEndereco({
        rua: userData.endereco?.rua || '',
        numero: userData.endereco?.numero || '',
        bairro: userData.endereco?.bairro || '',
        cidade: userData.endereco?.cidade || '',
        estado: userData.endereco?.estado || '',
        cep: userData.endereco?.cep || '',
        complemento: userData.endereco?.complemento || '',
        referencia: userData.endereco?.referencia || ''
      });
    }
  }, [userData]);

  const validarCampos = () => {
    const novosErrors = {};

    if (!dados.nome.trim()) novosErrors.nome = 'Nome é obrigatório';
    if (!dados.sobrenome.trim()) novosErrors.sobrenome = 'Sobrenome é obrigatório';
    if (!dados.telefone.trim()) novosErrors.telefone = 'Telefone é obrigatório';
    
    if (!endereco.rua.trim()) novosErrors.rua = 'Rua é obrigatória';
    if (!endereco.bairro.trim()) novosErrors.bairro = 'Bairro é obrigatório';
    if (!endereco.cidade.trim()) novosErrors.cidade = 'Cidade é obrigatória';
    if (!endereco.estado.trim()) novosErrors.estado = 'Estado é obrigatório';
    if (!endereco.cep.trim()) novosErrors.cep = 'CEP é obrigatório';

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarCampos()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    setCarregando(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        telefone: dados.telefone,
        endereco: {
          rua: endereco.rua,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          cep: endereco.cep,
          complemento: endereco.complemento,
          referencia: endereco.referencia
        },
        atualizadoEm: new Date()
      });

      // Atualiza os dados no contexto
      await buscarDadosUsuario(user);

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Dados atualizados com sucesso!'
      });

      setEditando(false);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar os dados. Tente novamente.'
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = () => {
    // Restaura os dados originais
    setDados({
      nome: userData.nome || '',
      sobrenome: userData.sobrenome || '',
      telefone: userData.telefone || '',
      email: userData.email || ''
    });

    setEndereco({
      rua: userData.endereco?.rua || '',
      numero: userData.endereco?.numero || '',
      bairro: userData.endereco?.bairro || '',
      cidade: userData.endereco?.cidade || '',
      estado: userData.endereco?.estado || '',
      cep: userData.endereco?.cep || '',
      complemento: userData.endereco?.complemento || '',
      referencia: userData.endereco?.referencia || ''
    });

    setEditando(false);
    setErrors({});
  };

  const confirmarLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout, style: 'destructive' }
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.carregandoContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.carregandoTexto}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {dados.nome.charAt(0)}{dados.sobrenome.charAt(0)}
            </Text>
          </View>
          <Text style={styles.nomeUsuario}>
            {dados.nome} {dados.sobrenome}
          </Text>
          <Text style={styles.tipoUsuario}>
            {userData.tipoUsuario === 'proprietario' && 'Proprietário'}
            {userData.tipoUsuario === 'analista' && 'Analista'}
            {userData.tipoUsuario === 'administrador' && 'Administrador'}
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.botoesAcao}>
          {!editando ? (
            <TouchableOpacity 
              style={styles.botaoEditar}
              onPress={() => setEditando(true)}
            >
              <Text style={styles.textoBotaoEditar}>Editar Perfil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.botoesEdicao}>
              <TouchableOpacity 
                style={[styles.botao, styles.botaoCancelar]}
                onPress={handleCancelar}
                disabled={carregando}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.botao, styles.botaoSalvar]}
                onPress={handleSalvar}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoBotaoSalvar}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dados Pessoais */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Dados Pessoais</Text>
          <View style={styles.linhaDivisoria} />

          <Input
            label="Nome"
            value={dados.nome}
            onChangeText={(text) => setDados({...dados, nome: text})}
            placeholder="Seu nome"
            editable={editando}
            style={styles.input}
          />
          {errors.nome && <Text style={styles.erroTexto}>{errors.nome}</Text>}

          <Input
            label="Sobrenome"
            value={dados.sobrenome}
            onChangeText={(text) => setDados({...dados, sobrenome: text})}
            placeholder="Seu sobrenome"
            editable={editando}
            style={styles.input}
          />
          {errors.sobrenome && <Text style={styles.erroTexto}>{errors.sobrenome}</Text>}

          <Input
            label="Telefone"
            value={dados.telefone}
            onChangeText={(text) => setDados({...dados, telefone: text})}
            placeholder="Seu telefone"
            keyboardType="phone-pad"
            editable={editando}
            style={styles.input}
          />
          {errors.telefone && <Text style={styles.erroTexto}>{errors.telefone}</Text>}

          <Input
            label="E-mail"
            value={dados.email}
            placeholder="Seu e-mail"
            editable={false}
            style={styles.inputDesabilitado}
          />
          <Text style={styles.textoAjuda}>E-mail não pode ser alterado</Text>

          {/* Campos específicos por tipo de usuário */}
          {userData.matricula && (
            <Input
              label="Matrícula"
              value={userData.matricula}
              placeholder="Sua matrícula"
              editable={false}
              style={styles.inputDesabilitado}
            />
          )}

          {userData.siape && (
            <Input
              label="SIAPE"
              value={userData.siape}
              placeholder="Seu SIAPE"
              editable={false}
              style={styles.inputDesabilitado}
            />
          )}
        </View>

        {/* Endereço */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Endereço</Text>
          <View style={styles.linhaDivisoria} />

          <View style={styles.linhaEndereco}>
            <View style={styles.campoMetade}>
              <Input
                label="Rua"
                value={endereco.rua}
                onChangeText={(text) => setEndereco({...endereco, rua: text})}
                placeholder="Nome da rua"
                editable={editando}
                style={styles.input}
              />
              {errors.rua && <Text style={styles.erroTexto}>{errors.rua}</Text>}
            </View>

            <View style={styles.campoMetade}>
              <Input
                label="Número"
                value={endereco.numero}
                onChangeText={(text) => setEndereco({...endereco, numero: text})}
                placeholder="Nº"
                keyboardType="numeric"
                editable={editando}
                style={styles.input}
              />
            </View>
          </View>

          <Input
            label="Bairro"
            value={endereco.bairro}
            onChangeText={(text) => setEndereco({...endereco, bairro: text})}
            placeholder="Seu bairro"
            editable={editando}
            style={styles.input}
          />
          {errors.bairro && <Text style={styles.erroTexto}>{errors.bairro}</Text>}

          <View style={styles.linhaEndereco}>
            <View style={styles.campoMetade}>
              <Input
                label="Cidade"
                value={endereco.cidade}
                onChangeText={(text) => setEndereco({...endereco, cidade: text})}
                placeholder="Sua cidade"
                editable={editando}
                style={styles.input}
              />
              {errors.cidade && <Text style={styles.erroTexto}>{errors.cidade}</Text>}
            </View>

            <View style={styles.campoMetade}>
              <Input
                label="Estado"
                value={endereco.estado}
                onChangeText={(text) => setEndereco({...endereco, estado: text})}
                placeholder="UF"
                editable={editando}
                style={styles.input}
              />
              {errors.estado && <Text style={styles.erroTexto}>{errors.estado}</Text>}
            </View>
          </View>

          <Input
            label="CEP"
            value={endereco.cep}
            onChangeText={(text) => setEndereco({...endereco, cep: text})}
            placeholder="Seu CEP"
            keyboardType="numeric"
            editable={editando}
            style={styles.input}
          />
          {errors.cep && <Text style={styles.erroTexto}>{errors.cep}</Text>}

          <Input
            label="Complemento"
            value={endereco.complemento}
            onChangeText={(text) => setEndereco({...endereco, complemento: text})}
            placeholder="Complemento (opcional)"
            editable={editando}
            style={styles.input}
          />

          <Input
            label="Ponto de Referência"
            value={endereco.referencia}
            onChangeText={(text) => setEndereco({...endereco, referencia: text})}
            placeholder="Ponto de referência"
            editable={editando}
            style={styles.input}
          />
        </View>

        {/* Botão de Logout */}
        <TouchableOpacity 
          style={styles.botaoLogout}
          onPress={confirmarLogout}
        >
          <Text style={styles.textoBotaoLogout}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.espacoFinal} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  carregandoTexto: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#2685BF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarTexto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2685BF',
  },
  nomeUsuario: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tipoUsuario: {
    fontSize: 16,
    color: '#e3f2fd',
    fontWeight: '500',
  },
  botoesAcao: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  botaoEditar: {
    backgroundColor: '#2685BF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotaoEditar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botoesEdicao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
  },
  textoBotaoCancelar: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secao: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 10,
  },
  linhaDivisoria: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  inputDesabilitado: {
    marginBottom: 5,
    opacity: 0.7,
  },
  textoAjuda: {
    fontSize: 12,
    color: '#666',
    marginTop: -5,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  erroTexto: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 5,
  },
  linhaEndereco: {
    flexDirection: 'row',
    gap: 10,
  },
  campoMetade: {
    flex: 1,
  },
  botaoLogout: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  textoBotaoLogout: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  espacoFinal: {
    height: 20,
  },
});

export default PerfilUsuario;