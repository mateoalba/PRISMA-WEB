"use client";

import { useEffect, useRef, useState } from "react";

// Mientras Penser entrega las fotos reales, se muestra un espacio
// reservado limpio con la descripción de la imagen — mismo patrón que
// DimensionImage.tsx. Coloca el archivo real en la ruta de `src` para
// que se muestre automáticamente.
export function PlaceholderImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Respaldo: si la imagen ya falló antes de que React conectara
  // onError (una carrera conocida con <img> renderizado en el servidor),
  // lo detectamos aquí al montar.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-line bg-gradient-to-br from-brand-dark/40 to-graphite p-6 ${className}`}
      >
        <p className="text-center text-sm text-foreground/40">[Imagen: {alt}]</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className={`object-cover ${className}`}
    />
  );
}
