import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { loginUser } from '../services/authService';
import { useAuth } from '../services/authContext';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const isFormFilled = email.trim() !== '' && password.trim() !== '';

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Guardar usuário no contexto
        await login(result.user);
        // Como especificado, não fazemos validação real
        navigation.replace('Home');
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>SIGN IN</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                isFormFilled ? styles.buttonActive : styles.buttonInactive
              ]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Não possui conta ainda? 
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Crie agora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A86E8',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#E8F0FE',
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonActive: {
    backgroundColor: '#4A86E8',
  },
  buttonInactive: {
    backgroundColor: '#D3D3D3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signupText: {
    color: '#333',
    fontSize: 14,
  },
  signupLink: {
    color: '#4A86E8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default SignInScreen; 