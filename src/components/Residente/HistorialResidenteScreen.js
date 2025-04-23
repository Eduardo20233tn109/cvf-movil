import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';

const estados = ["Todos", "Pendiente", "Aprobada", "Finalizada", "Cancelada"];

export default function HistorialResidenteScreen() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    if (user && user._id) {
      fetchVisitas(selectedFilter);
    }
  }, [selectedFilter, user]);

  const fetchVisitas = async (estado) => {
    try {
      const base = `http://192.168.0.166:4000/api/visits`;
      const url = estado === "Todos"
        ? `${base}?_=${Date.now()}`
        : `${base}?estado=${estado}&_=${Date.now()}`;

      const res = await fetch(url);
      const data = await res.json();

      const filtradas = data.filter(v => {
        const id = typeof v.residenteId === "object"
          ? v.residenteId._id
          : v.residenteId;
        return id?.toString() === user._id?.toString();
      });

      setVisitas(filtradas);
    } catch (e) {
      console.error("❌ Error al traer visitas:", e);
    }
  };

  const VisitItem = ({ item }) => {
    const handleCancelar = async () => {
      try {
        const res = await fetch(`http://192.168.0.166:4000/api/visits/status/${item._id}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Cancelada" }),
        });

        if (res.ok) {
          fetchVisitas(selectedFilter);
        } else {
          alert("Error al cancelar la visita.");
        }
      } catch (err) {
        console.error("❌ Error al cancelar visita:", err);
        alert("Error al cancelar la visita.");
      }
    };

    const estadoColor = {
      Aprobada: "green",
      Pendiente: "orange",
      Finalizada: "blue",
      Cancelada: "red"
    };

    return (
      <View style={styles.visitItem}>
        <Text style={styles.name}>{item.nombreVisitante}</Text>
        <Text style={styles.detail}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
        <Text style={styles.detail}>Motivo: {item.descripcion}</Text>
        <Text style={[styles.detail, { color: estadoColor[item.estado] || "#555" }]}>
          Estado: {item.estado}
        </Text>

        {item.estado?.trim().toLowerCase() === "pendiente" && (
          <TouchableOpacity
            onPress={handleCancelar}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancelar visita</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Visitas</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.filterRow}>
        {estados.map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[styles.filterButton, selectedFilter === estado && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(estado)}
          >
            <Text style={[styles.filterText, selectedFilter === estado && styles.filterTextActive]}>
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.separator} />

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
  container: { flex: 1, backgroundColor: '#C4BDA6', padding: 16 },
  headerContainer: {
    width: '100%', paddingTop: 50, paddingBottom: 10, backgroundColor: '#7C4A2D',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, elevation: 4, zIndex: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  filterButton: {
    flex: 1, marginHorizontal: 5, paddingVertical: 10,
    backgroundColor: '#ffffff', borderRadius: 15, borderWidth: 1,
    borderColor: '#4D5637', alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#4D5637' },
  filterText: { color: '#4D5637', fontWeight: 'bold' },
  filterTextActive: { color: '#ffffff' },
  separator: { height: 4, backgroundColor: '#6E3B24', marginBottom: 12, borderRadius: 2 },
  visitItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 15,
    marginBottom: 10, elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detail: { fontSize: 14, color: '#555' },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#b71c1c",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: 'center', marginTop: 20, color: '#4D5637', fontStyle: 'italic',
  },
});
