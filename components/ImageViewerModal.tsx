import { Modal, View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function ImageViewerModal({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}) {
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>

        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '80%',
  },
  close: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
});
