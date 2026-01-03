import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { colors } from '../styles/theme';
import { cargarNotas, guardarNotas } from '../services/storage';

export default function NoteModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
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

  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.7,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};



  const guardar = async () => {
    const notas = (await cargarNotas()) ?? [];

    const nuevas = id
      ? notas.map((n: any) =>
          n.id === id
            ? { ...n, title, text, image }
            : n
        )
      : [
          {
            id: Date.now().toString(),
            title,
            text,
            image,
            color: colors.card,
            createdAt: Date.now(),
          },
          ...notas,
        ];

    await guardarNotas(nuevas);
    router.back();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <Text style={styles.header}>
        {id ? 'Editar nota' : 'Nueva nota'}
      </Text>

      <TextInput
        placeholder="Título"
        placeholderTextColor="#999"
        style={styles.title}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Escribe tu nota..."
        placeholderTextColor="#999"
        style={styles.text}
        multiline
        value={text}
        onChangeText={setText}
      />

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={styles.imageBtnText}>📷 Agregar imagen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={guardar}>
        <Text style={styles.saveText}>Guardar nota</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  text: {
    minHeight: 120,
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  imageBtnText: {
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
