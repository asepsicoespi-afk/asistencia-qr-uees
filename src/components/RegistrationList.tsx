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

export default function RegistrationList({ registrations, totalStudents }: RegistrationListProps) {
  const presentes = registrations.filter((r) => r.tipo === "P").length;
  const atrasos = registrations.filter((r) => r.tipo === "A").length;

  return (
    <div>
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-green-600 font-bold">Presentes: {presentes}</span>
        <span className="text-yellow-500 font-bold">Atrasos: {atrasos}</span>
        <span className="text-gray-400">Registrados: {registrations.length}/{totalStudents}</span>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {registrations.map((r, i) => (
          <div key={i} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
            <span>{r.nombre}</span>
            <div className="flex gap-2 items-center">
              <span className="text-gray-400">{r.hora_registro}</span>
              <span className={r.tipo === "P" ? "text-green-600 font-bold" : "text-yellow-500 font-bold"}>
                {r.tipo === "P" ? "Presente" : "Atraso"}
              </span>
              {r.metodo === "manual" && <span className="text-xs text-gray-400">(manual)</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
