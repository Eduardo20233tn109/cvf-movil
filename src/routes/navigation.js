import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserContext } from '../context/userContext';

import LoginScreen from '../components/Login/LoginScreen';
import HomeResidente from '../components/Residente/HomeScreen';
import HomeGuardia from '../components/Guardia/HomeScreen';
import ProfileScreen from '../components/Guardia/ProfileScreen';
import HistoryScreen from '../components/Guardia/HistoryScreen';
import CameraScreen from '../components/Guardia/CameraScreen';
import EditProfileScreen from '../components/Residente/EditProfileScreen';
import GenerarVisita from '../components/Residente/GenerarVisita';
import Visita from '../components/Residente/Visita';
import GenerarQR from '../components/Residente/GenerarQR';
import ValidVisitScreen from '../components/Guardia/ValidVisitScreen';
import HistorialResidenteScreen from '../components/Residente/HistorialResidenteScreen';


const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user } = useContext(UserContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {user.tipoUsuario === 'GUARDIA' ? (
            <Stack.Screen name="HomeGuardia" component={HomeGuardia} />
          ) : (
            <Stack.Screen name="HomeResidente" component={HomeResidente} />
          )}
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: true,
            title: 'INICIO DE SESIÓN',
            headerStyle: { backgroundColor: '#7C4A2D' },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: 'white',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
          }}
        />
      )}

      {/* PANTALLAS EXTRAS */}
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="GenerarVisita" component={GenerarVisita} />
      <Stack.Screen name="Visita" component={Visita} />
      <Stack.Screen name="GenerarQR" component={GenerarQR} />
      <Stack.Screen name="ValidVisitScreen" component={ValidVisitScreen} />
      <Stack.Screen name="HistorialResidenteScreen" component={HistorialResidenteScreen} />
    </Stack.Navigator>
  );
}
