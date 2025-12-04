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
import { colors } from '../../constants/colors';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import { apiGet, apiPutFormData, apiPost } from '../../services/apiService';

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
          const res = await apiGet(API_ENDPOINTS.GET_VISIT(data._id));
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

      const response = await apiPutFormData(API_ENDPOINTS.UPDATE_VISIT_STATUS_WITH_EVIDENCE(data._id), formData);

      if (response.ok) {
        // Obtener el nuevo estado de la visita después de la actualización
        const result = await response.json();
        const nuevaVisita = result?.data || result?.visit || result;
        const nuevoEstado = nuevaVisita?.estado || (data.estado === 'Pendiente' ? 'Aprobada' : 'Finalizada');
        
        // Enviar notificación al residente
        try {
          const residenteId = typeof data.residenteId === 'object' 
            ? data.residenteId._id || data.residenteId 
            : data.residenteId;
          
          if (residenteId) {
            const tipoAccion = nuevoEstado === 'Aprobada' ? 'entrada' : 'salida';
            const titulo = `Visita ${tipoAccion === 'entrada' ? 'validada' : 'finalizada'}`;
            
            // Crear mensaje con observaciones y verificaciones
            let mensaje = `Tu visita ha sido ${tipoAccion === 'entrada' ? 'validada (entrada)' : 'finalizada (salida)'}.\n\n`;
            
            if (comments && comments.trim()) {
              mensaje += `Observaciones:\n${comments}\n\n`;
            }
            
            // Agregar información sobre verificaciones
            const verificacionesRealizadas = Object.keys(verifications).filter(key => verifications[key]);
            if (verificacionesRealizadas.length > 0) {
              mensaje += `Verificaciones realizadas:\n`;
              verificacionesRealizadas.forEach(key => {
                const labels = {
                  contrasena: 'Palabra clave',
                  numeroPersonas: 'Número de personas',
                  descripcion: 'Descripción',
                  tipoVisita: 'Tipo de visita',
                  numeroCasa: 'Número de casa',
                  placasVehiculo: 'Placas del vehículo'
                };
                mensaje += `✓ ${labels[key] || key}\n`;
              });
            }
            
            // Enviar notificación
            const notifResponse = await apiPost(API_ENDPOINTS.CREATE_NOTIFICATION, {
              usuarioId: residenteId,
              visitaId: data._id,
              titulo: titulo,
              mensaje: mensaje,
              tipo: 'validacion_visita',
              leida: false
            });
            
            if (notifResponse.ok) {
              console.log('✅ Notificación enviada al residente');
            } else {
              const notifError = await notifResponse.json();
              
              if (notifResponse.status === 404) {
                console.log('⚠️ Endpoint de notificaciones no disponible');
              } else if (notifResponse.status === 400) {
                // Errores de validación del backend
                console.warn('⚠️ Error de validación al crear notificación:', notifError.message || notifError);
              } else if (notifResponse.status === 403) {
                console.warn('⚠️ No tiene permiso para crear notificación');
              } else {
                console.warn('⚠️ Error al enviar notificación:', notifError.message || notifError);
              }
            }
          }
        } catch (notifError) {
          console.error('⚠️ Error al enviar notificación (la visita se guardó correctamente):', notifError);
          // No mostramos error al usuario si falla la notificación, ya que la visita se guardó bien
        }
        
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

  // Determinar el texto del botón según el estado de la visita
  const getTextoBoton = () => {
    if (data.estado === 'Pendiente') {
      return 'Validar Entrada';
    } else if (data.estado === 'Aprobada') {
      return 'Registrar Salida';
    } else if (data.estado === 'Finalizada') {
      return 'Visita Finalizada';
    } else if (data.estado === 'Cancelada') {
      return 'Visita Cancelada';
    }
    return 'Validar Visita';
  };

  const textoBoton = getTextoBoton();

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
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validar Visita</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Información de la visita */}
        <View style={styles.visitCard}>
          <View style={styles.visitHeader}>
            <Ionicons name="person-circle" size={40} color={colors.primary} />
            <View style={styles.visitHeaderText}>
              <Text style={styles.visitName}>{data.nombreVisitante || 'Visitante'}</Text>
              <Text style={styles.visitDate}>
                {new Date(data.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Campos de verificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verificaciones</Text>
          {[
            { label: 'Palabra clave', value: data.contrasena, key: 'contrasena', icon: 'key-outline' },
            { label: 'Número de personas', value: `${data.numeroPersonas || 0} persona(s)`, key: 'numeroPersonas', icon: 'people-outline' },
            { label: 'Descripción', value: data.descripcion, key: 'descripcion', icon: 'document-text-outline' },
            { label: 'Tipo de visita', value: data.tipoVisita, key: 'tipoVisita', icon: 'briefcase-outline' },
            { label: 'Número de casa', value: data.numeroCasa, key: 'numeroCasa', icon: 'home-outline' },
            { label: 'Placas del vehículo', value: data.placasVehiculo || data.placa || 'N/A', key: 'placasVehiculo', icon: 'car-outline' },
          ].map(({ label, value, key, icon }) => (
            <TouchableOpacity 
              key={key} 
              style={[styles.verificationItem, verifications[key] && styles.verificationItemChecked]}
              onPress={() => toggleVerification(key)}
              activeOpacity={0.7}
            >
              <View style={styles.verificationContent}>
                <View style={styles.verificationIcon}>
                  <Ionicons name={icon} size={20} color={verifications[key] ? colors.success : colors.textSecondary} />
                </View>
                <View style={styles.verificationText}>
                  <Text style={styles.verificationLabel}>{label}</Text>
                  <Text style={styles.verificationValue}>{value || 'No especificado'}</Text>
                </View>
              </View>
              <View style={[styles.checkBox, verifications[key] && styles.checkBoxChecked]}>
                {verifications[key] && (
                  <Ionicons name="checkmark" size={16} color={colors.textLight} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fotografías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotografías de evidencia</Text>
          <View style={styles.imageRow}>
            {images.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => tomarFoto(index)} 
                style={styles.imageBox}
                activeOpacity={0.7}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                    <Text style={styles.imagePlaceholderText}>Foto {index + 1}</Text>
                  </View>
                )}
                {img && (
                  <View style={styles.imageBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Observaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
          <TextInput
            placeholder="Escribe tus observaciones aquí..."
            placeholderTextColor={colors.textSecondary}
            value={comments}
            onChangeText={setComments}
            multiline
            style={styles.textArea}
          />
        </View>

        {/* Botón de acción */}
        <TouchableOpacity onPress={handleEnviar} style={styles.button} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={24} color={colors.textLight} />
          <Text style={styles.buttonText}>{textoBoton}</Text>
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
    color: colors.primaryLight, 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  content: { 
    padding: 20,
    paddingBottom: 40,
  },
  visitCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  visitHeaderText: {
    flex: 1,
  },
  visitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  verificationItemChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    flex: 1,
  },
  verificationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  verificationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  checkBoxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  imageRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },
  imageBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.inputBorder,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inputBorder,
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  imageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    minHeight: 120,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: { 
    color: colors.textLight, 
    fontWeight: 'bold', 
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
