import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { useEffect, useState } from 'react';
import NoteCard from './components/NoteCard';
import { colors } from '../styles/theme';
import { cargarNotas, guardarNotas } from '../services/storage';

type Nota = {
  text: string;
  color: string;
  createdAt: number;
};


const noteColors = ['#FEF3C7', '#DCFCE7', '#E0E7FF', '#FCE7F3', '#ECFEFF'];

export default function HomeScreen() {
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState<Nota[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
  cargarNotas().then((data) => {
    data.sort((a, b) => b.createdAt - a.createdAt);
    setNotas(data);
  });
}, []);

  const guardar = async () => {
    if (!nota.trim()) return;

    let nuevasNotas = [...notas];

    if (editIndex !== null) {
      nuevasNotas[editIndex].text = nota;
      setEditIndex(null);
    } else {
      nuevasNotas.push({
      text: nota,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      createdAt: Date.now(),
    });
    nuevasNotas.sort((a, b) => b.createdAt - a.createdAt);
    }

    setNotas(nuevasNotas);
    setNota('');
    await guardarNotas(nuevasNotas);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const eliminar = async (index: number) => {
    const nuevas = notas.filter((_, i) => i !== index);
    setNotas(nuevas);
    await guardarNotas(nuevas);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const editar = (index: number) => {
    setNota(notas[index].text);
    setEditIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Mis Notas</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe una nota..."
        value={nota}
        onChangeText={setNota}
      />

      <TouchableOpacity style={styles.button} onPress={guardar}>
        <Text style={styles.buttonText}>
          {editIndex !== null ? 'Actualizar nota' : 'Guardar nota'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={notas}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <NoteCard
            text={item.text}
            color={item.color}
            onDelete={() => eliminar(index)}
            onEdit={() => editar(index)}
          />
        )}
      />
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
  input: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
