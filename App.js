import React from 'react';
import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import PasswordHistory from './src/components/password/PasswordHistory';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SavedPasswordsScreen from './src/screens/SavedPasswordsScreen';
import { AuthProvider } from './src/services/authContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="SignIn"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFFFFF' }
            }}
          >
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PasswordHistory" component={PasswordHistory} />
            <Stack.Screen name="SavedPasswords" component={SavedPasswordsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
});
