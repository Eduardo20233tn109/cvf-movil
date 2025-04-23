// components/Residente/ValidarVisita.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function Visita({ route, navigation }) {
  const { visitData } = route.params;

  const handleGenerarQR = () => {
    navigation.navigate('GenerarQR', { visitData });
  };

  return (
    <View style={styles.container}>
      {/* ... resto del código existente ... */}
      
      <TouchableOpacity style={styles.button} onPress={handleGenerarQR}>
        <Text style={styles.buttonText}>Generar QR</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mantener los estilos existentes