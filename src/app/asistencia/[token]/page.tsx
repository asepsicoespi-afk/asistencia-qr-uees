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
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Registro de Asistencia</h1>
          <p className="text-gray-600">Etica — UEES</p>
          <button onClick={() => signIn("google")} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
            Iniciar sesion con Google
          </button>
          <p className="text-sm text-gray-400">Usa tu correo @uees.edu.ec</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8 max-w-sm">
        <h1 className="text-2xl font-bold">Registro de Asistencia</h1>
        <p className="text-gray-600">{session.user?.email}</p>

        {result.status === "idle" && (
          <button onClick={requestLocation} className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-green-700">
            Registrar asistencia
          </button>
        )}

        {result.status === "requesting_location" && (
          <div className="space-y-2">
            <div className="animate-pulse text-blue-600 text-lg">Obteniendo ubicacion...</div>
            <p className="text-sm text-gray-500">Acepta el permiso de ubicacion en tu navegador</p>
          </div>
        )}

        {result.status === "loading" && (
          <div className="animate-pulse text-blue-600 text-lg">Registrando...</div>
        )}

        {result.status === "success" && (
          <div className={`p-6 rounded-lg ${result.tipo === "P" ? "bg-green-50 border-2 border-green-500" : "bg-yellow-50 border-2 border-yellow-500"}`}>
            <p className="text-4xl mb-2">{result.tipo === "P" ? "✅" : "🟡"}</p>
            <p className="text-xl font-bold">
              {result.tipo === "P" ? "Asistencia registrada — Presente" : "Asistencia registrada — Atraso"}
            </p>
            <p className="text-gray-600 mt-2">{result.nombre}</p>
            <p className="text-gray-400 text-sm">{result.hora}</p>
            {result.tipo === "A" && (
              <p className="text-yellow-600 text-sm mt-2">Recuerda: 3 atrasos = 1 falta efectiva</p>
            )}
            <p className="text-gray-400 text-xs mt-4">Revisa tu correo para el comprobante</p>
          </div>
        )}

        {result.status === "error" && (
          <div className="p-6 rounded-lg bg-red-50 border-2 border-red-500">
            <p className="text-4xl mb-2">❌</p>
            <p className="text-lg font-bold text-red-700">{result.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
