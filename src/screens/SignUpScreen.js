import React, { useState } from 'react';
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
import { registerUser } from '../services/authService';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isFormFilled = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '';

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await registerUser(name, email, password);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') }
        ]);
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signup</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>SIGN UP</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={name}
              onChangeText={setName}
            />
            
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
            
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                isFormFilled ? styles.buttonActive : styles.buttonInactive
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>REGISTRAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backLink}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.backLinkText}>Voltar</Text>
            </TouchableOpacity>
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
  backLink: {
    marginTop: 20,
    padding: 10,
  },
  backLinkText: {
    color: '#4A86E8',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SignUpScreen; 