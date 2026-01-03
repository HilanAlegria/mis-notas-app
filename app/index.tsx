import {
  View,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import NoteCard from '../components/NoteCard';
import FloatingButton from '../components/FloatingButton';
import { colors } from '../styles/theme';
import { cargarNotas, guardarNotas } from '../services/storage';

type Nota = {
  id: string;
  title: string;
  text: string;
  color: string;
  createdAt: number;
  image?: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [notas, setNotas] = useState<Nota[]>([]);

  useEffect(() => {
    cargarNotas().then((data) => {
      if (!data) return;

      const normalizadas: Nota[] = data.map((n: any) => ({
        id: n.id,
        title: n.title ?? '',
        text: n.text ?? '',
        color: n.color,
        createdAt: n.createdAt ?? Date.now(),
        image: n.image ?? null,
      }));

      normalizadas.sort((a, b) => b.createdAt - a.createdAt);
      setNotas(normalizadas);
    });
  }, []);

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
            title={item.title}
            text={item.text}
            image={item.image}
            color={item.color}
            createdAt={item.createdAt}
            onEdit={() => router.push(`/modal?id=${item.id}`)}
            onDelete={() => eliminar(item.id)}
          />
        )}
      />

      <FloatingButton onPress={() => router.push('/modal')} />
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
});
