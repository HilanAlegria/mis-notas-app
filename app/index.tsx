import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import NoteCard from '../components/NoteCard';
import FloatingButton from '../components/FloatingButton';
import { colors } from '../styles/theme';
import { cargarNotas, guardarNotas } from '../services/storage';

type Nota = {
  id: string;
  text: string;
  color: string;
  createdAt: number;
};

const noteColors = ['#FEF3C7', '#DCFCE7', '#E0E7FF', '#FCE7F3', '#ECFEFF'];

export default function HomeScreen() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nota, setNota] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarNotas().then((data) => {
      if (!data) return;

      const normalizadas: Nota[] = data.map((n: any) => ({
        id: n.id ?? Date.now().toString() + Math.random(),
        text: n.text,
        color: n.color,
        createdAt: n.createdAt ?? Date.now(),
      }));

      normalizadas.sort((a, b) => b.createdAt - a.createdAt);
      setNotas(normalizadas);
    });
  }, []);

  const abrirNuevaNota = () => {
    setNota('');
    setEditId(null);
    setModalVisible(true);
  };

  const abrirEdicion = (n: Nota) => {
    setNota(n.text);
    setEditId(n.id);
    setModalVisible(true);
  };

  const guardar = async () => {
    if (!nota.trim()) return;

    let nuevasNotas: Nota[];

    if (editId) {
      nuevasNotas = notas.map((n) =>
        n.id === editId ? { ...n, text: nota } : n
      );
    } else {
      nuevasNotas = [
        {
          id: Date.now().toString(),
          text: nota,
          color: noteColors[Math.floor(Math.random() * noteColors.length)],
          createdAt: Date.now(),
        },
        ...notas,
      ];
    }

    nuevasNotas.sort((a, b) => b.createdAt - a.createdAt);

    setNotas(nuevasNotas);
    await guardarNotas(nuevasNotas);

    setNota('');
    setEditId(null);
    setModalVisible(false);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const eliminar = async (id: string) => {
    const nuevas = notas.filter((n) => n.id !== id);
    setNotas(nuevas);
    await guardarNotas(nuevas);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Mis Notas</Text>

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            text={item.text}
            color={item.color}
            createdAt={item.createdAt}
            onDelete={() => eliminar(item.id)}
            onEdit={() => abrirEdicion(item)}
          />
        )}
      />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editId ? 'Editar nota' : 'Nueva nota'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Escribe tu nota..."
              value={nota}
              onChangeText={setNota}
              multiline
            />

            <TouchableOpacity style={styles.button} onPress={guardar}>
              <Text style={styles.buttonText}>
                {editId ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTÓN FLOTANTE */}
      <FloatingButton onPress={abrirNuevaNota} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  input: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
  },
});
