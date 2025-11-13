import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

// 1. Prop 'isSubmitting' adicionada para desabilitar o botão
const FormAvaliacoes = ({ onSubmit, isSubmitting = false }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // 2. Lógica de imagem foi removida

  const handleCommentChange = (text) => {
    if (text.length <= 100) {
      setComment(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = () => {
    if (comment.trim().length === 0) {
      Alert.alert("Erro", "Por favor, escreva um depoimento antes de enviar.");
      return;
    }
    
    if (rating === 0) {
      Alert.alert("Erro", "Por favor, selecione uma avaliação com estrelas.");
      return;
    }
    
    // 3. Envia apenas 'comment' e 'rating'
    onSubmit({ comment, rating });
    
    // Limpa o formulário
    setComment("");
    setRating(0);
    setCharCount(0);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Deixe seu depoimento:</Text>
      <TextInput
        style={styles.input}
        placeholder="Escreva aqui... (máximo 100 caracteres)"
        value={comment}
        onChangeText={handleCommentChange}
        multiline
        maxLength={100}
      />
      <Text style={styles.charCount}>
        {charCount}/100 caracteres
      </Text>

      <Text style={styles.label}>Deixe sua avaliação:</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, rating >= star && styles.activeStar]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Seção de Upload de Imagem REMOVIDA */}

      <TouchableOpacity
        // 5. Botão é desabilitado durante o envio
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#5dade2",
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 4,
    color: "#fff",
    marginTop: 10, // Adicionado
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    minHeight: 60,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#fff",
    textAlign: "right",
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    marginVertical: 6,
  },
  star: {
    fontSize: 22,
    color: "#ccc",
    marginRight: 6,
  },
  activeStar: {
    color: "#FFD700",
  },
  button: {
    marginTop: 15, // Aumentado
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2980b9",
  },
  // 6. Estilo para botão desabilitado
  buttonDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#999",
  },
  buttonText: {
    fontSize: 16,
    color: "#2980b9",
    fontWeight: "bold",
  },
});

export default FormAvaliacoes;
