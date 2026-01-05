import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themes, ThemeName } from '../styles/theme';

export default function SettingsScreen() {
  const { theme, setTheme, themeName } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        🎨 Ajustes de tema
      </Text>

      {Object.entries(themes).map(([key, value]) => {
        const selected = key === themeName;

        return (
          <Pressable
            key={key}
            style={[
              styles.option,
              {
                backgroundColor: value.card,
                borderWidth: selected ? 2 : 0,
                borderColor: value.primary,
              },
            ]}
            onPress={() => setTheme(key as ThemeName)}
          >
            <Text style={[styles.optionText, { color: value.text }]}>
              {value.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  option: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
