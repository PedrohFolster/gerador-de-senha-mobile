import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PASSWORDS_KEY = '@saved_passwords';

const PasswordSaveDialog = ({ visible, onClose, password, onSave }) => {
  const [appName, setAppName] = useState('');

  const handleSave = async () => {
    if (!appName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do aplicativo.');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Não há senha para salvar.');
      onClose();
      return;
    }

    try {
      // Carregar senhas salvas
      const savedPasswordsJson = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
      const savedPasswords = savedPasswordsJson ? JSON.parse(savedPasswordsJson) : [];
      
      // Verificar se já existe um registro com o mesmo nome
      const existingIndex = savedPasswords.findIndex(item => item.appName === appName);
      if (existingIndex !== -1) {
        Alert.alert(
          'Aviso',
          `Já existe uma senha salva para "${appName}". Deseja substituí-la?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Substituir',
              onPress: async () => {
                // Substituir a senha existente
                savedPasswords[existingIndex].password = password;
                await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(savedPasswords));
                onSave(savedPasswords);
                setAppName('');
                onClose();
              },
            },
          ]
        );
        return;
      }
      
      // Adicionar nova senha
      const updatedPasswords = [...savedPasswords, { appName, password }];
      await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(updatedPasswords));
      
      onSave(updatedPasswords);
      setAppName('');
      onClose();
      Alert.alert('Sucesso', 'Senha salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a senha.');
    }
  };

  const handleCancel = () => {
    setAppName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>CADASTRO DE SENHA</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do aplicativo</Text>
            <TextInput
              style={styles.input}
              value={appName}
              onChangeText={setAppName}
              placeholder="Ex: Google, Facebook, etc."
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha gerada</Text>
            <Text style={styles.passwordText}>{password}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>CRIAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const loadSavedPasswords = async () => {
  try {
    const savedPasswordsJson = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
    return savedPasswordsJson ? JSON.parse(savedPasswordsJson) : [];
  } catch (error) {
    console.error('Erro ao carregar senhas salvas:', error);
    return [];
  }
};

export const clearSavedPasswords = async () => {
  try {
    await AsyncStorage.removeItem(SAVED_PASSWORDS_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar senhas salvas:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  passwordText: {
    backgroundColor: '#F5F5F5',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    paddingVertical: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4A86E8',
    borderRadius: 5,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PasswordSaveDialog; 