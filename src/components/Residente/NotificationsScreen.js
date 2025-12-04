import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  RefreshControl, Alert, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/userContext';
import { colors } from '../../constants/colors';
import { API_ENDPOINTS } from '../../config/api';
import { apiGet, apiPut } from '../../services/apiService';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  const fetchNotifications = async () => {
    try {
      const response = await apiGet(API_ENDPOINTS.GET_NOTIFICATIONS(user._id));
      const data = await response.json();
      
      if (response.ok) {
        // Manejar diferentes formatos de respuesta
        let notificationsArray = [];
        
        if (Array.isArray(data)) {
          notificationsArray = data;
        } else if (data && Array.isArray(data.notifications)) {
          notificationsArray = data.notifications;
        } else if (data && Array.isArray(data.data)) {
          notificationsArray = data.data;
        }
        
        // El backend ya retorna las notificaciones ordenadas por fecha descendente
        // Pero por si acaso, ordenamos nuevamente
        const sorted = notificationsArray.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.fechaCreacion || 0);
          const dateB = new Date(b.createdAt || b.fechaCreacion || 0);
          return dateB - dateA;
        });
        
        setNotifications(sorted);
      } else {
        // Manejar diferentes tipos de errores del backend
        if (response.status === 404) {
          // Usuario no encontrado o endpoint no disponible
          if (data && data.message && data.message.includes('Usuario no encontrado')) {
            console.log('⚠️ Usuario no encontrado');
          } else {
            console.log('⚠️ Endpoint de notificaciones no disponible');
          }
          setNotifications([]);
        } else if (response.status === 400) {
          // Datos inválidos
          console.error('Error de validación:', data);
          setNotifications([]);
        } else {
          // Otros errores
          console.error('Error al obtener notificaciones:', data);
          setNotifications([]);
        }
      }
    } catch (error) {
      // Manejar errores de red o de parsing
      if (error.message && !error.message.includes('Network request failed')) {
        console.error('Error al obtener notificaciones:', error);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await apiPut(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {});

      if (response.ok) {
        // Actualizar el estado local
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, leida: true }
              : notif
          )
        );
      } else if (response.status === 404) {
        // Si el endpoint no existe, actualizar solo localmente
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, leida: true }
              : notif
          )
        );
      }
    } catch (error) {
      // Si hay error, actualizar solo localmente
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, leida: true }
            : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiPut(API_ENDPOINTS.MARK_ALL_READ(user._id), {});

      if (response.ok || response.status === 404) {
        // Actualizar localmente incluso si el endpoint no existe
        setNotifications(prev => prev.map(notif => ({ ...notif, leida: true })));
        if (response.ok) {
          Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
        }
      } else {
        // Si hay otro error, actualizar localmente de todas formas
        setNotifications(prev => prev.map(notif => ({ ...notif, leida: true })));
      }
    } catch (error) {
      // Si hay error, actualizar localmente de todas formas
      setNotifications(prev => prev.map(notif => ({ ...notif, leida: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    
    // Si la notificación no está leída, marcarla como leída
    if (!notification.leida) {
      markAsRead(notification._id);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const NotificationItem = ({ item }) => {
    const isUnread = !item.leida;
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.notificationItemUnread]}
        onPress={() => openNotificationModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, isUnread && styles.iconContainerUnread]}>
            <Ionicons 
              name={item.tipo === 'validacion_visita' ? 'checkmark-circle' : 'notifications'} 
              size={24} 
              color={isUnread ? colors.primary : colors.textSecondary} 
            />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, isUnread && styles.titleUnread]}>
                {item.titulo || 'Notificación'}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            
            <Text style={styles.message} numberOfLines={3}>
              {item.mensaje || 'Sin mensaje'}
            </Text>
            
            <Text style={styles.date}>
              {item.createdAt || item.fechaCreacion
                ? new Date(item.createdAt || item.fechaCreacion).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Fecha no disponible'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryLight} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </SafeAreaView>

      {loading && notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Cargando notificaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={({ item }) => <NotificationItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="notifications-outline" size={80} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyText}>No hay notificaciones</Text>
              <Text style={styles.emptySubtext}>
                Recibirás notificaciones cuando el guardia valide tus visitas
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de detalle de notificación */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedNotification && (
              <>
                {/* Header del modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={[styles.modalIconContainer, !selectedNotification.leida && styles.modalIconContainerUnread]}>
                      <Ionicons 
                        name={selectedNotification.tipo === 'validacion_visita' ? 'checkmark-circle' : 'notifications'} 
                        size={32} 
                        color={!selectedNotification.leida ? colors.primary : colors.textSecondary} 
                      />
                    </View>
                    <View style={styles.modalHeaderText}>
                      <Text style={styles.modalTitle}>
                        {selectedNotification.titulo || 'Notificación'}
                      </Text>
                      <Text style={styles.modalDate}>
                        {selectedNotification.createdAt || selectedNotification.fechaCreacion
                          ? new Date(selectedNotification.createdAt || selectedNotification.fechaCreacion).toLocaleString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Fecha no disponible'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={28} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Información de la visita si está disponible */}
                {selectedNotification.visitaId && typeof selectedNotification.visitaId === 'object' && (
                  <View style={styles.visitInfoCard}>
                    <Text style={styles.visitInfoTitle}>Información de la visita</Text>
                    {selectedNotification.visitaId.nombreVisitante && (
                      <View style={styles.visitInfoRow}>
                        <Ionicons name="person" size={16} color={colors.primary} />
                        <Text style={styles.visitInfoText}>
                          Visitante: {selectedNotification.visitaId.nombreVisitante}
                        </Text>
                      </View>
                    )}
                    {selectedNotification.visitaId.fecha && (
                      <View style={styles.visitInfoRow}>
                        <Ionicons name="calendar" size={16} color={colors.primary} />
                        <Text style={styles.visitInfoText}>
                          Fecha: {new Date(selectedNotification.visitaId.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    )}
                    {selectedNotification.visitaId.hora && (
                      <View style={styles.visitInfoRow}>
                        <Ionicons name="time" size={16} color={colors.primary} />
                        <Text style={styles.visitInfoText}>
                          Hora: {selectedNotification.visitaId.hora}
                        </Text>
                      </View>
                    )}
                    {selectedNotification.visitaId.estado && (
                      <View style={styles.visitInfoRow}>
                        <Ionicons name="information-circle" size={16} color={colors.primary} />
                        <Text style={styles.visitInfoText}>
                          Estado: {selectedNotification.visitaId.estado}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Mensaje completo */}
                <ScrollView style={styles.modalMessageContainer} showsVerticalScrollIndicator={true}>
                  <Text style={styles.modalMessage}>
                    {selectedNotification.mensaje || 'Sin mensaje'}
                  </Text>
                </ScrollView>

                {/* Botón de cerrar */}
                <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: 10,
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
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitle: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 16,
  },
  notificationItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.inputBorder + '30',
  },
  notificationItemUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerUnread: {
    backgroundColor: colors.primary + '30',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
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
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconContainerUnread: {
    backgroundColor: colors.primary + '30',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  modalDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitInfoCard: {
    backgroundColor: colors.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  visitInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  visitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  visitInfoText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  modalMessageContainer: {
    maxHeight: 300,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  modalButton: {
    backgroundColor: colors.buttonPrimary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

