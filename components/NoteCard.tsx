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
};

export default function NoteCard({
  title,
  text,
  image,
  color,
  createdAt,
  onEdit,
  onDelete,
}: Props) {
  const { theme } = useTheme();

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
          <Text style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
        ) : null}

        {text ? (
          <Text style={[styles.text, { color: theme.text }]}>
            {text}
          </Text>
        ) : null}

        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : null}

        <Text style={styles.date}>
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'right',
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
