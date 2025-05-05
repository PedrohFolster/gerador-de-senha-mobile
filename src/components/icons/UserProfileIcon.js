import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../services/authContext';

const UserProfileIcon = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja sair? Todos os dados serão limpos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setMenuVisible(false),
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setMenuVisible(false);
            const result = await logout();
            if (result.success) {
              navigation.replace('SignIn');
            } else {
              Alert.alert('Erro', 'Ocorreu um erro ao sair da aplicação.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setMenuVisible(true)}
      >
        <FontAwesome5 name="user-circle" size={24} color="#4A86E8" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <FontAwesome5 name="sign-out-alt" size={18} color="#F44336" />
                <Text style={styles.menuItemText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '70%',
    maxWidth: 200,
    position: 'absolute',
    top: 60,
    right: 20,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default UserProfileIcon; 