import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D5637" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Imagen de perfil del guardia */}
        <Image
          source={require('../../images/Guardia/guardia.png')}
          style={styles.profileImage}
        />

        {/* Nombre completo */}
        <Text style={styles.name}>
          {user.nombre || 'Nombre'} {user.apellido || ''}
        </Text>

        {/* Línea decorativa */}
        <View style={styles.separator} />

        {/* Teléfono */}
        <View style={styles.infoItem}>
          <Text style={styles.label}>Número de teléfono:</Text>
          <Text style={styles.value}>{user.phone || 'No disponible'}</Text>
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.infoItem}>
          <Text style={styles.label}>Fecha de nacimiento:</Text>
          <Text style={styles.value}>
            {user.birthday ? user.birthday.split('T')[0] : 'Sin fecha'}
          </Text>
        </View>

        {/* Tipo de usuario */}
        <View style={styles.infoItem}>
          <Text style={styles.label}>Tipo de usuario:</Text>
          <Text style={styles.value}>{user.tipoUsuario}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C4BDA6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C4BDA6',
  },
  card: {
    backgroundColor: '#EFEAD8',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 6,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4D5637',
    marginBottom: 10,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#7C4A2D',
    marginVertical: 16,
  },
  infoItem: {
    marginBottom: 14,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  value: {
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
});
