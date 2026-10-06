"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/perfil.module.css";
import { updateProfile, type ProfileState } from "@/lib/profile/actions";
import { signOut } from "@/lib/auth/actions";
import { useToast } from "./ToastContext";

const initialState: ProfileState = { error: null, success: false };

export function DatosForm({
  email,
  fullName,
  lastName,
  phone,
  city,
  emergencyContactName,
  emergencyContactPhone,
}: {
  email: string;
  fullName: string;
  lastName: string;
  phone: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const [correoEditable, setCorreoEditable] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (state.success) notify("Tus datos se guardaron");
    if (state.error) notify(state.error);
  }, [state, notify]);

  return (
    <div className={styles.datos}>
      <form id="form-datos" action={formAction} className={`${styles.tarjeta} ${styles.form}`}>
        <h3>Tus datos</h3>
        <div className={styles.fila2}>
          <div className={styles.campo}>
            <label htmlFor="f-nombre">Nombre</label>
            <input id="f-nombre" name="fullName" autoComplete="given-name" defaultValue={fullName} required />
          </div>
          <div className={styles.campo}>
            <label htmlFor="f-apellido">Apellido</label>
            <input id="f-apellido" name="lastName" autoComplete="family-name" defaultValue={lastName} />
          </div>
        </div>
        <div className={styles.campo}>
          <label htmlFor="f-correo">Correo electrónico</label>
          <div className={styles.campoCon}>
            <input id="f-correo" name="email" type="email" readOnly={!correoEditable} autoComplete="email" defaultValue={email} />
            <button type="button" onClick={() => setCorreoEditable(true)}>
              {correoEditable ? "Editando" : "Cambiar correo"}
            </button>
          </div>
          <small>Por seguridad, te enviaremos un enlace de confirmación al correo nuevo.</small>
        </div>
        <div className={styles.fila2}>
          <div className={styles.campo}>
            <label htmlFor="f-cel">Celular</label>
            <input id="f-cel" name="phone" type="tel" autoComplete="tel" defaultValue={phone} />
          </div>
          <div className={styles.campo}>
            <label htmlFor="f-ciudad">Ciudad</label>
            <input id="f-ciudad" name="city" autoComplete="address-level2" defaultValue={city} />
          </div>
        </div>
        <div className={styles.guardado}>
          <button type="submit" className={`${styles.btn} ${styles.btnP}`} disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
          <span className={`${styles.estadoGuardar} ${state.success ? styles.estadoGuardarOn : ""}`} role="status">
            {state.success ? "✓ Cambios guardados" : ""}
          </span>
        </div>
      </form>

      <div className={styles.lado}>
        <div className={`${styles.tarjeta} ${styles.emergencia}`}>
          <div className={styles.eyebrow}>Botón SOS</div>
          <h3>Contacto de emergencia</h3>
          <p>A esta persona avisaremos si presionas el botón SOS.</p>
          <div className={styles.campo}>
            <label htmlFor="f-emerg">Nombre</label>
            <input id="f-emerg" name="emergencyContactName" form="form-datos" defaultValue={emergencyContactName} />
          </div>
          <div className={styles.campo}>
            <label htmlFor="f-emerg-tel">Teléfono</label>
            <input id="f-emerg-tel" name="emergencyContactPhone" type="tel" form="form-datos" defaultValue={emergencyContactPhone} />
          </div>
        </div>
        <div className={styles.tarjeta} style={{ padding: "24px 26px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: 8 }}>Seguridad</h3>
          <Link className={styles.linkFila} href="/perfil/contrasena">
            Cambiar contraseña <span>→</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className={styles.linkFila} style={{ width: "100%", border: 0, background: "none", cursor: "pointer", font: "inherit" }}>
              Cerrar sesión <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
