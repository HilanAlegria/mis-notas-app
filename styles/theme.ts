export const themes = {
  pink: {
    name: 'Rosado',
    background: '#FFF1F6',
    card: '#FFE4EC',
    text: '#2B2B2B',
    primary: '#FF8FB1',
  },
  blue: {
    name: 'Azul',
    background: '#F1F7FF',
    card: '#E4EEFF',
    text: '#1F2937',
    primary: '#7AA2FF',
  },
  yellow: {
    name: 'Amarillo',
    background: '#FFFBEA',
    card: '#FFF2C2',
    text: '#3A2E00',
    primary: '#F4C430',
  },
  dark: {
    name: 'Oscuro',
    background: '#0F0F0F',
    card: '#1C1C1C',
    text: '#E0E0E0', // Gris muy claro para que no canse la vista
    primary: '#A0A0A0', // Gris medio para iconos y botones secundarios
  },
};

export type ThemeName = keyof typeof themes;