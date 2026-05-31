"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useParams } from "next/navigation";

type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "requesting_location" }
  | { status: "success"; tipo: "P" | "A"; nombre: string; hora: string }
  | { status: "error"; message: string };

export default function AsistenciaPage() {
  const { token } = useParams<{ token: string }>();
  const { data: session, status: authStatus } = useSession();
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  async function registerAttendance(lat: number, lng: number) {
    setResult({ status: "loading" });

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesionId: token, lat, lng }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({ status: "success", tipo: data.tipo, nombre: data.nombre, hora: data.hora });
    } else {
      setResult({ status: "error", message: data.error });
    }
  }

  function requestLocation() {
    setResult({ status: "requesting_location" });

    if (!navigator.geolocation) {
      setResult({ status: "error", message: "Tu navegador no soporta geolocalizacion" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        registerAttendance(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setResult({ status: "error", message: "Necesitas compartir tu ubicacion para registrar asistencia" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-pulse text-[var(--accent)] text-lg">Cargando...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center space-y-6 p-8">
          <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Registro de Asistencia</h1>
          <p className="text-[var(--text-secondary)]">Etica — UEES</p>
          <button
            onClick={() => signIn("google")}
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[var(--accent-hover)] transition-all"
          >
            Iniciar sesion con Google
          </button>
          <p className="text-sm text-[var(--text-muted)]">Usa tu correo @uees.edu.ec</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center space-y-6 p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Registro de Asistencia</h1>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2">
          <p className="text-sm text-[var(--text-secondary)]">{session.user?.email}</p>
        </div>

        {result.status === "idle" && (
          <button
            onClick={requestLocation}
            className="w-full bg-[var(--accent)] text-[var(--bg-primary)] py-4 rounded-xl text-xl font-bold hover:bg-[var(--accent-hover)] transition-all"
          >
            Registrar asistencia
          </button>
        )}

        {result.status === "requesting_location" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
            <div className="animate-pulse text-[var(--accent)] text-lg">Obteniendo ubicacion...</div>
            <p className="text-sm text-[var(--text-muted)]">Acepta el permiso de ubicacion en tu navegador</p>
          </div>
        )}

        {result.status === "loading" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5 text-[var(--accent)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[var(--accent)] text-lg">Registrando...</span>
            </div>
          </div>
        )}

        {result.status === "success" && (
          <div className={`rounded-2xl p-6 border-2 ${
            result.tipo === "P"
              ? "bg-[var(--present)]/10 border-[var(--present)]/30"
              : "bg-[var(--late)]/10 border-[var(--late)]/30"
          }`}>
            <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
              result.tipo === "P" ? "bg-[var(--present)]/20" : "bg-[var(--late)]/20"
            }`}>
              <svg className={`w-7 h-7 ${result.tipo === "P" ? "text-[var(--present)]" : "text-[var(--late)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={`text-xl font-bold ${result.tipo === "P" ? "text-[var(--present)]" : "text-[var(--late)]"}`}>
              {result.tipo === "P" ? "Presente" : "Atraso"}
            </p>
            <p className="text-[var(--text-primary)] mt-2">{result.nombre}</p>
            <p className="text-[var(--text-muted)] text-sm font-mono">{result.hora}</p>
            {result.tipo === "A" && (
              <p className="text-[var(--late)] text-sm mt-3">Recuerda: 3 atrasos = 1 falta efectiva</p>
            )}
            <p className="text-[var(--text-muted)] text-xs mt-4">Revisa tu correo para el comprobante</p>
          </div>
        )}

        {result.status === "error" && (
          <div className="rounded-2xl p-6 bg-[var(--absent)]/10 border-2 border-[var(--absent)]/30">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--absent)]/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--absent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[var(--absent)]">{result.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
