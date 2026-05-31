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
      setMessage(`${student.nombre} registrado`);
      setSelectedEmail("");
      onRegistered();
    } else {
      const data = await res.json();
      setMessage(data.error || "Error al registrar");
    }
    setLoading(false);
  }

  const tipoConfig = {
    P: { label: "Presente", color: "bg-[var(--present)]", colorInactive: "bg-[var(--present)]/10 text-[var(--present)]" },
    A: { label: "Atraso", color: "bg-[var(--late)]", colorInactive: "bg-[var(--late)]/10 text-[var(--late)]" },
    F: { label: "Falta", color: "bg-[var(--absent)]", colorInactive: "bg-[var(--absent)]/10 text-[var(--absent)]" },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
        Registro manual
      </h3>

      <select
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
      >
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
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tipo === t
                ? `${tipoConfig[t].color} text-[var(--bg-primary)]`
                : tipoConfig[t].colorInactive
            }`}
          >
            {tipoConfig[t].label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedEmail || loading}
        className="w-full bg-[var(--accent)] text-[var(--bg-primary)] py-2.5 rounded-lg text-sm font-semibold hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Registrando..." : "Registrar"}
      </button>

      {message && (
        <p className="text-sm text-[var(--text-secondary)] text-center">{message}</p>
      )}
    </div>
  );
}
