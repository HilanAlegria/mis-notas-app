import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  onPress: () => void;
};

export default function FloatingButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>＋</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  text: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
});
