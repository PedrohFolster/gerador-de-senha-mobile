import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const PasswordDisplay = ({ password }) => {
  return (
    <View style={styles.passwordContainer}>
      <Text style={styles.passwordText}>{password}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordContainer: {
    backgroundColor: '#F0F6FF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#4A86E8',
    letterSpacing: 2,
  },
});

export default PasswordDisplay; 