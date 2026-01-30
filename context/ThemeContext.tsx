import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeName } from '../styles/theme';

type ThemeContextType = {
  theme: typeof themes.pink;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProviderCustom({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('pink');
  const [isLoaded, setIsLoaded] = useState(false); // Nuevo: Evita el flash de color

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved && saved in themes) {
          setThemeName(saved as ThemeName);
        }
      } catch (e) {
        console.error("Error cargando el tema", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    await AsyncStorage.setItem('theme', name);
  };

  // Si no ha cargado el tema guardado, no renderizamos para evitar parpadeos
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeName],
        themeName,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);