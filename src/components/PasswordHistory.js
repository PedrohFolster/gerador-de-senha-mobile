import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome5 } from '@expo/vector-icons';
import { clearPasswordHistory as clearStoredHistory, loadPasswordHistory } from '../services/storageService';

const PasswordHistory = ({ navigation, route }) => {
  const [passwordHistory, setPasswordHistory] = useState([]);
  const { clearPasswordHistory } = route.params || {};
  
  useEffect(() => {
    // Carregar histórico de senhas do storage ao abrir a tela
    loadSavedHistory();
    
    // Adicionar um listener para recarregar o histórico quando a tela for focada novamente
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedHistory();
    });
    
    // Limpeza ao desmontar
    return unsubscribe;
  }, [navigation]);
  
  const loadSavedHistory = async () => {
    const history = await loadPasswordHistory();
    setPasswordHistory(history);
  };

  const handleClearHistory = async () => {
    // Limpar o histórico no AsyncStorage
    await clearStoredHistory();
    
    // Atualizar o estado local
    setPasswordHistory([]);
    
    // Chamar a função de limpeza que foi passada, se existir
    if (clearPasswordHistory) {
      clearPasswordHistory();
    }
  };
  
  const copyPasswordToClipboard = async (password) => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.passwordItemContainer}
      onPress={() => copyPasswordToClipboard(item)}
    >
      <Text style={styles.passwordItem}>{item}</Text>
      <FontAwesome5 name="copy" size={16} color="#4A86E8" style={styles.copyIcon} />
    </TouchableOpacity>
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
        
        {passwordHistory.length > 0 ? (
          <FlatList
            data={passwordHistory}
            renderItem={renderItem}
            keyExtractor={(item, index) => `password-${index}`}
            style={styles.list}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhuma senha no histórico</Text>
        )}
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.clearButtonText}>LIMPAR</Text>
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
    marginBottom: 40,
    marginTop: 20,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  passwordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  passwordItem: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333333',
    textAlign: 'center',
    marginRight: 10,
  },
  copyIcon: {
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
  },
  clearButton: {
    backgroundColor: '#4A86E8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordHistory; 