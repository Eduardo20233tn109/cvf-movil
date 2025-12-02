import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function GenerarQR({ route }) {
  const navigation = useNavigation();
  const { visitData } = route?.params || {};
  const viewShotRef = useRef();

  // Validar que route y visitData existan
  if (!route || !visitData) {
    console.error('❌ Error: route o visitData no están definidos:', { route, visitData });
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

  // Validar que visitData tenga _id
  if (!visitData._id) {
    console.error('❌ Error: visitData no tiene _id:', visitData);
    Alert.alert(
      'Error',
      'No se pudo generar el código QR. La visita no tiene un ID válido.',
      [
        {
          text: 'Volver',
          onPress: () => navigation.goBack(),
        },
      ]
    );
    return null;
  }

  const dataParaQR = {
    _id: visitData._id,
  };

  const compartirQR = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'No se puede capturar el QR. Intenta nuevamente.');
        return;
      }
      
      // Delay más largo para asegurar que el componente esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Intentar capturar con diferentes métodos
      let uri;
      try {
        uri = await viewShotRef.current.capture();
      } catch (captureError) {
        console.error('❌ Error en primera captura:', captureError);
        // Intentar nuevamente con más delay
        await new Promise(resolve => setTimeout(resolve, 200));
        uri = await viewShotRef.current.capture();
      }
      
      if (!uri) {
        Alert.alert('Error', 'No se pudo generar la imagen del QR');
        return;
      }
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
        return;
      }
      
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error('❌ Error al compartir QR:', e);
      Alert.alert('Error', `No se pudo compartir el QR: ${e.message || 'Error desconocido'}`);
    }
  };

  const guardarQR = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'No se puede capturar el QR. Intenta nuevamente.');
        return;
      }

      // Delay más largo para asegurar que el componente esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capturar la imagen con reintentos
      let uri;
      try {
        uri = await viewShotRef.current.capture();
      } catch (captureError) {
        console.error('❌ Error en primera captura:', captureError);
        // Intentar nuevamente con más delay
        await new Promise(resolve => setTimeout(resolve, 200));
        uri = await viewShotRef.current.capture();
      }
      
      if (!uri) {
        Alert.alert('Error', 'No se pudo generar la imagen del QR');
        return;
      }

      // Usar expo-sharing directamente (no requiere permisos especiales)
      // Esto permite al usuario guardar el QR usando el menú nativo de compartir
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Guardar código QR',
          UTI: 'public.png'
        });
        // No mostramos alerta aquí porque el usuario ya tiene el menú de compartir abierto
      } else {
        Alert.alert(
          'Error', 
          'La función de compartir no está disponible en este dispositivo. Intenta usar "Compartir QR" en su lugar.'
        );
      }
    } catch (e) {
      console.error('❌ Error al guardar QR:', e);
      Alert.alert('Error', `No se pudo guardar el QR: ${e.message || 'Error desconocido'}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Código QR de Visita</Text>
          <Text style={styles.subtitle}>
            Muestra este código al guardia para validar tu visita
          </Text>

          <View style={styles.shotContainer}>
            <ViewShot 
              ref={viewShotRef} 
              options={{ 
                format: 'png', 
                quality: 1.0,
                result: 'tmpfile',
                snapshotContentContainer: false
              }}
              style={styles.viewShotStyle}
            >
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={JSON.stringify(dataParaQR)}
                    size={250}
                    color={colors.textPrimary}
                    backgroundColor={colors.white}
                  />
                </View>
                <View style={styles.qrInfo}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <Text style={styles.qrInfoText}>
                    ID de visita: {visitData._id?.substring(0, 8) || 'N/A'}
                  </Text>
                </View>
              </View>
            </ViewShot>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={compartirQR}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={24} color={colors.textLight} />
              <Text style={styles.buttonText}>Compartir QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={guardarQR}
              activeOpacity={0.8}
            >
              <Ionicons name="download" size={24} color={colors.textLight} />
              <Text style={styles.buttonText}>Guardar QR</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeResidente' }],
              })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="home" size={20} color={colors.primary} />
            <Text style={styles.homeButtonText}>Ir al Inicio</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  shotContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  viewShotStyle: {
    backgroundColor: 'transparent',
  },
  qrContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrWrapper: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
    gap: 8,
  },
  qrInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonPrimary: {
    backgroundColor: colors.buttonPrimary,
  },
  buttonSecondary: {
    backgroundColor: colors.darkBlueSecondary,
  },
  buttonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  homeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
