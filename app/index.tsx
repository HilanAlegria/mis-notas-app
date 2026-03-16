import {
  View,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NoteCard from '../components/NoteCard';
import FloatingButton from '../components/FloatingButton';
import ImageViewerModal from '../components/ImageViewerModal';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';

// Fix para LayoutAnimation en Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { notas, recargar, eliminarNota } = useNotes();

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);

  // ─── Carga al enfocar pantalla ───────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  // ─── Eliminar con confirmación ───────────────────────────────────────────────

  const confirmarEliminar = (id: string) => {
    Alert.alert(
      'Eliminar nota',
      'Esta accion no se puede deshacer. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            await eliminarNota(id);
          },
        },
      ]
    );
  };

  // ─── Filtrado ────────────────────────────────────────────────────────────────

  const notasFiltradas = notas.filter((nota) => {
    const criterio = search.toLowerCase();
    return (
      nota.title.toLowerCase().includes(criterio) ||
      nota.text.toLowerCase().includes(criterio)
    );
  });

  // ─── Render ──────────────────────────────────────────────────────────────────

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
        <Text style={[styles.title, { color: theme.text }]}>Happy Notes</Text>
        <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </Pressable>
      </View>

      {/* BARRA DE BUSQUEDA */}
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.primary + '40',
          },
        ]}
        placeholder="Buscar notas..."
        placeholderTextColor={theme.text + '80'}
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {/* LISTA */}
      <FlatList
        data={notasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text + '90' }]}>
              {search.length > 0
                ? 'Sin resultados para esa busqueda.'
                : 'Aun no tienes notas. Crea la primera.'}
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
            onDelete={() => confirmarEliminar(item.id)}
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

// ─── Estilos ─────────────────────────────────────────────────────────────────

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