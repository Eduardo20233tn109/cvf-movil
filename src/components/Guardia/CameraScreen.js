import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (permission && permission.granted === false) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <View style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={64} color={colors.primary} />
            <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
            <Text style={styles.permissionMessage}>
              Necesitamos acceso a la cámara para escanear códigos QR
            </Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
              <Ionicons name="camera" size={20} color={colors.textLight} />
              <Text style={styles.permissionText}>Dar permiso</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    try {
      const parsed = JSON.parse(data); // intenta convertir el QR en un objeto
      navigation.navigate('ValidVisitScreen', { visitData: parsed });
    } catch (error) {
      // Si no es un objeto válido, pasa el dato en bruto
      navigation.navigate('ValidVisitScreen', { visitData: { raw: data } });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        flashMode="off"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Contenido sobre la cámara con posicionamiento absoluto */}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Instrucción */}
        <View style={styles.instructionContainer}>
          <Ionicons name="qr-code-outline" size={24} color={colors.textLight} />
          <Text style={styles.instructionText}>Coloca el código QR dentro del recuadro</Text>
        </View>

        {/* Recuadro para escaneo */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </SafeAreaView>

      {scanned && (
        <View style={styles.scanSuccessOverlay}>
          <View style={styles.scanSuccessCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.scanSuccessText}>¡QR Escaneado!</Text>
            <TouchableOpacity 
              style={styles.scanAgainButton} 
              onPress={() => setScanned(false)}
            >
              <Ionicons name="refresh" size={20} color={colors.textLight} />
              <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: 'rgba(13, 27, 42, 0.8)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 27, 42, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 10,
  },
  instructionText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBox: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primaryLight,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  permissionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  permissionMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    gap: 10,
  },
  permissionText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanSuccessOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanSuccessCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanSuccessText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 30,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    gap: 10,
  },
  scanAgainText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
