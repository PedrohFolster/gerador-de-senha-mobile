import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordGenerator from '../components/password/PasswordGenerator';
import Header from '../components/layout/Header';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header navigation={navigation} />
      <PasswordGenerator navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default HomeScreen; 