"use client";

import { createContext, useContext, useState } from "react";

type Orden = "rec" | "menor" | "mayor" | "oferta";

type FiltroContextValue = {
  categoria: string;
  setCategoria: (c: string) => void;
  texto: string;
  setTexto: (t: string) => void;
  orden: Orden;
  setOrden: (o: Orden) => void;
  modalProductId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
};

const FiltroContext = createContext<FiltroContextValue | null>(null);

export function useFiltro() {
  const ctx = useContext(FiltroContext);
  if (!ctx) throw new Error("useFiltro debe usarse dentro de FiltroProvider");
  return ctx;
}

export function FiltroProvider({ children }: { children: React.ReactNode }) {
  const [categoria, setCategoria] = useState("todo");
  const [texto, setTexto] = useState("");
  const [orden, setOrden] = useState<Orden>("rec");
  const [modalProductId, setModalProductId] = useState<string | null>(null);

  return (
    <FiltroContext.Provider
      value={{
        categoria,
        setCategoria,
        texto,
        setTexto,
        orden,
        setOrden,
        modalProductId,
        openModal: (id) => setModalProductId(id),
        closeModal: () => setModalProductId(null),
      }}
    >
      {children}
    </FiltroContext.Provider>
  );
}
