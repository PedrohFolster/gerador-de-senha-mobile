import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, signUp, isAuthenticated } from '../api/AuthApi';

const AuthContext = createContext({});

// Keys for AsyncStorage
const USER_DATA_KEY = 'userData';
const AUTH_TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // First try to get userData directly from AsyncStorage
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        
        if (userData && token) {
          // User data exists and token exists, assume user is logged in
          console.log('User session found in storage, restoring session...');
          const parsedUserData = JSON.parse(userData);
          
          // Restore user session
          setUser({ authenticated: true, ...parsedUserData });
          setSessionData({ 
            lastLogin: parsedUserData.loginTime ? new Date(parsedUserData.loginTime) : new Date(),
            user: parsedUserData,
            restored: true
          });
        } else {
          // Try the server authentication check as backup
          const authenticated = await isAuthenticated();
          if (authenticated) {
            console.log('User authenticated with token but no user data, setting basic state');
            setUser({ authenticated: true });
          } else {
            console.log('No session found, user needs to log in');
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Fail silently and require login
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await signIn(credentials);
      
      // Store basic user data in memory
      const userData = {
        email: credentials.email,
        loginTime: new Date().toISOString(),
        userId: response.userId || response.id || 'unknown'
      };
      
      // Save to AsyncStorage for persistence across app restarts
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      
      // Update state
      setUser({ authenticated: true, ...userData });
      setSessionData({
        lastLogin: new Date(),
        user: userData
      });
      
      console.log('Login successful, session data saved');
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await signUp(userData);
      
      // Store basic user data in memory
      const userInfo = {
        email: userData.email,
        name: userData.name,
        registrationTime: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        userId: response.userId || response.id || 'unknown'
      };
      
      // Save to AsyncStorage for persistence across app restarts if needed
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));
      
      // Update state
      setUser({ authenticated: true, ...userInfo });
      setSessionData({
        lastLogin: new Date(),
        user: userInfo
      });
      
      console.log('Registration successful, session data saved');
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem(USER_DATA_KEY);
      
      // Clear session data from memory
      setSessionData(null);
      setUser(null);
      
      console.log('Session terminated and data cleared');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
      return false;
    }
  };

  // Get current session information
  const getSessionInfo = () => {
    return sessionData;
  };

  // Check if current session is active
  const isSessionActive = () => {
    return !!user && user.authenticated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sessionData,
        getSessionInfo,
        isSessionActive,
        isAuthenticated: !!user && user.authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 