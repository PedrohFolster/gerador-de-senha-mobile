import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getAllPasswordItems, createPasswordItem, deletePasswordItem } from '../api/PasswordApi';
import { generatePassword } from '../services/passwordGenerator';
import PasswordDisplay from '../components/password/PasswordDisplay';
import PasswordHistoryItem from '../components/password/PasswordHistoryItem';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
  // Authentication context
  const { user, logout, sessionData } = useAuth();
  
  // Estado para o gerador de senha
  const [password, setPassword] = useState('');
  
  // Estado para os itens salvos na API
  const [passwordItems, setPasswordItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPassword, setNewItemPassword] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  // Add state for tracking visible passwords
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  // Inicialização
  useEffect(() => {
    fetchItems();
    generateNewPassword();
  }, []);

  // Funções para gerador de senha
  const generateNewPassword = () => {
    const newPassword = generatePassword(8, true, true, true, false);
    setPassword(newPassword);
  };

  const copyToClipboard = async (textToCopy) => {
    const textToUse = textToCopy || password;
    if (!textToUse) return;
    
    await Clipboard.setStringAsync(textToUse);
    Alert.alert('Copiado', 'Senha copiada para a área de transferência');
  };

  const clearPassword = () => {
    setPassword('');
  };

  // Funções para itens de senha na API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const items = await getAllPasswordItems();
      setPasswordItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar suas senhas. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleAddItem = async () => {
    if (!newItemName) {
      Alert.alert('Erro', 'Por favor, digite um nome para o item');
      return;
    }

    // Se não houver senha digitada, usar a senha gerada
    const passwordToSave = newItemPassword || password;
    if (!passwordToSave) {
      Alert.alert('Erro', 'Por favor, gere ou digite uma senha');
      return;
    }

    try {
      setCreatingItem(true);
      await createPasswordItem({ name: newItemName, password: passwordToSave });
      setModalVisible(false);
      setNewItemName('');
      setNewItemPassword('');
      fetchItems();
      Alert.alert('Sucesso', 'Senha salva com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível adicionar o item. Por favor, tente novamente.'
      );
    } finally {
      setCreatingItem(false);
    }
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePasswordItem(id);
              fetchItems();
            } catch (error) {
              Alert.alert(
                'Erro',
                'Não foi possível excluir o item. Por favor, tente novamente.'
              );
            }
          }
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await logout(); // Use AuthContext logout
            
            // Explicitly navigate to SignIn screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          }
        },
      ]
    );
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    const newValue = !showDropdown;
    setShowDropdown(newValue);
    Animated.timing(dropdownHeight, {
      toValue: newValue ? 50 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  };

  // Close dropdown when changing views
  useEffect(() => {
    if (showDropdown) {
      setShowDropdown(false);
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  }, [showSavedItems]);

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.passwordRow}>
        <PasswordHistoryItem
          password={item.password}
          isVisible={visiblePasswords[item.id]}
          onToggleVisibility={() => togglePasswordVisibility(item.id)}
          onCopy={() => copyToClipboard(item.password)}
        />
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToHistory = () => {
    navigation.navigate('PasswordHistory', { clearPasswordHistory: () => {} });
  };

  const navigateToSavedPasswords = () => {
    navigation.navigate('SavedPasswords');
  };

  const handleSave = () => {
    if (password) {
      setNewItemPassword(password);
    }
    setModalVisible(true);
  };

  const toggleView = () => {
    setShowSavedItems(!showSavedItems);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {showSavedItems ? 'Senhas Salvas' : 'Gerador de Senha'}
        </Text>
        <View style={styles.userMenuContainer}>
          <TouchableOpacity style={styles.userIcon} onPress={toggleDropdown}>
            {user && user.email ? (
              <View style={styles.userInitialContainer}>
                <Text style={styles.userInitial}>
                  {user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <FontAwesome5 name="user" size={20} color="#4A86E8" />
            )}
          </TouchableOpacity>
          
          {showDropdown && (
            <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <FontAwesome5 name="sign-out-alt" size={16} color="#FF6B6B" style={styles.dropdownIcon} />
                <Text style={styles.dropdownText}>Sair</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {showSavedItems ? (
        // Tela de senhas salvas
        loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A86E8" />
            <Text style={styles.loadingText}>Carregando senhas...</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={passwordItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Você ainda não salvou nenhuma senha</Text>
                  <Text style={styles.emptySubtext}>
                    Toque no botão + abaixo para adicionar uma nova senha
                  </Text>
                </View>
              }
            />

            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backToGeneratorButton}
              onPress={toggleView}
            >
              <Text style={styles.backToGeneratorText}>VOLTAR AO GERADOR</Text>
            </TouchableOpacity>
          </>
        )
      ) : (
        // Tela do gerador de senha
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>GERADOR DE SENHA</Text>
          
          {/* Ícone de cadeado */}
          <View style={styles.imageContainer}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="lock" size={60} color="#4A86E8" />
            </View>
          </View>
          
          {/* Exibição da senha */}
          <PasswordDisplay password={password} />
          
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
            onPress={handleSave}
      >
            <Text style={styles.buttonText}>SALVAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
            onPress={clearPassword}
          >
            <Text style={styles.buttonText}>LIMPAR</Text>
          </TouchableOpacity>
          
          {/* Links de navegação */}
          <View style={styles.navLinksContainer}>
            <TouchableOpacity
              style={styles.navLink}
              onPress={navigateToHistory}
            >
              <Text style={styles.navLinkText}>Ver Histórico</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navLink}
              onPress={navigateToSavedPasswords}
            >
              <Text style={styles.navLinkText}>Ver Senhas Salvas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Modal para salvar senha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Senha</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Gmail, Facebook, Netflix..."
                value={newItemName}
                onChangeText={setNewItemName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite a senha para salvar"
                  value={newItemPassword}
                  onChangeText={setNewItemPassword}
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <FontAwesome5
                    name={passwordVisible ? "eye-slash" : "eye"}
                    size={18}
                    color="#4A86E8"
                  />
                </TouchableOpacity>
              </View>
              {password && !newItemPassword && (
                <Text style={styles.passwordNote}>Será usada a senha gerada: {password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddItem}
              disabled={creatingItem}
            >
              {creatingItem ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>SALVAR</Text>
              )}
      </TouchableOpacity>
    </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  userMenuContainer: {
    position: 'relative',
  },
  userIcon: {
    padding: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 10,
    overflow: 'hidden',
    width: 120,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
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
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  navLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  navLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkText: {
    color: '#4A86E8',
    fontSize: 16,
    fontWeight: '500',
  },
  // Estilos para a lista de senhas
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Increased to make room for the back button
  },
  itemCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 80, // Increased to make room for back button
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A86E8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backToGeneratorButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToGeneratorText: {
    color: '#4A86E8',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para o modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  visibilityToggle: {
    paddingHorizontal: 15,
  },
  passwordNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4A86E8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInitialContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A86E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 