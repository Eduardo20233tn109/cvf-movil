import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import { colors } from '../../constants/colors';
import { API_ENDPOINTS } from '../../config/api';
import { apiPost } from '../../services/apiService';

export default function Visita() {
  const navigation = useNavigation();
  const route = useRoute();
  const { visitData } = route?.params || {};
  
  // Validar que visitData exista
  if (!visitData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={{ color: colors.textLight, fontSize: 18, marginTop: 20, textAlign: 'center' }}>
            No se encontraron los datos de la visita
          </Text>
          <TouchableOpacity 
            style={[styles.button, { marginTop: 30 }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
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
      // 🔄 Convertir "10/12/2025" => Date('2025-12-10')
      const [day, month, year] = visitData.fecha.split('/');
      // Asegurar formato de dos dígitos para mes y día
      const monthFormatted = month.padStart(2, '0');
      const dayFormatted = day.padStart(2, '0');
      const fechaISO = new Date(`${year}-${monthFormatted}-${dayFormatted}`);
      
      // Convertir hora "10:50 p.m." a formato 24h "22:50"
      let horaFormateada = visitData.hora;
      if (visitData.hora.includes('p.m.') || visitData.hora.includes('PM')) {
        const [time, period] = visitData.hora.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        if (hour24 !== 12) hour24 += 12;
        horaFormateada = `${hour24}:${minutes}`;
      } else if (visitData.hora.includes('a.m.') || visitData.hora.includes('AM')) {
        const [time] = visitData.hora.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        if (hour24 === 12) hour24 = 0;
        horaFormateada = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      }
  
      const response = await apiPost(API_ENDPOINTS.SAVE_VISIT, {
        fecha: fechaISO,
        hora: horaFormateada,
        numeroPersonas: visitData.numeroPersonas,
        descripcion: visitData.descripcion,
        tipoVisita: visitData.tipoVisita,
        placasVehiculo: visitData.placa,
        contrasena: visitData.contrasena,
        numeroCasa: visitData.numeroCasa,
        nombreVisitante: visitData.nombreVisitante,
        residenteId: visitData.residenteId,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('✅ Visita guardada correctamente:', result);
        
        // La API puede devolver la visita en diferentes formatos
        // Intentamos extraer la visita de diferentes estructuras posibles
        let visitaGuardada = result;
        
        if (result.visit) {
          visitaGuardada = result.visit;
        } else if (result.data) {
          visitaGuardada = result.data;
        } else if (result.success && result.visit) {
          visitaGuardada = result.visit;
        }
        
        // Verificar que tenga _id antes de navegar
        if (visitaGuardada && visitaGuardada._id) {
          console.log('✅ Visita con ID:', visitaGuardada._id);
          navigation.navigate('GenerarQR', { visitData: visitaGuardada });
        } else {
          console.error('❌ La respuesta no contiene _id:', visitaGuardada);
          Alert.alert(
            'Error', 
            'La visita se creó pero no se pudo generar el QR. Intenta nuevamente.'
          );
        }
      }
      else {
        console.error('❌ Error al guardar visita:', result);
        const errorMessage = result?.message || result?.error || 'No se pudo guardar la visita.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      // Solo mostrar error detallado si no es un error de red genérico
      if (error.message && !error.message.includes('Network request failed')) {
        console.error('❌ Error de conexión:', error);
      } else {
        console.error('❌ Error de conexión: No se pudo conectar con el servidor');
      }
      Alert.alert(
        'Error de conexión', 
        'No se pudo conectar con el servidor. Verifica que:\n\n• El servidor esté corriendo\n• Tu dispositivo esté en la misma red WiFi\n• La IP del servidor sea correcta'
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumen de Visita</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card principal */}
        <View style={styles.mainCard}>
          <View style={styles.dateHeader}>
            <Ionicons name="calendar" size={32} color={colors.primary} />
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Fecha y Hora</Text>
              <Text style={styles.dateText}>
                {visitData.fecha} | {visitData.hora}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Información de la visita */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Visitante</Text>
                <Text style={styles.infoValue}>{visitData.nombreVisitante}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Número de Personas</Text>
                <Text style={styles.infoValue}>{visitData.numeroPersonas} persona(s)</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Descripción</Text>
                <Text style={styles.infoValue}>{visitData.descripcion}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="briefcase" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Visita</Text>
                <Text style={styles.infoValue}>{visitData.tipoVisita}</Text>
              </View>
            </View>

            {visitData.placa && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="car" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Placas del Vehículo</Text>
                  <Text style={styles.infoValue}>{visitData.placa}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{visitData.numeroCasa}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card de contraseña */}
        <View style={styles.passwordCard}>
          <View style={styles.passwordHeader}>
            <Ionicons name="lock-closed" size={28} color={colors.primary} />
            <Text style={styles.passwordTitle}>Contraseña de Acceso</Text>
          </View>
          <View style={styles.passwordBox}>
            <Text style={styles.passwordText}>{visitData.contrasena || 'Sin contraseña'}</Text>
          </View>
          <Text style={styles.passwordHint}>
            Comparte esta contraseña con el visitante para que pueda acceder
          </Text>
        </View>

        {/* Botón de acción */}
        <TouchableOpacity style={styles.button} onPress={handleEnviar} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={24} color={colors.textLight} />
          <Text style={styles.buttonText}>Confirmar y Enviar</Text>
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
    paddingTop: 50,
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
  },
  mainCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginVertical: 20,
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  passwordCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  passwordBox: {
    backgroundColor: colors.darkBlue,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryLight,
    letterSpacing: 2,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
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
