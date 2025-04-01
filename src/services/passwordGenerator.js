/**
 * Serviço para geração de senhas seguras
 */

/**
 * Gera uma senha aleatória com base nas opções fornecidas
 * @param {number} length - Comprimento da senha (entre 6-32)
 * @param {boolean} includeUppercase - Incluir letras maiúsculas
 * @param {boolean} includeLowercase - Incluir letras minúsculas
 * @param {boolean} includeNumbers - Incluir números
 * @param {boolean} includeSymbols - Incluir símbolos especiais
 * @returns {string} Senha gerada
 */
export const generatePassword = (
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true
) => {
  // Caracteres disponíveis para cada categoria
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+={}[]|:;<>,.?/~';

  // Garantir pelo menos um comprimento mínimo de senha
  const safeLength = Math.max(6, Math.min(32, length));
  
  // Construir o conjunto de caracteres disponíveis
  let availableChars = '';
  if (includeUppercase) availableChars += uppercaseChars;
  if (includeLowercase) availableChars += lowercaseChars;
  if (includeNumbers) availableChars += numberChars;
  if (includeSymbols) availableChars += symbolChars;
  
  // Se nenhuma opção foi selecionada, usar letras minúsculas por padrão
  if (!availableChars) availableChars = lowercaseChars;

  // Gerar senha
  let password = '';
  for (let i = 0; i < safeLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }

  return password;
};

/**
 * Avalia a força da senha
 * @param {string} password - Senha para avaliar
 * @returns {number} Pontuação da força (0-100)
 */
export const evaluatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Comprimento (até 40 pontos)
  score += Math.min(40, password.length * 4);
  
  // Variedade de caracteres (até 60 pontos)
  if (/[A-Z]/.test(password)) score += 15; // Maiúsculas
  if (/[a-z]/.test(password)) score += 10; // Minúsculas
  if (/[0-9]/.test(password)) score += 15; // Números
  if (/[^A-Za-z0-9]/.test(password)) score += 20; // Símbolos
  
  return Math.min(100, score);
}; 