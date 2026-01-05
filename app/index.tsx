import {
  View,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NoteCard from '../components/NoteCard';
import FloatingButton from '../components/FloatingButton';
import ImageViewerModal from '../components/ImageViewerModal';

import { cargarNotas, guardarNotas } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [notas, setNotas] = useState<Nota[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);

  const cargar = async () => {
    const data = await cargarNotas();

    if (!data) {
      setNotas([]);
      return;
    }

    const normalizadas: Nota[] = data.map((n: any) => ({
      id: n.id,
      title: n.title ?? '',
      text: n.text ?? '',
      color: n.color ?? theme.card,
      createdAt: n.createdAt ?? Date.now(),
      image: n.image ?? null,
    }));

    normalizadas.sort((a, b) => b.createdAt - a.createdAt);
    setNotas(normalizadas);
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const eliminar = async (id: string) => {
    const nuevas = notas.filter((n) => n.id !== id);
    setNotas(nuevas);
    await guardarNotas(nuevas);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 10,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          📝 Mis Notas
        </Text>

        <Pressable onPress={() => router.push('/settings')}>
          <Text style={[styles.settings, { color: theme.primary }]}>
            ⚙️
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item }) => (
          <NoteCard
            title={item.title}
            text={item.text}
            image={item.image}
            color={item.color}
            createdAt={item.createdAt}
            onEdit={() => router.push(`/modal?id=${item.id}`)}
            onDelete={() => eliminar(item.id)}
            onImagePress={() => {
              if (!item.image) return;
              setPreviewImage(item.image);
              setImageOpen(true);
            }}
          />
        )}
      />

      <FloatingButton onPress={() => router.push('/modal')} />

      <ImageViewerModal
        visible={imageOpen}
        uri={previewImage}
        onClose={() => {
          setImageOpen(false);
          setPreviewImage(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settings: {
    fontSize: 26,
  },
});
