// context/NotesContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cargarNotas, guardarNotas, eliminarImagenLocal, migrarClaveAntigua } from '../services/storage';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Nota = {
  id: string;
  title: string;
  text: string;
  color: string;
  createdAt: number;
  image?: string | null;
};

type NotesContextType = {
  notas: Nota[];
  cargando: boolean;
  recargar: () => Promise<void>;
  agregarNota: (datos: Omit<Nota, 'id' | 'createdAt'>) => Promise<void>;
  editarNota: (id: string, datos: Partial<Omit<Nota, 'id' | 'createdAt'>>) => Promise<void>;
  eliminarNota: (id: string) => Promise<void>;
};

// ─── Contexto ─────────────────────────────────────────────────────────────────

const NotesContext = createContext<NotesContextType>({} as NotesContextType);

// ─── Helper ───────────────────────────────────────────────────────────────────

const normalizarNota = (n: any, colorPorDefecto: string): Nota => ({
  id: n.id,
  title: n.title ?? '',
  text: n.text ?? '',
  color: n.color ?? colorPorDefecto,
  createdAt: n.createdAt ?? Date.now(),
  image: n.image ?? null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  const recargar = useCallback(async () => {
    try {
      const data = await cargarNotas();
      const normalizadas = data
        .map((n: any) => normalizarNota(n, '#FFE4EC'))
        .sort((a: Nota, b: Nota) => b.createdAt - a.createdAt);
      setNotas(normalizadas);
    } catch (e) {
      console.error('Error al cargar notas:', e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await migrarClaveAntigua();
      await recargar();
    };
    inicializar();
  }, [recargar]);

  // ─── Agregar ───────────────────────────────────────────────────────────────

  const agregarNota = async (datos: Omit<Nota, 'id' | 'createdAt'>) => {
    const nueva: Nota = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      ...datos,
    };
    const nuevas = [nueva, ...notas];
    setNotas(nuevas);
    await guardarNotas(nuevas);
  };

  // ─── Editar ────────────────────────────────────────────────────────────────

  const editarNota = async (
    id: string,
    datos: Partial<Omit<Nota, 'id' | 'createdAt'>>
  ) => {
    const notaActual = notas.find((n) => n.id === id);
    if (
      notaActual?.image &&
      datos.image !== undefined &&
      datos.image !== notaActual.image
    ) {
      await eliminarImagenLocal(notaActual.image);
    }

    const nuevas = notas.map((n) => (n.id === id ? { ...n, ...datos } : n));
    setNotas(nuevas);
    await guardarNotas(nuevas);
  };

  // ─── Eliminar ──────────────────────────────────────────────────────────────

  const eliminarNota = async (id: string) => {
    const nota = notas.find((n) => n.id === id);
    if (nota?.image) {
      await eliminarImagenLocal(nota.image);
    }

    const nuevas = notas.filter((n) => n.id !== id);
    setNotas(nuevas);
    await guardarNotas(nuevas);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <NotesContext.Provider
      value={{ notas, cargando, recargar, agregarNota, editarNota, eliminarNota }}
    >
      {children}
    </NotesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useNotes = () => useContext(NotesContext);