import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PasswordHistoryItem = ({ 
  password, 
  isVisible, 
  onToggleVisibility, 
  onCopy 
}) => {
  return (
    <View style={styles.passwordItemContainer}>
      <Text style={styles.passwordItem}>
        {isVisible ? password : '••••••••'}
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={onToggleVisibility} 
          style={styles.iconButton}
        >
          <FontAwesome5 
            name={isVisible ? "eye-slash" : "eye"} 
            size={16} 
            color="#4A86E8" 
            style={styles.icon} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onCopy} 
          style={styles.iconButton}
        >
          <FontAwesome5 
            name="copy" 
            size={16} 
            color="#4A86E8" 
            style={styles.copyIcon} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  passwordItem: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333333',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    marginRight: 5,
  },
  copyIcon: {
    marginLeft: 5,
  },
});

export default PasswordHistoryItem; 