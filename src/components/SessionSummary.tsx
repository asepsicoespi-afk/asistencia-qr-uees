"use client";

interface SummaryProps {
  total: number;
  presentes: number;
  atrasos: number;
  ausentes: number;
  paralelo: string;
}

export default function SessionSummary({ total, presentes, atrasos, ausentes, paralelo }: SummaryProps) {
  return (
    <div className="bg-white border rounded-lg p-6 text-center space-y-4">
      <h2 className="text-xl font-bold">Sesion cerrada — {paralelo}</h2>
      <div className="flex justify-center gap-8">
        <div>
          <p className="text-3xl font-bold text-green-600">{presentes}</p>
          <p className="text-sm text-gray-500">Presentes</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-yellow-500">{atrasos}</p>
          <p className="text-sm text-gray-500">Atrasos</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-500">{ausentes}</p>
          <p className="text-sm text-gray-500">Ausentes</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">Total: {total} estudiantes</p>
      <p className="text-sm text-green-600">Datos guardados en Google Sheets</p>
    </div>
  );
}
