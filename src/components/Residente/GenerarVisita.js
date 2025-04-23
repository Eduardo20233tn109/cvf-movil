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
import { Feather, FontAwesome } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C4BDA6' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CREAR VISITAS</Text>

        {/* Fecha y hora */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Fecha:</Text>
            <TouchableOpacity style={styles.inputIconRow} onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.inputIcon}
                value={visitData.fecha}
                placeholder="dd/mm/aaaa"
                editable={false}
              />
              <Feather name="calendar" size={20} color="#333" />
            </TouchableOpacity>
            {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Hora:</Text>
            <TouchableOpacity style={styles.inputIconRow} onPress={() => setShowTimePicker(true)}>
              <TextInput
                style={styles.inputIcon}
                value={visitData.hora}
                placeholder="hh:mm"
                editable={false}
              />
              <FontAwesome name="clock-o" size={20} color="#333" />
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

        <Text style={styles.label}>Número de personas: *</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={visitData.personas}
          onChangeText={text => handleChange('personas', text)}
        />
        {errors.personas && <Text style={styles.errorText}>{errors.personas}</Text>}

        <Text style={styles.label}>Descripción: *</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          multiline
          value={visitData.descripcion}
          onChangeText={text => handleChange('descripcion', text)}
        />
        {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}

        <Text style={styles.label}>Tipo de visita: *</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.tipoButton, visitData.tipo === 'Familiar' && styles.tipoActivo]}
            onPress={() => handleChange('tipo', 'Familiar')}
          >
            <Feather name="users" size={20} color="#333" style={{ marginRight: 6 }} />
            <Text style={styles.tipoText}>Familiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoButton, visitData.tipo === 'Técnica' && styles.tipoActivo]}
            onPress={() => handleChange('tipo', 'Técnica')}
          >
            <Feather name="tool" size={20} color="#333" style={{ marginRight: 6 }} />
            <Text style={styles.tipoText}>Técnica</Text>
          </TouchableOpacity>
        </View>
        {errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}

        <Text style={styles.label}>Placas de vehículo:</Text>
        <TextInput
          style={styles.input}
          placeholder="000-00-00"
          value={visitData.placa}
          onChangeText={text => handleChange('placa', text)}
        />

        <Text style={styles.label}>Contraseña: *</Text>
        <TextInput
          style={styles.input}
          placeholder="Palabra clave"
          value={visitData.contrasena}
          onChangeText={text => handleChange('contrasena', text)}
        />
        {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}

        <Text style={styles.label}>Verificar contraseña: *</Text>
        <TextInput
          style={styles.input}
          placeholder="Repetir palabra clave"
          value={visitData.verificarContrasena}
          onChangeText={text => handleChange('verificarContrasena', text)}
        />
        {errors.verificarContrasena && <Text style={styles.errorText}>{errors.verificarContrasena}</Text>}

        <Text style={styles.label}>Número de casa (automático):</Text>
        <TextInput
          style={styles.input}
          value={visitData.unidad}
          editable={false}
        />
        {errors.unidad && <Text style={styles.errorText}>{errors.unidad}</Text>}

        <Text style={styles.label}>Nombre del visitante: *</Text>
        <TextInput
          style={styles.input}
          value={visitData.visitante}
          onChangeText={text => handleChange('visitante', text)}
        />
        {errors.visitante && <Text style={styles.errorText}>{errors.visitante}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleGuardar}>
          <Text style={styles.buttonText}>Crear visita</Text>
        </TouchableOpacity>

        <Modal transparent={true} visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Feather name="check-circle" size={80} color="#4BB543" />
              <Text style={styles.modalText}>¡Visita creada exitosamente!</Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C4BDA6',
    padding: 20,
    paddingTop: 55, // ⬅️ agrega espacio extra arriba
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#7C4A2D',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 14,
    color: 'black',
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    width: '100%',
    marginTop: 4,
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EDEDED',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 4,
  },
  inputIcon: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    marginRight: 10,
  },
  tipoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginTop: 10,
    marginRight: 10,
  },
  tipoActivo: {
    backgroundColor: '#B0D9A3',
  },
  tipoText: {
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#4D5637',
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});