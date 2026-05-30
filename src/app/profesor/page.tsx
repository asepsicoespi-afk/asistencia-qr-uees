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

  const isProfesor = session?.user?.email === process.env.NEXT_PUBLIC_PROFESSOR_EMAIL;

  const fetchRegistrations = useCallback(async () => {
    if (!sesionId) return;
    try {
      const res = await fetch(`/api/registros/${sesionId}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (e) {}
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
      setStudents(studData.map((s: any) => ({ nombre: s.nombre, email: s.email })));
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

  if (status === "loading") return <p className="p-8">Cargando...</p>;
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <button onClick={() => signIn("google")} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Iniciar sesion
        </button>
      </main>
    );
  }
  if (!isProfesor) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Acceso restringido al profesor.</p>
      </main>
    );
  }

  const presentes = registrations.filter((r) => r.tipo === "P").length;
  const atrasos = registrations.filter((r) => r.tipo === "A").length;
  const total = STUDENT_COUNTS[paralelo];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Asistencia</h1>

      {phase === "select" && (
        <div className="max-w-md mx-auto space-y-4">
          <label className="block text-sm font-medium text-gray-700">Paralelo</label>
          <select value={paralelo} onChange={(e) => setParalelo(e.target.value as Paralelo)} className="w-full border rounded-lg p-3 text-lg">
            <option value="M02">M02 — Medicina</option>
            <option value="P83">P83</option>
            <option value="P04">P04</option>
          </select>
          <button onClick={openSession} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-green-700 disabled:opacity-50">
            {loading ? "Abriendo..." : "Abrir asistencia"}
          </button>
        </div>
      )}

      {phase === "active" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <p className="text-lg text-gray-600 mb-4">Paralelo: <strong>{paralelo}</strong></p>
            <QRDisplay token={sesionId} />
            <div className="mt-4">
              <Timer endTime={startTime + TOTAL_WINDOW_MS} presenteDeadline={startTime + PRESENTE_WINDOW_MS} onExpire={handleExpire} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="font-bold mb-2">Registros en tiempo real</h2>
            <RegistrationList registrations={registrations} totalStudents={total} />
          </div>

          <ManualRegistration students={students} sesionId={sesionId} onRegistered={fetchRegistrations} />

          <button onClick={closeSession} className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700">
            Cerrar asistencia
          </button>
        </div>
      )}

      {phase === "closed" && (
        <div className="max-w-md mx-auto space-y-6">
          <SessionSummary total={total} presentes={presentes} atrasos={atrasos} ausentes={total - presentes - atrasos} paralelo={paralelo} />
          <button onClick={() => { setPhase("select"); setSesionId(""); setRegistrations([]); closedRef.current = false; }} className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700">
            Nueva sesion
          </button>
        </div>
      )}
    </main>
  );
}
