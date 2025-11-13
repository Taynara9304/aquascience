// componentes/Input.js - VERSÃO COM OLHO PARA SENHA
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-paper';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  style,
  ...props
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getRightIcon = () => {
    if (secureTextEntry) {
      return {
        right: (
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={togglePasswordVisibility}
            color="#666"
          />
        )
      };
    }
    return {};
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry && !showPassword}
        outlineColor="#2685BF"
        activeOutlineColor="#2685BF"
        style={[styles.input, style]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dense={false}
        selectionColor="#2685BF"
        {...getRightIcon()}
        {...props}
      />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
});

export default Input;