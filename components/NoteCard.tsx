import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';

type Props = {
  title: string;
  text: string;
  image?: string | null;
  color: string;
  createdAt: number;
  onEdit: () => void;
  onDelete: () => void;
  onImagePress?: () => void; 
};

export default function NoteCard({
  title,
  text,
  image,
  color,
  createdAt,
  onEdit,
  onDelete,
  onImagePress,
}: Props) {
  const { theme } = useTheme();

  // --- FUNCIÓN DE CONTRASTE AUTOMÁTICA ---
  // Esta función calcula si un color es claro u oscuro
  const getContrastingColor = (hexColor: string) => {
    // Si no hay color, usamos el del tema
    if (!hexColor) return theme.text;
    
    // Eliminamos el # si existe
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Fórmula de luminancia (estándar de accesibilidad)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Si el valor es > 128, el color es claro -> usamos texto negro
    // Si es < 128, el color es oscuro -> usamos texto blanco
    return yiq >= 128 ? '#1A1A1A' : '#FFFFFF';
  };

  const textColor = getContrastingColor(color);
  // Para la fecha, usamos el mismo color pero con un poco de transparencia
  const dateColor = textColor === '#1A1A1A' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';

  const renderLeftActions = () => (
    <View style={[styles.edit, { backgroundColor: theme.primary }]}>
      <Text style={styles.actionText}>✏️</Text>
    </View>
  );

  const renderRightActions = () => (
    <Pressable
      style={styles.delete}
      onPress={() =>
        Alert.alert(
          'Eliminar nota',
          '¿Seguro que quieres borrar esta nota?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Sí', style: 'destructive', onPress: onDelete },
          ]
        )
      }
    >
      <Text style={styles.actionText}>🗑️</Text>
    </Pressable>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableLeftOpen={onEdit}
    >
      <Pressable
        style={[styles.card, { backgroundColor: color }]}
        onPress={onEdit}
      >
        {title ? (
          <Text 
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}

        {text ? (
          <Text 
            style={[styles.text, { color: textColor }]}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {text}
          </Text>
        ) : null}

        {image ? (
          <Pressable onPress={onImagePress}>
            <Image source={{ uri: image }} style={styles.image} />
          </Pressable>
        ) : null}

        <View style={styles.footer}>
          <Text style={[styles.date, { color: dateColor }]}>
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  footer: {
    marginTop: 5,
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
  },
  delete: {
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  edit: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 22,
  },
});