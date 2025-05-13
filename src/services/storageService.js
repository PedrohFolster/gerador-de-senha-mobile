import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSWORD_HISTORY_KEY = '@password_history';
const SAVED_PASSWORDS_KEY = '@saved_passwords';

/**
 * Salvar o histórico de senhas no AsyncStorage
 * @param {Array} passwords - Array de senhas para salvar
 */
export const savePasswordHistory = async (passwords) => {
  try {
    const jsonValue = JSON.stringify(passwords);
    await AsyncStorage.setItem(PASSWORD_HISTORY_KEY, jsonValue);
  } catch (error) {
    console.error('Erro ao salvar histórico de senhas:', error);
  }
};

/**
 * Carregar o histórico de senhas do AsyncStorage
 * @returns {Array} - Array de senhas do histórico
 */
export const loadPasswordHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PASSWORD_HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico de senhas:', error);
    return [];
  }
};

/**
 * Limpar o histórico de senhas do AsyncStorage
 */
export const clearPasswordHistory = async () => {
  try {
    await AsyncStorage.removeItem(PASSWORD_HISTORY_KEY);
  } catch (error) {
    console.error('Erro ao limpar histórico de senhas:', error);
  }
};

/**
 * Salvar uma senha com identificação de aplicativo
 * @param {string} appName - Nome do aplicativo/serviço
 * @param {string} password - Senha a ser salva
 */
export const savePasswordForApp = async (appName, password) => {
  try {
    // Carregar senhas existentes
    const savedPasswords = await loadSavedPasswords();
    
    // Verificar se já existe uma senha para este app
    const existingIndex = savedPasswords.findIndex(p => p.appName === appName);
    
    if (existingIndex >= 0) {
      // Atualizar senha existente
      savedPasswords[existingIndex].password = password;
    } else {
      // Adicionar nova senha
      savedPasswords.push({ appName, password, createdAt: new Date().toISOString() });
    }
    
    // Salvar array atualizado
    const jsonValue = JSON.stringify(savedPasswords);
    await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, jsonValue);
    
    return savedPasswords;
  } catch (error) {
    console.error('Erro ao salvar senha para aplicativo:', error);
    throw error;
  }
};

/**
 * Carregar todas as senhas salvas para aplicativos
 * @returns {Array} - Array de objetos {appName, password, createdAt}
 */
export const loadSavedPasswords = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar senhas salvas:', error);
    return [];
  }
};

/**
 * Remover senha salva para um aplicativo específico
 * @param {string} appName - Nome do aplicativo/serviço
 */
export const removePasswordForApp = async (appName) => {
  try {
    // Carregar senhas existentes
    const savedPasswords = await loadSavedPasswords();
    
    // Filtrar para remover a senha do app específico
    const updatedPasswords = savedPasswords.filter(p => p.appName !== appName);
    
    // Salvar array atualizado
    const jsonValue = JSON.stringify(updatedPasswords);
    await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, jsonValue);
    
    return updatedPasswords;
  } catch (error) {
    console.error('Erro ao remover senha para aplicativo:', error);
    throw error;
  }
};

/**
 * Limpar todas as senhas salvas
 */
export const clearAllSavedPasswords = async () => {
  try {
    await AsyncStorage.removeItem(SAVED_PASSWORDS_KEY);
  } catch (error) {
    console.error('Erro ao limpar senhas salvas:', error);
    throw error;
  }
}; 