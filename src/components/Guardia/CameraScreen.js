import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState('off');
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (permission && permission.granted === false) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Dar permiso</Text>
        </TouchableOpacity>
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

  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'torch' : 'off'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flash}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Instrucción con fondo */}
        <Text style={styles.instructionText}>Favor de colocar el QR dentro del recuadro</Text>

        {/* Recuadro para escaneo */}
        <View style={styles.qrBox} />

        {/* Botones inferiores */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Text style={styles.buttonText}>{flash === 'off' ? 'Activar Flash' : 'Desactivar Flash'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBox: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: 250,
    height: 250,
    borderColor: '#FFF',
    borderWidth: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  instructionText: {
    position: 'absolute',
    top: '18%',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    color: '#7C4A2D',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  flashButton: {
    padding: 10,
    backgroundColor: '#7C4A2D',
    borderRadius: 8,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#7C4A2D',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  permissionButton: {
    backgroundColor: '#7C4A2D',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  permissionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
