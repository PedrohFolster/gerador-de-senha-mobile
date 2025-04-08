import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@password_history';

/**
 * Salva o histórico de senhas no AsyncStorage
 * @param {Array} passwordHistory - Array com histórico de senhas
 * @returns {Promise<void>}
 */
export const savePasswordHistory = async (passwordHistory) => {
  try {
    const jsonValue = JSON.stringify(passwordHistory);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Erro ao salvar histórico de senhas:', error);
    return false;
  }
};

/**
 * Carrega o histórico de senhas do AsyncStorage
 * @returns {Promise<Array>} Array com histórico de senhas ou array vazio
 */
export const loadPasswordHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico de senhas:', error);
    return [];
  }
};

/**
 * Limpa o histórico de senhas do AsyncStorage
 * @returns {Promise<boolean>} True se bem sucedido, false se falhar
 */
export const clearPasswordHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico de senhas:', error);
    return false;
  }
}; 