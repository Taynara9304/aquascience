import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const Card = ({ name, image, rating, comment }) => {
  // Função para obter as iniciais do nome
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
  };

  // Limita o comentário a 100 caracteres e adiciona reticências se necessário
  const truncatedComment = comment && comment.length > 100 
    ? comment.substring(0, 100) + '...' 
    : comment;

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{getInitials(name)}</Text>
        </View>
      )}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.stars}>{"⭐".repeat(rating)}</Text>
      <Text style={styles.comment}>{truncatedComment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    height: '100%', // Para ocupar toda a altura do container
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#008000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  stars: {
    fontSize: 20,
    marginBottom: 8,
    color: "#FFD700",
  },
  comment: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    flexWrap: 'wrap',
    width: '100%',
  },
});

export default Card;