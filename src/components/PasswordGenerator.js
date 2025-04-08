import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { generatePassword } from '../services/passwordGenerator';
import { savePasswordHistory, loadPasswordHistory } from '../services/storageService';

const PasswordGenerator = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [passwordHistory, setPasswordHistory] = useState([]);

  useEffect(() => {
    // Carregar histórico de senhas ao iniciar o componente
    loadSavedPasswordHistory();
    generateNewPassword();
  }, []);

  const loadSavedPasswordHistory = async () => {
    const savedHistory = await loadPasswordHistory();
    setPasswordHistory(savedHistory);
  };

  const generateNewPassword = () => {
    const newPassword = generatePassword(8, true, true, true, false);
    setPassword(newPassword);
    
    // Guardar senha no histórico
    setPasswordHistory(prevHistory => {
      const newHistory = [newPassword, ...prevHistory];
      // Salvar o histórico atualizado no AsyncStorage sem limitação
      savePasswordHistory(newHistory);
      
      return newHistory;
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
  };

  const clearPassword = () => {
    setPassword('');
  };

  const clearPasswordHistory = async () => {
    await savePasswordHistory([]);
    setPasswordHistory([]);
    Alert.alert('Sucesso', 'Histórico de senhas limpo com sucesso!');
  };

  const navigateToHistory = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('PasswordHistory', { clearPasswordHistory });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Text style={styles.title}>GERADOR DE SENHA</Text>
      
      {/* Ícone de cadeado */}
      <View style={styles.imageContainer}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="lock" size={60} color="#4A86E8" />
        </View>
      </View>
      
      {/* Exibição da senha */}
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordText}>{password}</Text>
      </View>
      
      {/* Botões */}
      <TouchableOpacity
        style={styles.button}
        onPress={generateNewPassword}
      >
        <Text style={styles.buttonText}>GERAR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={copyToClipboard}
      >
        <Text style={styles.buttonText}>COPIAR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={clearPassword}
      >
        <Text style={styles.buttonText}>LIMPAR</Text>
      </TouchableOpacity>
      
      {/* Link para ver histórico */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={navigateToHistory}
      >
        <Text style={styles.linkText}>Ver Senhas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A86E8',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordContainer: {
    backgroundColor: '#F0F6FF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#4A86E8',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#4A86E8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: '#4A86E8',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PasswordGenerator; 