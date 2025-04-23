import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';

const estados = ['Todos', 'Pendiente', 'Aprobada', 'Finalizada', 'Cancelada'];

export default function HistoryScreen() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('Pendiente');
  const [visitas, setVisitas] = useState([]);

  const fetchVisitas = async (estado) => {
    try {
      const url =
        estado === 'Todos'
          ? 'http://192.168.0.166:4000/api/visits'
          : `http://192.168.0.166:4000/api/visits?estado=${estado}`;
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setVisitas(data);
      } else {
        throw new Error('Respuesta inválida');
      }
    } catch (e) {
      console.error('❌ Error al obtener visitas:', e.message);
      Alert.alert('Error', 'No se pudieron cargar las visitas');
    }
  };

  useEffect(() => {
    fetchVisitas(selectedFilter);
  }, [selectedFilter]);

  const VisitItem = ({ item }) => (
    <View style={styles.visitItem}>
      <Text style={styles.name}>{item.nombreVisitante}</Text>
      <Text style={styles.detail}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
      <Text style={styles.detail}>Motivo: {item.descripcion}</Text>
      <Text
        style={[
          styles.detail,
          {
            color:
              item.estado === 'Aprobada'
                ? 'green'
                : item.estado === 'Pendiente'
                ? 'orange'
                : item.estado === 'Finalizada'
                ? '#4D5637'
                : 'red',
          },
        ]}
      >
        Estado: {item.estado}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* CABECERA */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Visitas</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ESPACIO después del header */}
      <View style={{ marginTop: 100 }} />

      {/* FILTROS */}
      <View style={styles.filterRow}>
        {estados.map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[
              styles.filterButton,
              selectedFilter === estado && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(estado)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === estado && styles.filterTextActive,
              ]}
            >
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.separator} />

      {/* LISTA */}
      <FlatList
        data={visitas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <VisitItem item={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay visitas en esta categoría.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C4BDA6',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#7C4A2D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flexGrow: 1,
    margin: 4,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4D5637',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4D5637',
  },
  filterText: {
    color: '#4D5637',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  separator: {
    height: 4,
    backgroundColor: '#6E3B24',
    marginBottom: 12,
    borderRadius: 2,
    marginHorizontal: 10,
  },
  visitItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 10,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4D5637',
    fontStyle: 'italic',
  },
});
