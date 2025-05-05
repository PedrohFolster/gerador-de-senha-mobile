import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPasswordHistory } from './storageService';
import { clearSavedPasswords } from '../components/modals/PasswordSaveDialog';

// Chave para armazenar info do usuário logado
const USER_INFO_KEY = '@current_user';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há um usuário logado ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await AsyncStorage.getItem(USER_INFO_KEY);
        if (userInfo) {
          setCurrentUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Salvar usuário atual no AsyncStorage
  const saveUserToStorage = async (user) => {
    try {
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // Login
  const login = async (user) => {
    try {
      await saveUserToStorage(user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Limpar dados do usuário
      await AsyncStorage.removeItem(USER_INFO_KEY);
      
      // Limpar histórico de senhas
      await clearPasswordHistory();
      
      // Limpar senhas salvas
      await clearSavedPasswords();
      
      // Limpar estado
      setCurrentUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error };
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 