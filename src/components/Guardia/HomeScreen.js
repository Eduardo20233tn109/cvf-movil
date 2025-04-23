import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/userContext';

export default function HomeGuardia() {
  const { logout, user } = useContext(UserContext);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-250))[0];

  const toggleMenu = () => {
    const toValue = menuVisible ? -250 : 0;
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#C4BDA6', alignItems: 'center' }}>
      {/* CABECERA */}
      <View style={{
        position: 'absolute', top: 0, width: '100%', paddingTop: 50,
        paddingBottom: 10, backgroundColor: '#7C4A2D',
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, elevation: 4, zIndex: 20,
      }}>
        <TouchableOpacity onPress={toggleMenu}>
          <Image source={require('../../images/menu.png')} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>HOME</Text>
        <TouchableOpacity onPress={logout}>
          <Image source={require('../../images/log-out.png')} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      </View>

      {/* FONDO OSCURO */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 9,
          }} />
        </TouchableWithoutFeedback>
      )}

      {/* MENÚ LATERAL */}
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        width: 220,
        height: '100%',
        backgroundColor: '#7C4A2D',
        paddingTop: 90,
        paddingHorizontal: 20,
        zIndex: 10,
        elevation: 5,
        left: menuAnimation,
      }}>
        <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 120 }}>
          <Image source={require('../../images/Guardia/guardia.png')} style={{ width: 80, height: 80, borderRadius: 40 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
            {user?.nombre || 'Usuario'}
          </Text>
          <Text style={{ color: '#eee', fontSize: 14, marginTop: 2 }}>
            {user?.tipoUsuario || 'ROL'}
          </Text>
        </View>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Image source={require('../../images/Guardia/guardia.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          onPress={() => navigation.navigate('HistoryScreen')}
        >
          <Image source={require('../../images/Guardia/visita.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Visitas</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CONTENIDO CENTRAL */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 }}>
        <TouchableOpacity
          style={{
            marginTop: 25, backgroundColor: '#4D5637', paddingHorizontal: 40,
            paddingVertical: 10, borderRadius: 8, elevation: 6,
          }}
          onPress={() => navigation.navigate('CameraScreen')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Visitas</Text>
        </TouchableOpacity>

        <Image source={require('../../images/Guardia/visita.png')} style={{ width: 80, height: 80, marginTop: 10 }} />

        <TouchableOpacity
          style={{
            marginTop: 25, backgroundColor: '#4D5637', paddingHorizontal: 40,
            paddingVertical: 10, borderRadius: 8, elevation: 6,
          }}
          onPress={() => navigation.navigate('CameraScreen')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Gestionar salidas</Text>
        </TouchableOpacity>

        <Image source={require('../../images/Guardia/salida.png')} style={{ width: 80, height: 80, marginTop: 10 }} />

        <Image source={require('../../images/Guardia/Logo.png')} style={{ width: 140, height: 140, marginTop: 40 }} />
      </View>
    </View>
  );
}
