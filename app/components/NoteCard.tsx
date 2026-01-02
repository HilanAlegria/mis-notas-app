import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

type Props = {
  text: string;
  color: string;
  onDelete: () => void;
  onEdit: () => void;
};

export default function NoteCard({ text, color, onDelete, onEdit }: Props) {
  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.8}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <Text style={styles.text}>{text}</Text>

        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.delete}>❌</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  delete: {
    alignSelf: 'flex-end',
    fontSize: 16,
  },
});
