import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

type Props = {
  text: string;
  color: string;
  createdAt: number;
  onDelete: () => void;
  onEdit: () => void;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export default function NoteCard({
  text,
  color,
  createdAt,
  onDelete,
  onEdit,
}: Props) {
  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.85}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <Text style={styles.text}>{text}</Text>

        <Text style={styles.date}>{formatDate(createdAt)}</Text>

        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.delete}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  delete: {
    alignSelf: 'flex-end',
    fontSize: 16,
  },
});
