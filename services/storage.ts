// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';

const KEY = '@happynotes_data';
const KEY_LEGACY = 'NOTAS';

// ─── Notas ────────────────────────────────────────────────────────────────────

export const guardarNotas = async (notas: any[]): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(notas);
    await AsyncStorage.setItem(KEY, jsonValue);
    return true;
  } catch (e) {
    console.error('Error al guardar en el disco:', e);
    return false;
  }
};

export const cargarNotas = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.error('Error al leer del disco o JSON corrupto:', e);
    return [];
  }
};

export const borrarTodo = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error('No se pudo limpiar el almacenamiento:', e);
  }
};

// ─── Migración ────────────────────────────────────────────────────────────────

/**
 * Busca datos en la clave legacy 'NOTAS' y los mueve a '@happynotes_data'.
 * Corre una sola vez — después elimina la clave vieja.
 */
export const migrarClaveAntigua = async (): Promise<void> => {
  try {
    const dataLegacy = await AsyncStorage.getItem(KEY_LEGACY);
    if (dataLegacy === null) return;

    const dataNueva = await AsyncStorage.getItem(KEY);

    if (dataNueva === null) {
      await AsyncStorage.setItem(KEY, dataLegacy);
      console.log('Migracion completada: datos movidos a nueva clave.');
    }

    await AsyncStorage.removeItem(KEY_LEGACY);
  } catch (e) {
    console.error('Error en migracion de clave:', e);
  }
};

// ─── Imágenes ─────────────────────────────────────────────────────────────────

export const copiarImagenLocal = async (uri: string): Promise<string | null> => {
  try {
    const nombreArchivo = `nota_img_${Date.now()}.jpg`;
    const destino = Paths.join(Paths.document, nombreArchivo);
    const archivoOrigen = new File(uri);
    const archivoDestino = new File(destino);
    archivoOrigen.copy(archivoDestino);
    return archivoDestino.uri;
  } catch (e) {
    console.error('Error al copiar la imagen:', e);
    return null;
  }
};

export const eliminarImagenLocal = async (uri: string): Promise<void> => {
  try {
    if (!uri || !uri.includes(Paths.document)) return;
    const archivo = new File(uri);
    if (archivo.exists) {
      archivo.delete();
    }
  } catch (e) {
    console.error('Error al eliminar imagen:', e);
  }
};