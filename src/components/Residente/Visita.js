import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';

export default function Visita() {
  const navigation = useNavigation();
  const route = useRoute();
  const { visitData } = route.params;
  const { user } = useContext(UserContext);

  const handleEnviar = async () => {
    console.log('Datos de visita:', visitData);
  
    if (
      !visitData ||
      !visitData.fecha ||
      !visitData.hora ||
      !visitData.numeroPersonas ||
      !visitData.descripcion ||
      !visitData.tipoVisita ||
      !visitData.numeroCasa ||
      !visitData.nombreVisitante
    ) {
      Alert.alert('Error', 'Por favor, asegúrate de que todos los campos estén completos');
      return;
    }
  
    try {
      // 🔄 Convertir "9/4/2025" => Date('2025-04-09')
      const [day, month, year] = visitData.fecha.split('/');
      const fechaISO = new Date(`${year}-${month}-${day}`);
  
      const response = await fetch('http://192.168.0.166:4000/api/visits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: fechaISO,
          hora: visitData.hora,
          numeroPersonas: visitData.numeroPersonas,
          descripcion: visitData.descripcion,
          tipoVisita: visitData.tipoVisita,
          placasVehiculo: visitData.placa,
          contrasena: visitData.contrasena,
          numeroCasa: visitData.numeroCasa,
          nombreVisitante: visitData.nombreVisitante,
          residenteId: visitData.residenteId,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('✅ Visita guardada correctamente:', result);
        navigation.navigate('GenerarQR', { visitData: result }); // <-- Aquí ahora es "result"
      }
      else {
        console.error('❌ Error al guardar visita:', result);
        Alert.alert('Error', 'No se pudo guardar la visita.');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>VISITA</Text>
      </View>

      <Text style={styles.subtitle}>Tienes una visita para el día</Text>
      <Text style={styles.date}>
        {visitData.fecha} | {visitData.hora}
      </Text>

      <FontAwesome5 name="car" size={50} color="#333" style={styles.icon} />

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <FontAwesome5 name="user-friends" size={20} color="#000" />
          <Text style={styles.infoText}>{visitData.numeroPersonas} Personas</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="description" size={20} color="#000" />
          <Text style={styles.infoText}>{visitData.descripcion}</Text>
        </View>

        <View style={styles.infoRow}>
          <Entypo name="location-pin" size={20} color="#000" />
          <Text style={styles.infoText}>{visitData.tipoVisita}</Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome5 name="car-side" size={20} color="#000" />
          <Text style={styles.infoText}>{visitData.placa}</Text>
        </View>

        <View style={styles.infoRow}>
          <Entypo name="home" size={20} color="#000" />
          <Text style={styles.infoText}>Unidad {visitData.numeroCasa}</Text>
        </View>
      </View>

      <View style={styles.passwordBox}>
        <Text style={styles.passwordLabel}>Tu contraseña de acceso es:</Text>
        <Text style={styles.passwordText}>{visitData.contrasena || 'Sin contraseña'}</Text>
      </View>

      <Text style={styles.name}>{visitData.nombreVisitante}</Text>

      <TouchableOpacity style={styles.button} onPress={handleEnviar}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C4BDA6',
    flex: 1,
    alignItems: 'center',
    padding: 45,
  },
  header: {
    backgroundColor: '#7C4A2D',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    marginBottom: 10,
  },
  icon: {
    marginVertical: 20,
  },
  infoBox: {
    alignSelf: 'stretch',
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  passwordBox: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  passwordLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
  },
  passwordText: {
    fontSize: 16,
    color: '#333',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4D5637',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
