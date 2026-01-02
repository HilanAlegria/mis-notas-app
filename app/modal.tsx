import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cargarNotas, guardarNotas } from '../services/storage';
import { colors } from '../styles/theme';

export default function NotaModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [texto, setTexto] = useState('');
  const [notas, setNotas] = useState<any[]>([]);

  useEffect(() => {
    cargarNotas().then((data) => {
      if (!data) return;

      setNotas(data);

      if (id) {
        const nota = data.find((n: any) => n.id === id);
        if (nota) setTexto(nota.text);
      }
    });
  }, []);

  const guardar = async () => {
    if (!texto.trim()) return;

    let nuevas;

    if (id) {
      nuevas = notas.map((n) =>
        n.id === id ? { ...n, text: texto } : n
      );
    } else {
      nuevas = [
        {
          id: Date.now().toString(),
          text: texto,
          color: '#FEF3C7',
          createdAt: Date.now(),
        },
        ...notas,
      ];
    }

    await guardarNotas(nuevas);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {id ? 'Editar nota' : 'Nueva nota'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe aquí..."
        value={texto}
        onChangeText={setTexto}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={guardar}>
        <Text style={styles.buttonText}>
          {id ? 'Actualizar' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
