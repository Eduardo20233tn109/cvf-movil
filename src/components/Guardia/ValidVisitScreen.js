import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, Alert, StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../../context/userContext';

export default function ValidVisitScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout } = useContext(UserContext);

  const [data, setData] = useState(route?.params?.visitData || {});
  const [comments, setComments] = useState('');
  const [images, setImages] = useState([null, null, null]);
  const [verifications, setVerifications] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (data && data._id && !data.descripcion) {
        try {
          const res = await fetch(`http://192.168.0.166:4000/api/visits/${data._id}`);
          const json = await res.json();
          if (json.success) {
            setData(json.data);
            if (json.data.observaciones) {
              setComments(json.data.observaciones);
            }
          }
        } catch (err) {
          console.error('❌ Error al obtener la visita por ID:', err);
        }
      }
    };
    fetchData();
  }, []);

  const tomarFoto = async (index) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere permiso de cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const toggleVerification = (key) => {
    setVerifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnviar = async () => {
    if (data.estado === 'Finalizada' || data.estado === 'Cancelada') {
      return Alert.alert('Aviso', `Esta visita ya está ${data.estado.toLowerCase()}.`);
    }

    try {
      const formData = new FormData();
      formData.append('observaciones', comments);

      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const fileUri = images[i];
          const fileName = fileUri.split('/').pop();
          const fileType = fileName.split('.').pop();

          formData.append('evidencias', {
            uri: fileUri,
            name: fileName,
            type: `image/${fileType}`,
          });
        }
      }

      const response = await fetch(`http://192.168.0.166:4000/api/visits/status-with-evidence/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Validación completa', 'La visita ha sido actualizada correctamente');
        navigation.reset({ index: 0, routes: [{ name: 'HomeGuardia' }] });
      } else {
        const result = await response.json();
        console.error('❌ Error al validar:', result);
        Alert.alert('Error', result?.message || 'No se pudo actualizar la visita');
      }
    } catch (e) {
      console.error('❌ Excepción al validar:', e);
      Alert.alert('Error', 'Ocurrió un error al validar');
    }
  };

  const textoBoton =
    data.estado === 'Aprobada' ? 'Finalizar visita'
    : data.estado === 'Pendiente' ? 'Validar visita'
    : 'Visita completada';

  if (!data || !data.descripcion) {
    return (
      <View>
        <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>
          Cargando datos de la visita...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => logout(navigation)} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VALIDACIONES</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {[ // campos de verificación
          { label: 'Palabra clave', value: data.contrasena, key: 'contrasena' },
          { label: 'Número de personas', value: `${data.numeroPersonas} personas`, key: 'numeroPersonas' },
          { label: 'Descripción', value: data.descripcion, key: 'descripcion' },
          { label: 'Tipo de visita', value: data.tipoVisita, key: 'tipoVisita' },
          { label: 'Número de casa', value: data.numeroCasa, key: 'numeroCasa' },
          { label: 'Placas del vehículo', value: data.placasVehiculo || data.placa, key: 'placasVehiculo' },
        ].map(({ label, value, key }) => (
          <View key={key} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{label}:</Text>
              <TouchableOpacity onPress={() => toggleVerification(key)} style={styles.checkBox}>
                <Text style={{ color: 'white' }}>{verifications[key] ? '✔' : ''}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.input}>{value || 'No especificado'}</Text>
          </View>
        ))}

        <Text style={styles.title}>Fotografías de evidencia:</Text>
        <View style={styles.imageRow}>
          {images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => tomarFoto(index)} style={styles.imageBox}>
              {img ? (
                <Image source={{ uri: img }} style={styles.image} />
              ) : (
                <View style={[styles.image, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="camera" size={30} color="#888" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.title}>Observaciones:</Text>
        <TextInput
          placeholder="Escribe tus observaciones aquí..."
          value={comments}
          onChangeText={setComments}
          multiline
          style={styles.textArea}
        />

        <TouchableOpacity onPress={handleEnviar} style={styles.button}>
          <Text style={styles.buttonText}>{textoBoton}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#C4C1AC' },
  header: {
    backgroundColor: '#7C4A2D',
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { position: 'absolute', left: 16, top: 18 },
  content: { padding: 16 },
  row: { marginBottom: 10 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: 'bold', color: '#333' },
  input: {
    backgroundColor: '#FFF', borderRadius: 8, padding: 10, marginTop: 4, color: '#333',
  },
  title: {
    fontWeight: 'bold', marginTop: 16, marginBottom: 6, fontSize: 16, color: '#4D5637',
  },
  checkBox: {
    width: 20, height: 20, backgroundColor: '#4D5637', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  imageRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  imageBox: {
    width: 80, height: 80, backgroundColor: '#eee', borderRadius: 8,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  textArea: {
    backgroundColor: '#FFF', borderRadius: 8, padding: 10,
    textAlignVertical: 'top', marginBottom: 20, height: 100,
  },
  button: {
    backgroundColor: '#4D5637',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
