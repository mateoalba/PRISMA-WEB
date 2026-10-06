"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react";
import styles from "@/styles/tienda.module.css";
import { changeCartQuantity, removeFromCart, type CartLine } from "@/lib/tienda/cart-actions";
import type { Product } from "@/lib/tienda/products-actions";

type CartContextValue = {
  lines: CartLine[];
  quantityOf: (productId: string) => number;
  changeQuantity: (product: Product, delta: number, sourceEl?: HTMLElement | null) => void;
  remove: (productId: string) => void;
  totalCount: number;
  subtotal: number;
  savings: number;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  cartButtonRef: React.RefObject<HTMLButtonElement | null>;
  bumpKey: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

export function CartProvider({ initialLines, children }: { initialLines: CartLine[]; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [, startTransition] = useTransition();
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reducirRef = useRef(false);

  useEffect(() => {
    reducirRef.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const quantityOf = useCallback((id: string) => lines.find((l) => l.product.id === id)?.quantity ?? 0, [lines]);

  function flyToCart(sourceEl: HTMLElement) {
    if (reducirRef.current || !cartButtonRef.current) return;
    const a = sourceEl.getBoundingClientRect();
    const b = cartButtonRef.current.getBoundingClientRect();
    const v = document.createElement("div");
    v.className = styles.vuela;
    v.textContent = "+1";
    v.style.position = "fixed";
    v.style.zIndex = "200";
    v.style.width = "50px";
    v.style.height = "50px";
    v.style.borderRadius = "50%";
    v.style.background = "var(--olive-light)";
    v.style.color = "#181712";
    v.style.fontWeight = "800";
    v.style.display = "grid";
    v.style.placeItems = "center";
    v.style.pointerEvents = "none";
    v.style.transition = "transform .8s cubic-bezier(.5,-.3,.7,1), opacity .8s ease";
    v.style.left = `${a.left + a.width / 2 - 25}px`;
    v.style.top = `${a.top + a.height / 2 - 25}px`;
    document.body.appendChild(v);
    requestAnimationFrame(() => {
      v.style.transform = `translate(${b.left - a.left - a.width / 2 + 36}px, ${b.top - a.top - a.height / 2 + 12}px) scale(.35)`;
      v.style.opacity = "0.3";
    });
    setTimeout(() => v.remove(), 850);
  }

  function notify(message: string) {
    setToast(message);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 2600);
  }

  function bumpBadge() {
    setBumpKey((k) => k + 1);
  }

  function changeQuantity(product: Product, delta: number, sourceEl?: HTMLElement | null) {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id);
      if (idx === -1) {
        if (delta <= 0) return prev;
        return [...prev, { product, quantity: delta }];
      }
      const nextQty = Math.max(0, prev[idx].quantity + delta);
      if (nextQty === 0) return prev.filter((_, i) => i !== idx);
      const copy = [...prev];
      copy[idx] = { ...copy[idx], quantity: nextQty };
      return copy;
    });
    startTransition(() => {
      changeCartQuantity(product.id, delta);
    });
    bumpBadge();
    if (delta > 0) {
      if (sourceEl) flyToCart(sourceEl);
      notify(`Agregaste: ${product.title}`);
    }
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
    startTransition(() => {
      removeFromCart(productId);
    });
  }

  const totalCount = lines.reduce((a, l) => a + l.quantity, 0);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.quantity, 0);
  const savings = lines.reduce((a, l) => a + (l.product.priceBefore ? (l.product.priceBefore - l.product.price) * l.quantity : 0), 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        quantityOf,
        changeQuantity,
        remove,
        totalCount,
        subtotal,
        savings,
        panelOpen,
        openPanel: () => setPanelOpen(true),
        closePanel: () => setPanelOpen(false),
        cartButtonRef,
        bumpKey,
      }}
    >
      {children}
      <div className={`${styles.avisoOk} ${toastOn ? styles.avisoOkOn : ""}`} role="status">
        {toast}
      </div>
    </CartContext.Provider>
  );
}
