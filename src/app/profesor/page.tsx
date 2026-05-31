"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import QRDisplay from "@/components/QRDisplay";
import Timer from "@/components/Timer";
import RegistrationList from "@/components/RegistrationList";
import ManualRegistration from "@/components/ManualRegistration";
import SessionSummary from "@/components/SessionSummary";
import { PRESENTE_WINDOW_MS, TOTAL_WINDOW_MS } from "@/lib/constants";
import type { Paralelo } from "@/lib/constants";

type Phase = "select" | "active" | "closed";

interface Registration {
  nombre: string;
  hora_registro: string;
  tipo: "P" | "A" | "F";
  metodo: "qr" | "manual";
}

interface Student {
  nombre: string;
  email: string;
}

const STUDENT_COUNTS: Record<Paralelo, number> = { M02: 41, P83: 30, P04: 30 };
const PARALELO_LABELS: Record<Paralelo, string> = {
  M02: "M02 — Medicina",
  P83: "P83",
  P04: "P04",
};

export default function ProfesorPage() {
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState<Phase>("select");
  const [paralelo, setParalelo] = useState<Paralelo>("M02");
  const [sesionId, setSesionId] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const closedRef = useRef(false);

  const isProfesor =
    session?.user?.email === process.env.NEXT_PUBLIC_PROFESSOR_EMAIL;

  const fetchRegistrations = useCallback(async () => {
    if (!sesionId) return;
    try {
      const res = await fetch(`/api/registros/${sesionId}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch {
      // silent fail on poll
    }
  }, [sesionId]);

  useEffect(() => {
    if (phase !== "active" || !sesionId) return;
    const interval = setInterval(fetchRegistrations, 3000);
    return () => clearInterval(interval);
  }, [phase, sesionId, fetchRegistrations]);

  async function openSession() {
    setLoading(true);
    closedRef.current = false;
    const res = await fetch("/api/sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paralelo }),
    });
    const data = await res.json();
    setSesionId(data.sesion_id);
    setStartTime(Date.now());
    setRegistrations([]);

    const studRes = await fetch(`/api/estudiantes?paralelo=${paralelo}`);
    if (studRes.ok) {
      const studData = await studRes.json();
      setStudents(
        studData.map((s: { nombre: string; email: string }) => ({
          nombre: s.nombre,
          email: s.email,
        }))
      );
    }

    setPhase("active");
    setLoading(false);
  }

  const closeSession = useCallback(async () => {
    if (closedRef.current) return;
    closedRef.current = true;
    await fetch(`/api/sesion/${sesionId}`, { method: "PATCH" });
    await fetch("/api/resumen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesionId }),
    });
    await fetchRegistrations();
    setPhase("closed");
  }, [sesionId, fetchRegistrations]);

  const handleExpire = useCallback(() => {
    closeSession();
  }, [closeSession]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-pulse text-[var(--accent)] text-lg">
          Cargando...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Panel de Asistencia
          </h1>
          <button
            onClick={() => signIn("google")}
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-3 rounded-xl font-semibold hover:bg-[var(--accent-hover)] transition-all"
          >
            Iniciar sesion
          </button>
        </div>
      </main>
    );
  }

  if (!isProfesor) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--absent)]">Acceso restringido al profesor.</p>
        </div>
      </main>
    );
  }

  const presentes = registrations.filter((r) => r.tipo === "P").length;
  const atrasos = registrations.filter((r) => r.tipo === "A").length;
  const total = STUDENT_COUNTS[paralelo];

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Panel de Asistencia
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Etica UEES — UFORU1103
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
            <span className="text-sm text-[var(--text-secondary)]">
              {session.user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* SELECT PHASE */}
      {phase === "select" && (
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Nueva sesion
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Selecciona el paralelo para abrir asistencia
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Paralelo
              </label>
              <select
                value={paralelo}
                onChange={(e) => setParalelo(e.target.value as Paralelo)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl p-3.5 text-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="M02">M02 — Medicina (41)</option>
                <option value="P83">P83 (30)</option>
                <option value="P04">P04 (30)</option>
              </select>
            </div>

            <button
              onClick={openSession}
              disabled={loading}
              className="w-full bg-[var(--accent)] text-[var(--bg-primary)] py-4 rounded-xl text-lg font-bold hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Abriendo...
                </span>
              ) : (
                "Abrir asistencia"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE PHASE */}
      {phase === "active" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* QR + Timer Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Sesion activa
                </span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {PARALELO_LABELS[paralelo]}
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-[var(--present)]/10 text-[var(--present)] px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-[var(--present)] animate-pulse"></div>
                EN VIVO
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* QR */}
              <div className="bg-white rounded-2xl p-4">
                <QRDisplay token={sesionId} />
              </div>

              {/* Timer + Stats */}
              <div className="flex-1 text-center md:text-left space-y-6">
                <Timer
                  endTime={startTime + TOTAL_WINDOW_MS}
                  presenteDeadline={startTime + PRESENTE_WINDOW_MS}
                  onExpire={handleExpire}
                />
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--present)]">{presentes}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Presentes</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--late)]">{atrasos}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Atrasos</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--text-secondary)]">
                      {registrations.length}/{total}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Registrados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Registrations + Manual */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Registration List */}
            <div className="md:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Registros en tiempo real
              </h3>
              <RegistrationList
                registrations={registrations}
                totalStudents={total}
              />
            </div>

            {/* Manual Registration */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
              <ManualRegistration
                students={students}
                sesionId={sesionId}
                onRegistered={fetchRegistrations}
              />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closeSession}
            className="w-full bg-[var(--absent)]/10 text-[var(--absent)] border border-[var(--absent)]/30 py-4 rounded-xl text-lg font-semibold hover:bg-[var(--absent)]/20 transition-all"
          >
            Cerrar asistencia
          </button>
        </div>
      )}

      {/* CLOSED PHASE */}
      {phase === "closed" && (
        <div className="max-w-lg mx-auto mt-12 space-y-6">
          <SessionSummary
            total={total}
            presentes={presentes}
            atrasos={atrasos}
            ausentes={total - presentes - atrasos}
            paralelo={paralelo}
          />
          <button
            onClick={() => {
              setPhase("select");
              setSesionId("");
              setRegistrations([]);
              closedRef.current = false;
            }}
            className="w-full bg-[var(--accent)] text-[var(--bg-primary)] py-4 rounded-xl text-lg font-bold hover:bg-[var(--accent-hover)] transition-all"
          >
            Nueva sesion
          </button>
        </div>
      )}
    </main>
  );
}
