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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/userContext';
import { colors } from '../../constants/colors';

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
      const res = await fetch(`http://192.168.0.138:4000/api/users/check-username?username=${formData.username}`);
      const data = await res.json();
      return data.available || data._id === user._id;
    } catch (err) {
      console.error('❌ Error al validar username:', err);
      return false;
    }
  };

  const handleGuardar = async () => {
    try {
      const response = await fetch(`http://192.168.0.138:4000/api/users/update-profile`, {
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
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={colors.primaryLight} />
          </View>
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={16} color={colors.textLight} />
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color={colors.primary} /> Nombre
            </Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color={colors.primary} /> Apellido
            </Text>
            <TextInput
              style={styles.input}
              value={formData.apellido}
              onChangeText={(text) => handleChange('apellido', text)}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="at-outline" size={16} color={colors.primary} /> Usuario
            </Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="call-outline" size={16} color={colors.primary} /> Teléfono
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={formData.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="home-outline" size={16} color={colors.primary} /> Dirección
            </Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{formData.direccion}</Text>
            </View>
            <Text style={styles.helperText}>La dirección no se puede modificar</Text>
          </View>
        </View>

        {/* Botones */}
        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={24} color={colors.textLight} />
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.darkBlueSecondary,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryLight,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  form: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: colors.inputBorder + '50',
    borderColor: colors.inputBorder,
  },
  disabledText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
