import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function HomeGuardia() {
  const { logout, user } = useContext(UserContext);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-280))[0];

  const toggleMenu = () => {
    const toValue = menuVisible ? -280 : 0;
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      {/* CABECERA */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={toggleMenu} style={styles.headerButton}>
          <View style={styles.iconCircle}>
            <Ionicons name="menu" size={24} color={colors.primaryLight} />
          </View>
        </TouchableOpacity>
        <View style={styles.logoHeader}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../../../assets/LOGOTIPO.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>CVF</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY OSCURO cuando el menú está abierto */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View 
            style={[
              styles.overlay,
              {
                opacity: menuVisible ? 0.5 : 0,
              }
            ]} 
          />
        </TouchableWithoutFeedback>
      )}

      {/* MENÚ LATERAL */}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnimation }] }]}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="shield" size={40} color={colors.primaryLight} />
          </View>
          <Text style={styles.profileName}>
            {user?.nombre || 'Usuario'}
          </Text>
          <Text style={styles.profileRole}>
            {user?.tipoUsuario || 'GUARDIA'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('ProfileScreen');
            toggleMenu();
          }}
        >
          <Ionicons name="person-outline" size={24} color={colors.textLight} />
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('HistoryScreen');
            toggleMenu();
          }}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.textLight} />
          <Text style={styles.menuText}>Visitas</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CONTENIDO CENTRAL */}
      <View style={styles.mainContent}>
        {/* Escanear QR - Función principal */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CameraScreen')}
        >
          <Ionicons name="qr-code" size={28} color={colors.textLight} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Escanear QR</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="qr-code-outline" size={80} color={colors.primary} />
        </View>

        <Text style={styles.description}>
          Escanea el código QR para validar entradas y salidas de visitantes
        </Text>

        {/* Historial */}
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('HistoryScreen')}
        >
          <Ionicons name="list" size={24} color={colors.textLight} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Historial de Visitas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.darkBlueSecondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.darkBlue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primaryLight + '50',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoImage: {
    width: '85%',
    height: '85%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryLight,
  },
  logoutText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 15,
    elevation: 10,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    backgroundColor: colors.darkBlueSecondary,
    paddingTop: 90,
    paddingHorizontal: 20,
    zIndex: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '30',
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileRole: {
    color: colors.primaryLight,
    fontSize: 14,
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: colors.darkBlue + '50',
  },
  menuText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 15,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 1,
  },
  button: {
    marginTop: 30,
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginTop: 30,
    padding: 30,
    backgroundColor: colors.darkBlueSecondary + '50',
    borderRadius: 30,
    marginBottom: 20,
  },
  description: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 40,
    opacity: 0.8,
    lineHeight: 20,
  },
  buttonSecondary: {
    backgroundColor: colors.darkBlueSecondary,
    marginTop: 20,
  },
});
