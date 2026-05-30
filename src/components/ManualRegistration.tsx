"use client";

import { useState } from "react";

interface Student {
  nombre: string;
  email: string;
}

interface ManualRegistrationProps {
  students: Student[];
  sesionId: string;
  onRegistered: () => void;
}

export default function ManualRegistration({ students, sesionId, onRegistered }: ManualRegistrationProps) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [tipo, setTipo] = useState<"P" | "A" | "F">("P");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!selectedEmail) return;
    setLoading(true);
    setMessage("");

    const student = students.find((s) => s.email === selectedEmail);
    if (!student) return;

    const res = await fetch("/api/registro-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sesionId, email: student.email, nombre: student.nombre, tipo }),
    });

    if (res.ok) {
      setMessage(`${student.nombre} registrado como ${tipo === "P" ? "Presente" : tipo === "A" ? "Atraso" : "Falta"}`);
      setSelectedEmail("");
      onRegistered();
    } else {
      const data = await res.json();
      setMessage(data.error || "Error al registrar");
    }
    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700">Registro manual</h3>
      <select value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)} className="w-full border rounded p-2 text-sm">
        <option value="">Seleccionar estudiante...</option>
        {students.map((s) => (
          <option key={s.email} value={s.email}>{s.nombre}</option>
        ))}
      </select>
      <div className="flex gap-2">
        {(["P", "A", "F"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`px-3 py-1 rounded text-sm ${
              tipo === t
                ? t === "P" ? "bg-green-600 text-white" : t === "A" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                : "bg-gray-100"
            }`}
          >
            {t === "P" ? "Presente" : t === "A" ? "Atraso" : "Falta"}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={!selectedEmail || loading} className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Registrando..." : "Registrar"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
