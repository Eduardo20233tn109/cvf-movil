import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function GenerarQR({ route }) {
  const navigation = useNavigation();
  const { visitData } = route.params;
  const viewShotRef = useRef();

  const dataParaQR = {
    _id: visitData._id,
  };

  const compartirQR = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error('Error al compartir QR:', e);
      Alert.alert('Error', 'No se pudo compartir el QR');
    }
  };

  const guardarQR = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permiso denegado', 'No se pudo acceder a la galería');
      }

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Éxito', 'QR guardado en la galería');
    } catch (e) {
      console.error('❌ Error al guardar QR:', e);
      Alert.alert('Error', 'No se pudo guardar el QR');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CÓDIGO QR DE VISITA</Text>

      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.qrContainer}>
          <QRCode
            value={JSON.stringify(dataParaQR)}
            size={250}
            color="#000"
            backgroundColor="#FFF"
          />
        </View>
      </ViewShot>

      <Text style={styles.info}>
        Este QR contiene el ID de la visita para ser validado por el guardia.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeResidente' }],
          })
        }
      >
        <Text style={styles.buttonText}>Ir al Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={compartirQR}>
        <Text style={styles.buttonText}>Compartir QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={guardarQR}>
        <Text style={styles.buttonText}>Guardar QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#C4BDA6',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  title: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#4D5637'
  },
  qrContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    elevation: 5
  },
  info: {
    marginTop: 16,
    fontSize: 14,
    color: '#333',
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#4D5637',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
