import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import { colors } from '../../constants/colors';

export default function GenerarVisita() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const [visitData, setVisitData] = useState({
    fecha: '',
    hora: '',
    personas: '',
    descripcion: '',
    tipo: '',
    placa: '',
    contrasena: '',
    verificarContrasena: '',
    unidad: '',
    visitante: ''
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user && user.house_id && user.house_id.address) {
      const { address } = user.house_id;  // Suponemos que la casa tiene la estructura correcta
      setVisitData(prev => ({
        ...prev,
        unidad: `${address.street}, ${address.city}, ${address.zip}`, // Concatenamos la dirección
      }));
    } else {
      // Si no se encuentra la casa, asigna un valor predeterminado
      setVisitData(prev => ({
        ...prev,
        unidad: 'No disponible', // No disponible si no hay datos de casa
      }));
    }
  }, [user]);
  

  const handleChange = (field, value) => {
    setVisitData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validarFormulario = () => {
    const newErrors = {};
    const {
      fecha, hora, personas, descripcion, tipo,
      unidad, visitante, contrasena, verificarContrasena
    } = visitData;

    if (!fecha) newErrors.fecha = 'Selecciona una fecha válida.';
    if (!hora) newErrors.hora = 'Selecciona una hora válida.';
    if (!personas || isNaN(personas) || parseInt(personas) <= 0)
      newErrors.personas = 'Debe ser un número mayor a 0.';
    if (!descripcion) newErrors.descripcion = 'Escribe una descripción.';
    if (!tipo) newErrors.tipo = 'Selecciona el tipo de visita.';
    if (!unidad || unidad === 'No disponible') newErrors.unidad = 'No se encontró tu dirección.';
    if (!visitante) newErrors.visitante = 'Escribe el nombre del visitante.';
    if (!contrasena || contrasena.length < 6)
      newErrors.contrasena = 'Mínimo 6 caracteres.';
    if (contrasena !== verificarContrasena)
      newErrors.verificarContrasena = 'Las contraseñas no coinciden.';

    if (fecha && hora) {
      const fechaHora = new Date(`${fecha} ${hora}`);
      if (fechaHora < new Date()) newErrors.fechaHora = 'No puedes agendar en el pasado.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = () => {
    if (!validarFormulario()) return;

    const visitaFormateada = {
      ...visitData,
      numeroPersonas: parseInt(visitData.personas),
      numeroCasa: visitData.unidad,
      nombreVisitante: visitData.visitante,
      tipoVisita: visitData.tipo,
      residenteId: user._id
    };

    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
      navigation.navigate('Visita', { visitData: visitaFormateada });
    }, 1500);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString();
      handleChange('fecha', formattedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      handleChange('hora', formattedTime);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Visita</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Card principal */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>Información de la Visita</Text>
          </View>

          {/* Fecha y hora */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCol}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} /> Fecha
              </Text>
              <TouchableOpacity 
                style={[styles.input, styles.inputWithIcon]} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.inputText, !visitData.fecha && styles.placeholder]}>
                  {visitData.fecha || 'Seleccionar fecha'}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </TouchableOpacity>
              {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
            </View>

            <View style={styles.dateTimeCol}>
              <Text style={styles.label}>
                <Ionicons name="time-outline" size={16} color={colors.primary} /> Hora
              </Text>
              <TouchableOpacity 
                style={[styles.input, styles.inputWithIcon]} 
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.inputText, !visitData.hora && styles.placeholder]}>
                  {visitData.hora || 'Seleccionar hora'}
                </Text>
                <Ionicons name="time" size={20} color={colors.primary} />
              </TouchableOpacity>
              {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}
            </View>
          </View>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="default"
            value={new Date()}
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            display="default"
            value={new Date()}
            onChange={onChangeTime}
          />
        )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="people-outline" size={16} color={colors.primary} /> Número de personas *
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ej: 2"
              placeholderTextColor={colors.textSecondary}
              value={visitData.personas}
              onChangeText={text => handleChange('personas', text)}
            />
            {errors.personas && <Text style={styles.errorText}>{errors.personas}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} /> Descripción *
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Describe el motivo de la visita..."
              placeholderTextColor={colors.textSecondary}
              value={visitData.descripcion}
              onChangeText={text => handleChange('descripcion', text)}
            />
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="briefcase-outline" size={16} color={colors.primary} /> Tipo de visita *
            </Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[styles.tipoButton, visitData.tipo === 'Familiar' && styles.tipoActivo]}
                onPress={() => handleChange('tipo', 'Familiar')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={visitData.tipo === 'Familiar' ? colors.textLight : colors.primary} 
                />
                <Text style={[styles.tipoText, visitData.tipo === 'Familiar' && styles.tipoTextActive]}>
                  Familiar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoButton, visitData.tipo === 'Técnica' && styles.tipoActivo]}
                onPress={() => handleChange('tipo', 'Técnica')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="construct" 
                  size={20} 
                  color={visitData.tipo === 'Técnica' ? colors.textLight : colors.primary} 
                />
                <Text style={[styles.tipoText, visitData.tipo === 'Técnica' && styles.tipoTextActive]}>
                  Técnica
                </Text>
              </TouchableOpacity>
            </View>
            {errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="car-outline" size={16} color={colors.primary} /> Placas de vehículo
            </Text>
            <TextInput
              style={styles.input}
              placeholder="000-00-00 (opcional)"
              placeholderTextColor={colors.textSecondary}
              value={visitData.placa}
              onChangeText={text => handleChange('placa', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="location" size={16} color={colors.primary} /> Dirección a visitar
            </Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{visitData.unidad || 'No disponible'}</Text>
            </View>
            {errors.unidad && <Text style={styles.errorText}>{errors.unidad}</Text>}
          </View>
        </View>

        {/* Card de seguridad */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>Seguridad</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="key-outline" size={16} color={colors.primary} /> Contraseña de acceso *
            </Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textSecondary}
              value={visitData.contrasena}
              onChangeText={text => handleChange('contrasena', text)}
            />
            {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} /> Verificar contraseña *
            </Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Repite la contraseña"
              placeholderTextColor={colors.textSecondary}
              value={visitData.verificarContrasena}
              onChangeText={text => handleChange('verificarContrasena', text)}
            />
            {errors.verificarContrasena && <Text style={styles.errorText}>{errors.verificarContrasena}</Text>}
          </View>
        </View>

        {/* Card de visitante */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>Datos del Visitante</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person" size={16} color={colors.primary} /> Nombre del visitante *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textSecondary}
              value={visitData.visitante}
              onChangeText={text => handleChange('visitante', text)}
            />
            {errors.visitante && <Text style={styles.errorText}>{errors.visitante}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGuardar} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={24} color={colors.textLight} />
          <Text style={styles.buttonText}>Crear Visita</Text>
        </TouchableOpacity>

        <Modal transparent={true} visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              </View>
              <Text style={styles.modalText}>¡Visita creada exitosamente!</Text>
              <Text style={styles.modalSubtext}>Serás redirigido para generar el código QR</Text>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 40,
  },
  formCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeCol: {
    flex: 1,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  inputDisabled: {
    backgroundColor: colors.inputBorder + '50',
    borderColor: colors.inputBorder,
  },
  disabledText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBorder + '30',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    gap: 8,
  },
  tipoActivo: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.buttonPrimary,
  },
  tipoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  tipoTextActive: {
    color: colors.textLight,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 27, 42, 0.8)',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});