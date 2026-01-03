import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../styles/theme';

type Props = {
  title: string;
  text: string;
  image?: string | null;
  color: string;
  createdAt: number;
  onDelete: () => void;
  onEdit: () => void;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export default function NoteCard({
  title,
  text,
  image,
  color,
  createdAt,
  onDelete,
  onEdit,
}: Props) {
  const confirmarBorrado = () => {
    Alert.alert(
      'Eliminar nota',
      '¿Seguro de que quieres borrar esta nota?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onEdit}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || 'Sin título'}</Text>
          <TouchableOpacity onPress={confirmarBorrado}>
            <Text style={styles.delete}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        )}

        <Text style={styles.text}>{text}</Text>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
  },
  delete: {
    fontSize: 16,
  },
});
