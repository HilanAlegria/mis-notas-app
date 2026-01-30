import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'NOTAS';

/**
 * Guarda cualquier tipo de dato de forma segura
 */
export const guardarNotas = async (notas: any[]): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(notas);
    await AsyncStorage.setItem(KEY, jsonValue);
    return true;
  } catch (e) {
    console.error("Error al guardar en el disco:", e);
    return false;
  }
};

/**
 * Carga las notas y maneja posibles errores de parseo
 */
export const cargarNotas = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      // Validamos que lo que recuperamos sea efectivamente un array
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.error("Error al leer del disco o JSON corrupto:", e);
    return []; // Devolvemos array vacío para que la app no explote
  }
};

/**
 * Función extra: Limpiar todo (útil para desarrollo o ajustes)
 */
export const borrarTodo = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error("No se pudo limpiar el almacenamiento:", e);
  }
};