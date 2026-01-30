import {
  View,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  RefreshControl,
  Pressable,
  TextInput,
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

const normalizarNota = (n: any, defaultColor: string): Nota => ({
  id: n.id,
  title: n.title ?? '',
  text: n.text ?? '',
  color: n.color ?? defaultColor,
  createdAt: n.createdAt ?? Date.now(),
  image: n.image ?? null,
});

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [notas, setNotas] = useState<Nota[]>([]);
  const [search, setSearch] = useState(''); // Estado para la búsqueda
  const [refreshing, setRefreshing] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);

  const cargar = async () => {
    try {
      const data = await cargarNotas();
      if (!data) {
        setNotas([]);
        return;
      }
      const normalizadas = data
        .map((n: any) => normalizarNota(n, theme.card))
        .sort((a: Nota, b: Nota) => b.createdAt - a.createdAt);
      setNotas(normalizadas);
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [theme.card])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  const eliminar = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nuevas = notas.filter((n) => n.id !== id);
    setNotas(nuevas);
    await guardarNotas(nuevas);
  };

  // --- Lógica de filtrado ---
  const notasFiltradas = notas.filter((nota) => {
    const criterio = search.toLowerCase();
    return (
      nota.title.toLowerCase().includes(criterio) ||
      nota.text.toLowerCase().includes(criterio)
    );
  });

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
           Mis Happy Notas
        </Text>
        <Pressable onPress={() => router.push('/settings')}>
          <Text style={[styles.settings, { color: theme.primary }]}>
            ⚙️
          </Text>
        </Pressable>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <TextInput
        style={[
          styles.searchBar,
          { 
            backgroundColor: theme.card, 
            color: theme.text,
            borderColor: theme.primary + '40' // Color primario con 40% de opacidad
          }
        ]}
        placeholder="Buscar notas..."
        placeholderTextColor={theme.text + '80'}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={notasFiltradas} // Usamos las notas filtradas
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        
        initialNumToRender={10}  
        windowSize={5}            
        maxToRenderPerBatch={5}     
        removeClippedSubviews={true} 

        // ESTADO VACÍO
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text + '90' }]}>
              {search.length > 0 
                ? "No se encontraron resultados 🔍" 
                : "Aún no tienes notas. ¡Crea la primera! ✨"}
            </Text>
          </View>
        }

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settings: {
    fontSize: 26,
  },
  searchBar: {
    height: 45,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});