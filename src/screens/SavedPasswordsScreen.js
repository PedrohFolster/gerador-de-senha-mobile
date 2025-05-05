import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSavedPasswords, clearSavedPasswords } from '../components/modals/PasswordSaveDialog';

const SavedPasswordsScreen = ({ navigation }) => {
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    loadPasswords();
    
    // Recarregar senhas salvas quando a tela for focada
    const unsubscribe = navigation.addListener('focus', loadPasswords);
    return unsubscribe;
  }, [navigation]);

  const loadPasswords = async () => {
    const passwords = await loadSavedPasswords();
    setSavedPasswords(passwords);
    // Inicializa todas as senhas como ocultas
    const initialVisibility = {};
    passwords.forEach((_, index) => {
      initialVisibility[index] = false;
    });
    setVisiblePasswords(initialVisibility);
  };

  const copyToClipboard = async (password) => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
  };

  const togglePasswordVisibility = (index) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDelete = (appName, index) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a senha para "${appName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPasswords = [...savedPasswords];
              updatedPasswords.splice(index, 1);
              
              const newPasswords = await loadSavedPasswords();
              const filteredPasswords = newPasswords.filter(p => p.appName !== appName);
              
              // Atualizar AsyncStorage
              await clearSavedPasswords();
              
              // Se ainda houver senhas, salve novamente
              if (filteredPasswords.length > 0) {
                await AsyncStorage.setItem('@saved_passwords', JSON.stringify(filteredPasswords));
              }
              
              setSavedPasswords(filteredPasswords);
            } catch (error) {
              console.error('Erro ao excluir senha:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a senha.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.passwordItem}>
      <View style={styles.passwordInfo}>
        <Text style={styles.appName}>{item.appName}</Text>
        <Text style={styles.passwordMasked}>
          {visiblePasswords[index] ? item.password : '••••••••'}
        </Text>
      </View>
      
      <View style={styles.passwordActions}>
        <TouchableOpacity onPress={() => togglePasswordVisibility(index)} style={styles.actionButton}>
          <FontAwesome5 name={visiblePasswords[index] ? "eye-slash" : "eye"} size={18} color="#4A86E8" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => copyToClipboard(item.password)} style={styles.actionButton}>
          <FontAwesome5 name="copy" size={18} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleDelete(item.appName, index)} style={styles.actionButton}>
          <FontAwesome5 name="trash" size={18} color="#999999" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Históricos de senhas</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>HISTÓRICO DE SENHAS</Text>
        
        {savedPasswords.length > 0 ? (
          <FlatList
            data={savedPasswords}
            renderItem={renderItem}
            keyExtractor={(item, index) => `password-${index}`}
            style={styles.list}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhuma senha salva</Text>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 24,
    color: '#4A86E8',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A86E8',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  passwordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  passwordInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  passwordMasked: {
    fontSize: 14,
    color: '#777777',
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4A86E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SavedPasswordsScreen; 