import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { API_ENDPOINTS } from '../../config/api';

const estados = ['Todos', 'Pendiente', 'Aprobada', 'Finalizada', 'Cancelada'];

export default function HistoryScreen() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('Pendiente');
  const [visitas, setVisitas] = useState([]);

  const fetchVisitas = async (estado) => {
    try {
      const base = API_ENDPOINTS.VISITS;
      let data = [];
      
      if (estado === 'Todos') {
        // Cuando es "Todos", hacemos peticiones para cada estado y combinamos los resultados
        const estados = ['Pendiente', 'Aprobada', 'Finalizada', 'Cancelada'];
        console.log('📡 Obteniendo todas las visitas (múltiples peticiones)');
        
        const promesas = estados.map(async (est) => {
          try {
            const url = `${base}?estado=${est}&_=${Date.now()}`;
            const response = await fetch(url);
            if (response.ok) {
              const datos = await response.json();
              return Array.isArray(datos) ? datos : [];
            }
            return [];
          } catch (err) {
            console.error(`❌ Error al obtener visitas ${est}:`, err);
            return [];
          }
        });
        
        const resultados = await Promise.all(promesas);
        // Combinar todos los resultados en un solo array
        data = resultados.flat();
        console.log('📋 Datos recibidos (combinados):', data?.length || 0, 'visitas');
      } else {
        // Para estados específicos, hacer una sola petición
        const url = `${base}?estado=${estado}&_=${Date.now()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        data = await response.json();
        console.log('📋 Datos recibidos:', data?.length || 0, 'visitas');
      }
      
      if (Array.isArray(data)) {
        setVisitas(data);
      } else {
        throw new Error('Respuesta inválida');
      }
    } catch (e) {
      if (e.message && !e.message.includes('Network request failed')) {
        console.error('❌ Error al obtener visitas:', e.message);
      }
      setVisitas([]);
    }
  };

  useEffect(() => {
    fetchVisitas(selectedFilter);
  }, [selectedFilter]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobada': return colors.success;
      case 'Pendiente': return colors.warning;
      case 'Finalizada': return colors.primary;
      case 'Cancelada': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'checkmark-circle';
      case 'Pendiente': return 'time';
      case 'Finalizada': return 'checkmark-done-circle';
      case 'Cancelada': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const VisitItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.visitItem}
      onPress={() => navigation.navigate('ValidVisitScreen', { visitData: item })}
      activeOpacity={0.8}
    >
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
            <Ionicons name="person" size={28} color={getEstadoColor(item.estado)} />
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.visitName}>{item.nombreVisitante || 'Sin nombre'}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
            <Ionicons name={getEstadoIcon(item.estado)} size={14} color={getEstadoColor(item.estado)} />
            <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
              {item.estado}
            </Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </View>
      </View>
      
      {/* Separador decorativo */}
      <View style={styles.separator} />
      
      {/* Detalles de la visita */}
      <View style={styles.visitDetails}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailValue}>
              {new Date(item.fecha).toLocaleDateString('es-ES', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="document-text" size={18} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Motivo</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {item.descripcion || 'Sin descripción'}
            </Text>
          </View>
        </View>

        {item.numeroPersonas && (
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="people" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Personas</Text>
              <Text style={styles.detailValue}>{item.numeroPersonas} persona(s)</Text>
            </View>
          </View>
        )}

        {item.placasVehiculo && (
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="car" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Placas</Text>
              <Text style={styles.detailValue}>{item.placasVehiculo}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* CABECERA */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Visitas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* FILTROS */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {estados.map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                selectedFilter === estado && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(estado)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={getEstadoIcon(estado)} 
                size={16} 
                color={selectedFilter === estado ? colors.textLight : colors.primaryLight} 
                style={styles.filterIcon}
              />
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
        </ScrollView>
      </View>

      {/* LISTA */}
      <FlatList
        data={visitas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <VisitItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-outline" size={80} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No hay visitas en esta categoría</Text>
            <Text style={styles.emptySubtext}>Intenta cambiar el filtro o escanear un nuevo QR</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.darkBlueSecondary,
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
  filterSection: {
    backgroundColor: colors.darkBlueSecondary,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '20',
  },
  filterContainer: {
    paddingHorizontal: 15,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.darkBlue,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    marginRight: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.buttonPrimary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterIcon: {
    marginRight: 2,
  },
  filterText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 16,
  },
  visitItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  visitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginBottom: 16,
    marginHorizontal: -4,
  },
  visitDetails: {
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.darkBlueSecondary + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
