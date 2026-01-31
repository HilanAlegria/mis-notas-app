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
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importante para el Notch

import { cargarNotas, guardarNotas } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

export default function NoteModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // Hook para obtener el espacio seguro

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!id) return;
    cargarNotas().then((data) => {
      const nota = data?.find((n: any) => n.id === id);
      if (!nota) return;
      setTitle(nota.title);
      setText(nota.text);
      setImage(nota.image ?? null);
    });
  }, [id]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Se necesita permiso para acceder a las imágenes');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const guardar = async () => {
    const notas = (await cargarNotas()) ?? [];
    const nuevas = id
      ? notas.map((n: any) => (n.id === id ? { ...n, title, text, image } : n))
      : [{ id: Date.now().toString(), title, text, image, color: theme.card, createdAt: Date.now() }, ...notas];

    await guardarNotas(nuevas);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      {/* HEADER AJUSTADO AL ÁREA SEGURA */}
      <View style={[
        styles.topBar, 
        { 
          paddingTop: insets.top > 0 ? insets.top : 15, // Ajuste dinámico para el notch
          backgroundColor: theme.background 
        }
      ]}>
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

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={[styles.headerLabel, { color: theme.text }]}>
            {id ? 'Editar nota' : 'Nueva nota'}
          </Text>

          <TextInput
            placeholder="Título"
            placeholderTextColor="#999"
            style={[styles.title, { backgroundColor: theme.card, color: theme.text }]}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Escribe tu nota..."
            placeholderTextColor="#999"
            style={[styles.text, { backgroundColor: theme.card, color: theme.text }]}
            multiline
            scrollEnabled={false}
            value={text}
            onChangeText={setText}
          />

          {image && <Image source={{ uri: image }} style={styles.image} />}

          <TouchableOpacity 
            style={[styles.imageBtn, { backgroundColor: theme.card + '80' }]} 
            onPress={pickImage}
          >
            <Text style={[styles.imageBtnText, { color: theme.text }]}>📷 Agregar imagen</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  title: {
    fontSize: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  text: {
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