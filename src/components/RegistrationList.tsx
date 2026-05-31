"use client";

interface Registration {
  nombre: string;
  hora_registro: string;
  tipo: "P" | "A" | "F";
  metodo: "qr" | "manual";
}

interface RegistrationListProps {
  registrations: Registration[];
  totalStudents: number;
}

export default function RegistrationList({ registrations }: RegistrationListProps) {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)] text-sm">
          Esperando registros...
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
      {registrations.map((r, i) => (
        <div
          key={i}
          className="flex justify-between items-center py-2.5 px-3 bg-[var(--bg-secondary)] rounded-lg text-sm"
        >
          <span className="text-[var(--text-primary)] font-medium truncate mr-4">
            {r.nombre}
          </span>
          <div className="flex gap-3 items-center shrink-0">
            <span className="text-[var(--text-muted)] font-mono text-xs">
              {r.hora_registro}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                r.tipo === "P"
                  ? "bg-[var(--present)]/10 text-[var(--present)]"
                  : "bg-[var(--late)]/10 text-[var(--late)]"
              }`}
            >
              {r.tipo === "P" ? "Presente" : "Atraso"}
            </span>
            {r.metodo === "manual" && (
              <span className="text-xs text-[var(--text-muted)] italic">manual</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
