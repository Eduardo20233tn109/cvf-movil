import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal,
  KeyboardAvoidingView, ScrollView, Platform, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');

  // Animaciones para el fondo
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const animatedValue3 = useRef(new Animated.Value(0)).current;

  // Animación para el card de login
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  // Animación para el modal
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada del card
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación continua para círculos de fondo
    const animateCircles = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue1, {
              toValue: 1,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue1, {
              toValue: 0,
              duration: 6000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue2, {
              toValue: 1,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue2, {
              toValue: 0,
              duration: 8000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue3, {
              toValue: 1,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue3, {
              toValue: 0,
              duration: 10000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };

    animateCircles();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      // Animación de entrada del modal
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset para la próxima vez que se abra
      modalScale.setValue(0);
      modalOpacity.setValue(0);
    }
  }, [modalVisible]);

  const showModal = (message) => {
    setModalText(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      return showModal('Favor de rellenar todos los campos.');
    }

    try {
      const response = await fetch('http://192.168.0.138:4000/api/users/login-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('🔐 Respuesta backend:', data);

      const { user, token } = data;

      if (!response.ok || !user || !token) {
        return showModal(data.message || 'Error en el inicio de sesión');
      }

      const userData = { ...user, token };
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      login(userData);
    } catch (error) {
      // Solo mostrar error detallado si no es un error de red genérico
      if (error.message && !error.message.includes('Network request failed')) {
        console.error('❌ Error de conexión:', error);
      } else {
        console.error('❌ Error de conexión: No se pudo conectar con el servidor');
      }
      showModal('No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté disponible.');
    }
  };

  // Interpolaciones para los círculos animados
  const circle1TranslateY = animatedValue1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });
  const circle1Opacity = animatedValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.4, 0.15],
  });
  const circle1Scale = animatedValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const circle2TranslateX = animatedValue2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });
  const circle2Opacity = animatedValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.35, 0.15],
  });
  const circle2Scale = animatedValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  const circle3TranslateY = animatedValue3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });
  const circle3Opacity = animatedValue3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.3, 0.15],
  });
  const circle3Scale = animatedValue3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <View style={styles.container}>
      {/* Círculos animados de fondo */}
      <Animated.View
        style={[
          styles.animatedCircle,
          styles.circle1,
          {
            transform: [
              { translateY: circle1TranslateY },
              { scale: circle1Scale },
            ],
            opacity: circle1Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.animatedCircle,
          styles.circle2,
          {
            transform: [
              { translateX: circle2TranslateX },
              { scale: circle2Scale },
            ],
            opacity: circle2Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.animatedCircle,
          styles.circle3,
          {
            transform: [
              { translateY: circle3TranslateY },
              { scale: circle3Scale },
            ],
            opacity: circle3Opacity,
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header con logo y título */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Image 
                  source={require('../../../assets/LOGOTIPO.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>CONTROL DE VISITAS</Text>
            <Text style={styles.subtitle}>ACCESO MÓVIL</Text>
          </View>

          {/* Formulario de login */}
          <Animated.View 
            style={[
              styles.loginCard,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario o correo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su usuario"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons 
                    name={passwordVisible ? 'eye' : 'eye-off'} 
                    size={24} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>INGRESAR</Text>
            </TouchableOpacity>
          </Animated.View>

          <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  opacity: modalOpacity,
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              />
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ scale: modalScale }],
                  },
                ]}
              >
                {/* Efecto de reflejo superior */}
                <View style={styles.glassReflectionTop} />
                {/* Efecto de reflejo lateral */}
                <View style={styles.glassReflectionSide} />
                
                <View style={styles.modalIconContainer}>
                  <Ionicons name="information-circle" size={48} color={colors.primary} />
                </View>
                <Text style={styles.modalText}>{modalText}</Text>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.darkBlue,
    overflow: 'hidden',
  },
  animatedCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: colors.primaryLight,
    top: height * 0.3,
    right: -80,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: colors.primary,
    bottom: -50,
    left: width * 0.2,
  },
  keyboardContainer: { 
    flex: 1 
  },
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20, 
    paddingTop: 60 
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.darkBlueSecondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: '85%',
    height: '85%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  loginCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textPrimary, 
    marginBottom: 8 
  },
  input: {
    height: 50, 
    backgroundColor: colors.inputBackground, 
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: colors.inputBackground, 
    borderRadius: 12, 
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  passwordInput: { 
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: { 
    color: colors.textLight, 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 1,
  },
  modalContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.85)',
  },
  modalContent: {
    width: 320, 
    padding: 30, 
    backgroundColor: 'rgba(224, 247, 250, 0.85)', // Fondo semitransparente tipo cristal
    borderRadius: 24, 
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(72, 209, 204, 0.4)', // Borde sutil tipo cristal
    overflow: 'hidden',
    // Efecto de brillo
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderRightColor: 'rgba(72, 209, 204, 0.3)',
    borderBottomColor: 'rgba(32, 178, 170, 0.3)',
  },
  glassReflectionTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Reflejo superior
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  glassReflectionSide: {
    position: 'absolute',
    top: '20%',
    left: 0,
    width: '30%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Reflejo lateral
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    transform: [{ skewY: '-10deg' }],
  },
  modalIconContainer: {
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 20, 
    textAlign: 'center',
    color: colors.textPrimary,
  },
  modalButton: {
    backgroundColor: colors.buttonPrimary, 
    paddingVertical: 12,
    paddingHorizontal: 30, 
    borderRadius: 12,
  },
  modalButtonText: { 
    color: colors.textLight, 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});
