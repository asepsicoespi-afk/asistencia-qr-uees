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
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center space-y-6">
      <div>
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Sesion cerrada
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{paralelo}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <p className="text-3xl font-bold text-[var(--present)]">{presentes}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Presentes</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <p className="text-3xl font-bold text-[var(--late)]">{atrasos}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Atrasos</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <p className="text-3xl font-bold text-[var(--absent)]">{ausentes}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Ausentes</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-[var(--accent)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Guardado en Google Sheets
      </div>

      <p className="text-xs text-[var(--text-muted)]">Total: {total} estudiantes</p>
    </div>
  );
}
