// componentes/AddPocosAnalista.js
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator
} from "react-native";
import InputMapa from './InputMapa';
import SelecaoBuscaSeguro from './SelecaoBusca';
import { useAuth } from '../contexts/authContext';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddPocosAnalista = ({ onAdicionarPoco }) => {
    const { user, userData } = useAuth();
    const [localizacao, setLocalizacao] = useState(null);
    const [observacoes, setObservacoes] = useState('');
    const [proprietario, setProprietario] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);

    // Buscar TODOS os usuários (analista pode ver todos)
    useEffect(() => {
        console.log('📡 AddPocosAnalista: Buscando TODOS os usuários');
        
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('nome'));
        
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const usuariosData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setUsuarios(usuariosData);
                setCarregandoUsuarios(false);
                console.log(`✅ ${usuariosData.length} usuários carregados`);
            },
            (error) => {
                console.error('❌ Erro ao carregar usuários:', error);
                Alert.alert('Erro', 'Não foi possível carregar a lista de usuários');
                setCarregandoUsuarios(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleSolicitarCadastro = async () => {
        console.log('AddPocosAnalista: Iniciando solicitação de cadastro...');

        if (!localizacao) {
            Alert.alert('Erro', 'Por favor, selecione a localização do poço no mapa.');
            return;
        }

        if (!localizacao.latitude || !localizacao.longitude) {
            Alert.alert('Erro', 'Localização inválida. Selecione novamente no mapa.');
            return;
        }

        if (!proprietario) {
            Alert.alert('Erro', 'Por favor, selecione o proprietário do poço.');
            return;
        }

        try {
            const wellData = {
                localizacao: {
                    latitude: localizacao.latitude,
                    longitude: localizacao.longitude
                },
                nomeProprietario: proprietario.nome,
                observacoes: observacoes.trim(),
                userId: proprietario.id, // ID do proprietário selecionado
                tipoCadastro: 'solicitacao_analista',
                status: 'pendente_aprovacao',
                criadoPor: user.uid,
                solicitante: userData?.nome || 'Analista',
                dataSolicitacao: new Date().toISOString()
            };

            console.log('AddPocosAnalista: Dados da solicitação:', wellData);
            await onAdicionarPoco(wellData);
            
            // Limpar formulário
            setLocalizacao(null);
            setProprietario(null);
            setObservacoes('');
            
            Alert.alert(
                'Solicitação Enviada!', 
                'Sua solicitação de cadastro de poço foi enviada para aprovação do administrador.',
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            console.error('AddPocosAnalista: Erro na solicitação:', error);
            Alert.alert('Erro', `Não foi possível enviar a solicitação: ${error.message}`);
        }
    };

    const opcoesUsuarios = usuarios.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        ...usuario
    }));

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.titulo}>Solicitar Cadastro de Poço</Text>
            <Text style={styles.subtitle}>Analista</Text>

            <View style={styles.formContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>ℹ️ Fluxo do Analista:</Text>
                    <Text style={styles.infoText}>
                        • Selecione QUALQUER usuário como proprietário{'\n'}
                        • Solicitação enviada para aprovação do admin{'\n'}
                        • Após aprovado, o poço aparecerá no sistema{'\n'}
                        • Você receberá uma notificação quando aprovado
                    </Text>
                </View>

                {/* Input de Localização com Mapa */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Localização do Poço *</Text>
                    <InputMapa
                        value={localizacao}
                        onChange={setLocalizacao}
                        placeholder="Clique para selecionar a localização no mapa"
                    />
                </View>

                {/* Seleção de Proprietário */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Proprietário *</Text>
                    {carregandoUsuarios ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#2685BF" />
                            <Text style={styles.loadingText}>Carregando usuários...</Text>
                        </View>
                    ) : (
                        <SelecaoBuscaSeguro
                            value={proprietario}
                            onSelect={setProprietario}
                            options={opcoesUsuarios}
                            placeholder="Selecione o proprietário do poço"
                            searchKeys={['nome', 'email']}
                            displayKey="nome"
                        />
                    )}
                </View>

                {/* Input de Observações */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Observações/Justificativa</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={observacoes}
                        onChangeText={setObservacoes}
                        placeholder="Justifique a necessidade deste cadastro..."
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Botão de Solicitar */}
                <TouchableOpacity
                    style={[
                        styles.solicitarButton,
                        (!localizacao || !proprietario) && styles.buttonDisabled
                    ]}
                    onPress={handleSolicitarCadastro}
                    disabled={!localizacao || !proprietario}
                >
                    <Text style={styles.solicitarButtonText}>📨 SOLICITAR CADASTRO</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#2685BF',
        paddingTop: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    formContainer: {
        padding: 16,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 50,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2685BF',
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2685BF',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
    },
    solicitarButton: {
        backgroundColor: '#2685BF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        minHeight: 50,
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    solicitarButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddPocosAnalista;