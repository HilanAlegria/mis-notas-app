import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'NOTAS';

export const cargarNotas = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const guardarNotas = async (notas: string[]) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(notas));
};
