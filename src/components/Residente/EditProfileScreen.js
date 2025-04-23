import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/userContext';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, login } = useContext(UserContext);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (user) {
      let direccionCompleta = 'No disponible';
      if (user.house_id && user.house_id.address) {
        const { street, city, zip } = user.house_id.address;
        direccionCompleta = `${street}, ${city}, ${zip}`;
      }

      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        username: user.username || '',
        telefono: user.phone || '',
        direccion: direccionCompleta,
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const checkUsernameUnique = async () => {
    try {
      const res = await fetch(`http://192.168.0.166:4000/api/users/check-username?username=${formData.username}`);
      const data = await res.json();
      return data.available || data._id === user._id;
    } catch (err) {
      console.error('❌ Error al validar username:', err);
      return false;
    }
  };

  const handleGuardar = async () => {
    try {
      const response = await fetch(`http://192.168.0.166:4000/api/users/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          correo: formData.username,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.user) {
        login(result.user); // actualizar contexto
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el perfil');
      }
    } catch (e) {
      console.error('❌ Error al actualizar perfil:', e);
      Alert.alert('Error', 'Algo salió mal');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>EDITAR PERFIL</Text>

      <Image
        source={require('../../images/Residente/residente.png')}
        style={styles.profileImage}
      />
    

      <View style={styles.form}>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          value={formData.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
        />

        <Text style={styles.label}>Apellido:</Text>
        <TextInput
          style={styles.input}
          value={formData.apellido}
          onChangeText={(text) => handleChange('apellido', text)}
        />

        <Text style={styles.label}>Usuario:</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
        />

        <Text style={styles.label}>Número de teléfono:</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.telefono}
          onChangeText={(text) => handleChange('telefono', text)}
        />

        <Text style={styles.label}>Dirección (no editable):</Text>
        <TextInput
          style={styles.input}
          value={formData.direccion}
          editable={false}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#C4BDA6',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4D3226',
    marginBottom: 20,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#7C4A2D',
  },
  editPhoto: {
    color: '#333',
    marginBottom: 30,
    fontSize: 14,
  },
  form: {
    width: '100%',
    backgroundColor: '#EFE9DC',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4D3226',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#4BB543',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 25,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  cancelButton: {
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
