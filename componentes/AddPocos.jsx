import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import InputMapa from './InputMapa';
import InputProprietario from './InputProprietario';
import InputObservacoes from './InputObservacoes';

const AddPocos = ({ onAdicionarPoco }) => {
    const [localizacao, setLocalizacao] = useState(null);
    const [proprietario, setProprietario] = useState(null);
    const [observacoes, setObservacoes] = useState('');

    // Debug para ver quando a localização muda
    useEffect(() => {
        console.log('AddPocos: localizacao atualizada', localizacao);
    }, [localizacao]);

    // AddPocos.js - função handleCadastrar atualizada
    const handleCadastrar = async () => {
        console.log('AddPocos: Iniciando cadastro...');
        console.log('Localização:', localizacao);
        console.log('Proprietário:', proprietario);
        console.log('Observações:', observacoes);

        // Validação detalhada
        if (!localizacao) {
            console.log('AddPocos: Erro - Localização não selecionada');
            Alert.alert('Erro', 'Por favor, selecione a localização do poço no mapa.');
            return;
        }

        if (!localizacao.latitude || !localizacao.longitude) {
            console.log('AddPocos: Erro - Coordenadas inválidas');
            Alert.alert('Erro', 'Localização inválida. Selecione novamente no mapa.');
            return;
        }

        if (!proprietario) {
            console.log('AddPocos: Erro - Proprietário não selecionado');
            Alert.alert('Erro', 'Por favor, selecione o proprietário do poço.');
            return;
        }

        if (!proprietario.id || !proprietario.nome) {
            console.log('AddPocos: Erro - Dados do proprietário incompletos');
            Alert.alert('Erro', 'Dados do proprietário inválidos.');
            return;
        }

        try {
            // Criar objeto no formato correto
            const wellData = {
                localizacao: {
                    latitude: localizacao.latitude,
                    longitude: localizacao.longitude
                },
                proprietario: {
                    id: proprietario.id,
                    nome: proprietario.nome
                },
                observacoes: observacoes.trim()
            };

            console.log('AddPocos: Dados preparados para envio:', wellData);

            // Verificar se a função callback existe
            if (!onAdicionarPoco) {
                console.log('AddPocos: ERRO - onAdicionarPoco não está definida');
                Alert.alert('Erro', 'Função de cadastro não disponível.');
                return;
            }

            console.log('AddPocos: Chamando onAdicionarPoco...');
            await onAdicionarPoco(wellData);
            
            // Limpar formulário apenas se foi bem sucedido
            console.log('AddPocos: Cadastro bem-sucedido, limpando formulário');
            setLocalizacao(null);
            setProprietario(null);
            setObservacoes('');
            
        } catch (error) {
            console.error('AddPocos: Erro no cadastro:', error);
            Alert.alert('Erro', `Não foi possível cadastrar o poço: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Adicionar Poço</Text>

            <View style={styles.formContainer}>
                {/* Input de Localização com Mapa */}
                <InputMapa
                    label="Localização"
                    value={localizacao}
                    onChange={setLocalizacao}
                    placeholder="Clique para selecionar a localização no mapa"
                />

                {/* Input de Proprietário com Autocomplete */}
                <InputProprietario
                    label="Proprietário"
                    value={proprietario}
                    onChange={setProprietario}
                    placeholder="Clique para selecionar o proprietário"
                />

                {/* Input de Observações */}
                <InputObservacoes
                    label="Observações"
                    value={observacoes}
                    onChange={setObservacoes}
                    placeholder="Digite observações sobre o poço (opcional)"
                />

                {/* Botão de Cadastrar */}
                <TouchableOpacity
                    style={styles.cadastrarButton}
                    onPress={handleCadastrar}
                >
                    <Text style={styles.cadastrarButtonText}>CADASTRAR POÇO</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        marginTop: 16,
        color: '#333',
    },
    formContainer: {
        padding: 16,
    },
    cadastrarButton: {
        backgroundColor: '#2685BF',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 24,
    },
    cadastrarButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddPocos;