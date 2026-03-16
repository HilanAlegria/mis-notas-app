import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getContrastingColor = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) return '#1A1A1A';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1A1A1A' : '#FFFFFF';
};

// ─── Componente ───────────────────────────────────────────────────────────────

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

  const textColor = getContrastingColor(color);
  const dateColor =
    textColor === '#1A1A1A' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';

  // ─── Acciones de swipe ──────────────────────────────────────────────────────

  const renderLeftActions = () => (
    <View style={[styles.actionLeft, { backgroundColor: theme.primary }]}>
      <Ionicons name="pencil-outline" size={24} color="#fff" />
    </View>
  );

  const renderRightActions = () => (
    <Pressable style={styles.actionRight} onPress={onDelete}>
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </Pressable>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableLeftOpen={onEdit}
    >
      <Pressable style={[styles.card, { backgroundColor: color }]} onPress={onEdit}>
        {title ? (
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
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

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
  actionLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionRight: {
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
});