import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const PasswordHistory = ({ navigation, route }) => {
  const { passwordHistory = [], clearPasswordHistory } = route.params || {};

  const handleClearHistory = () => {
    // Chama a função de limpeza que foi passada
    if (clearPasswordHistory) {
      clearPasswordHistory();
    }
    
    // Volta para a tela anterior
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderItem = ({ item }) => (
    <Text style={styles.passwordItem}>{item}</Text>
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
  passwordItem: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333333',
    paddingVertical: 10,
    textAlign: 'center',
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