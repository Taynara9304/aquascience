// componentes/AddPocosProprietario.js - ATUALIZADO
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  TextInput
} from "react-native";
import InputMapa from './InputMapa';
import { useAuth } from '../contexts/authContext';
import { GeoPoint } from 'firebase/firestore'; // ✅ Importar GeoPoint

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddPocosProprietario = ({ onAdicionarPoco }) => {
    const { user, userData } = useAuth();
    const [localizacao, setLocalizacao] = useState(null);
    const [observacoes, setObservacoes] = useState('');
    const [nomeProprietario, setNomeProprietario] = useState('');

    // Preencher automaticamente o nome do proprietário
    useEffect(() => {
        if (userData?.nome) {
            setNomeProprietario(userData.nome);
        }
    }, [userData]);

    const handleCadastrar = async () => {
        console.log('AddPocosProprietario: Iniciando cadastro...');

        if (!localizacao) {
            Alert.alert('Erro', 'Por favor, selecione a localização do poço no mapa.');
            return;
        }

        if (!localizacao.latitude || !localizacao.longitude) {
            Alert.alert('Erro', 'Localização inválida. Selecione novamente no mapa.');
            return;
        }

        if (!nomeProprietario.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome do proprietário.');
            return;
        }

        try {
            // ✅ CORREÇÃO: Usar GeoPoint do Firebase
            const coordenadas = new GeoPoint(
                localizacao.latitude,
                localizacao.longitude
            );

            const wellData = {
                idProprietario: user.uid,
                nomeProprietario: nomeProprietario.trim(),
                localizacao: coordenadas, // ✅ GeoPoint
                observacoes: observacoes.trim(),
                userId: user.uid,
                tipoCadastro: 'direto_proprietario',
                status: 'ativo',
                criadoPor: user.uid
            };

            console.log('AddPocosProprietario: Dados do poço:', wellData);
            console.log('AddPocosProprietario: Tipo de localizacao:', typeof wellData.localizacao);
            
            await onAdicionarPoco(wellData);
            
            // Limpar formulário
            setLocalizacao(null);
            setObservacoes('');
            
            Alert.alert('Sucesso', 'Poço cadastrado com sucesso!');
            
        } catch (error) {
            console.error('AddPocosProprietario: Erro no cadastro:', error);
            Alert.alert('Erro', `Não foi possível cadastrar o poço: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastrar Meu Poço</Text>
            <Text style={styles.subtitle}>Proprietário</Text>

            <View style={styles.formContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Seus Poços:</Text>
                    <Text style={styles.infoText}>
                        • Cadastre SEUS poços{'\n'}
                        • Apenas você verá estes poços{'\n'}
                        • Use para solicitar visitas técnicas{'\n'}
                        • Acompanhe análises e relatórios
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
                    {localizacao && (
                        <Text style={styles.coordenadasText}>
                            📍 Selecionado: {localizacao.latitude.toFixed(6)}, {localizacao.longitude.toFixed(6)}
                        </Text>
                    )}
                </View>

                {/* Nome do Proprietário */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Proprietário *</Text>
                    <TextInput
                        style={styles.input}
                        value={nomeProprietario}
                        onChangeText={setNomeProprietario}
                        placeholder="Seu nome como proprietário"
                        editable={true}
                    />
                </View>

                {/* Input de Observações */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Observações</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={observacoes}
                        onChangeText={setObservacoes}
                        placeholder="Observações sobre o poço (opcional)"
                        multiline={true}
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Botão de Cadastrar */}
                <TouchableOpacity
                    style={[
                        styles.cadastrarButton,
                        (!localizacao || !nomeProprietario.trim()) && styles.buttonDisabled
                    ]}
                    onPress={handleCadastrar}
                    disabled={!localizacao || !nomeProprietario.trim()}
                >
                    <Text style={styles.cadastrarButtonText}>
                        ✅ CADASTRAR MEU POÇO
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
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
    helperText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    coordenadasText: {
        fontSize: 12,
        color: '#4CAF50',
        fontStyle: 'italic',
        marginTop: 4,
    },
    infoBox: {
        backgroundColor: '#E8F5E8',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
    },
    cadastrarButton: {
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
    cadastrarButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    debugBox: {
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    debugText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 14,
    },
});

export default AddPocosProprietario;