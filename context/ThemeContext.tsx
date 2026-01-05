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

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved && saved in themes) {
        setThemeName(saved as ThemeName);
      }
    });
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    await AsyncStorage.setItem('theme', name);
  };

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
