// app/modal.tsx
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { copiarImagenLocal } from '../services/storage';

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NoteModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { notas, agregarNota, editarNota } = useNotes();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [guardandoImagen, setGuardandoImagen] = useState(false);

  // ─── Animación de entrada ────────────────────────────────────────────────────

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  // ─── Carga de nota existente ─────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const nota = notas.find((n) => n.id === id);
    if (!nota) return;
    setTitle(nota.title);
    setText(nota.text);
    setImage(nota.image ?? null);
  }, [id, notas]);

  // ─── Selección de imagen ─────────────────────────────────────────────────────

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a las imagenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled) return;

    setGuardandoImagen(true);
    const uriPersistente = await copiarImagenLocal(result.assets[0].uri);
    setGuardandoImagen(false);

    if (!uriPersistente) {
      Alert.alert('Error', 'No se pudo guardar la imagen. Intenta de nuevo.');
      return;
    }

    setImage(uriPersistente);
  };

  // ─── Guardar nota ────────────────────────────────────────────────────────────

  const guardar = async () => {
    const tituloLimpio = title.trim();
    const textoLimpio = text.trim();

    if (!tituloLimpio && !textoLimpio && !image) {
      Alert.alert('Nota vacía', 'Agrega un titulo, texto o imagen antes de guardar.');
      return;
    }

    if (id) {
      await editarNota(id as string, {
        title: tituloLimpio,
        text: textoLimpio,
        image,
      });
    } else {
      await agregarNota({
        title: tituloLimpio,
        text: textoLimpio,
        image,
        color: theme.card,
      });
    }
    router.back();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      {/* HEADER */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top > 0 ? insets.top : 15,
            backgroundColor: theme.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
          <Text style={[styles.cancelBtn, { color: theme.text }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtnTop, { backgroundColor: theme.primary }]}
          onPress={guardar}
        >
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={[styles.headerLabel, { color: theme.text }]}>
            {id ? 'Editar nota' : 'Nueva nota'}
          </Text>

          <TextInput
            placeholder="Titulo"
            placeholderTextColor={theme.text + '60'}
            style={[styles.titleInput, { backgroundColor: theme.card, color: theme.text }]}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Escribe tu nota..."
            placeholderTextColor={theme.text + '60'}
            style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }]}
            multiline
            scrollEnabled={false}
            value={text}
            onChangeText={setText}
          />

          {image && <Image source={{ uri: image }} style={styles.image} />}

          <TouchableOpacity
            style={[
              styles.imageBtn,
              {
                backgroundColor: theme.card + '80',
                opacity: guardandoImagen ? 0.5 : 1,
              },
            ]}
            onPress={pickImage}
            disabled={guardandoImagen}
          >
            <Text style={[styles.imageBtnText, { color: theme.text }]}>
              {guardandoImagen ? 'Guardando imagen...' : 'Agregar imagen'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topBtn: {
    paddingVertical: 5,
  },
  cancelBtn: {
    fontSize: 16,
    opacity: 0.8,
  },
  saveBtnTop: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  textInput: {
    minHeight: 250,
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  imageBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});