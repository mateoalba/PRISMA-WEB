"use client";

import { useEffect, useRef, useState } from "react";
import { sendSupportMessage, type ChatMessage } from "@/lib/wellbeing/chat-actions";
import { onAbrirEscucha } from "./escucha-bus";
import { EscuchaAvatar } from "./EscuchaAvatar";
import styles from "@/styles/salud-mental.module.css";

// Reconocimiento de voz nativo del navegador — sin backend adicional.
// Disponible en Chrome/Edge; en navegadores sin soporte, el botón de
// micrófono simplemente no aparece.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const FASES_RESPIRACION = ["Inhala despacio…", "Sostén el aire…", "Exhala suavemente…"];

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
function EnviarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function CerrarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function AvisoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffb3a8" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.5" />
    </svg>
  );
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [respirando, setRespirando] = useState(false);
  const [faseRespiracion, setFaseRespiracion] = useState(FASES_RESPIRACION[0]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const respTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Detección de una API solo disponible en el navegador — debe
    // aplazarse a después del montaje para no desalinear el HTML del
    // servidor (que nunca tiene window) del primer render del cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMicSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    return onAbrirEscucha(({ respirar }) => {
      abrir();
      if (respirar) iniciarRespiracion();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [messages, sending]);

  function abrir() {
    setOpen(true);
    // Actualización funcional a propósito: este mismo handler se llama
    // desde un listener registrado una sola vez en el montaje (bus de
    // "abrir escucha"), así que no puede confiar en el `messages` del
    // cierre léxico de aquel render inicial.
    setMessages((prev) =>
      prev.length === 0
        ? [
            {
              role: "assistant",
              content:
                "Hola, qué bueno que estés aquí. Este es un espacio para ti: puedes escribir o hablar con calma. ¿Cómo te sientes hoy?",
            },
          ]
        : prev
    );
  }

  function cerrar() {
    setOpen(false);
    detenerRespiracion();
  }

  function iniciarRespiracion() {
    detenerRespiracion();
    const inicio = Date.now();
    setFaseRespiracion(FASES_RESPIRACION[0]);
    respTimerRef.current = setInterval(() => {
      setFaseRespiracion(FASES_RESPIRACION[Math.floor((Date.now() - inicio) / 2700) % 3]);
    }, 300);
    setRespirando(true);
  }

  function detenerRespiracion() {
    if (respTimerRef.current) clearInterval(respTimerRef.current);
    respTimerRef.current = null;
    setRespirando(false);
  }

  function toggleListening() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function enviar(texto: string) {
    texto = texto.trim();
    if (!texto || sending) return;

    const siguiente: ChatMessage[] = [...messages, { role: "user", content: texto }];
    setMessages(siguiente);
    setInput("");
    setSending(true);

    const { reply, configured } = await sendSupportMessage(siguiente);
    setNotConfigured(!configured);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setSending(false);
  }

  if (!open) {
    return (
      <button type="button" className={styles.eaBoton} onClick={abrir} aria-expanded={false}>
        <span className={styles.eaBotonIcono}>
          <EscuchaAvatar size={40} />
        </span>
        <span className={styles.eaBotonTexto}>
          Escucha activa
          <small>Estamos aquí para ti</small>
        </span>
      </button>
    );
  }

  return (
    <aside className={styles.eaPanel} role="dialog" aria-modal="false" aria-labelledby="ea-titulo">
      <div className={styles.eaCab}>
        <span className={styles.orbeVoz} aria-hidden="true">
          <EscuchaAvatar size={52} hablando={sending} />
        </span>
        <div>
          <h2 id="ea-titulo">Escucha activa</h2>
          <span className={styles.enLinea}>Disponible ahora</span>
        </div>
        <button type="button" className={styles.eaCerrar} onClick={cerrar} aria-label="Cerrar escucha activa">
          <CerrarIcon />
        </button>
      </div>

      <div className={styles.eaAviso}>
        <AvisoIcon />
        <span>
          Este espacio no reemplaza a un profesional. Si es urgente,{" "}
          <a href="tel:+10000000000">usa el botón SOS</a>.
        </span>
      </div>

      <div className={styles.eaMensajes} ref={listaRef} aria-live="polite">
        {notConfigured && (
          <p className={styles.eaVacio}>Este chat todavía no está conectado a un servicio de IA (falta la clave de API).</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.msgYo : styles.msgElla}`}>
            {m.content}
          </div>
        ))}
        {sending && (
          <div className={styles.escribiendo} aria-label="Escribiendo">
            <i /> <i /> <i />
          </div>
        )}
        {listening && (
          <p className={styles.eaVacio} style={{ color: "#c7d873", fontWeight: 700 }}>
            Escuchando...
          </p>
        )}
      </div>

      <div className={`${styles.respirar} ${respirando ? styles.respirarActivo : ""}`}>
        <span className={styles.respirarCirculo} aria-hidden="true" />
        <span className={styles.respirarTexto}>{respirando ? faseRespiracion : "¿Quieres respirar conmigo un momento?"}</span>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`}
          aria-pressed={respirando}
          onClick={() => (respirando ? detenerRespiracion() : iniciarRespiracion())}
        >
          {respirando ? "Detener" : "Empezar"}
        </button>
      </div>

      <form
        className={styles.eaPie}
        onSubmit={(e) => {
          e.preventDefault();
          enviar(input);
        }}
      >
        {micSupported && (
          <button
            type="button"
            className={styles.eaMic}
            onClick={toggleListening}
            aria-pressed={listening}
            aria-label={listening ? "Detener grabación" : "Hablar por voz"}
          >
            <MicIcon />
          </button>
        )}
        <label htmlFor="ea-input" className={styles.srOnly}>
          Escribe cómo te sientes
        </label>
        {listening ? (
          <span className={styles.ondaVoz} aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${(i % 6) * 0.12}s` }} />
            ))}
          </span>
        ) : (
          <input
            id="ea-input"
            className={styles.eaInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe cómo te sientes…"
            autoComplete="off"
          />
        )}
        <button type="submit" className={styles.eaEnviar} disabled={sending} aria-label="Enviar">
          <EnviarIcon />
        </button>
      </form>
    </aside>
  );
}
