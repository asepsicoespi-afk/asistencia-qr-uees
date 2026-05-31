"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email === process.env.NEXT_PUBLIC_PROFESSOR_EMAIL) {
      router.push("/profesor");
    }
  }, [session, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center space-y-8 p-8">
        <div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Asistencia QR
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Etica UEES — UFORU1103
          </p>
        </div>

        {status === "loading" ? (
          <div className="animate-pulse text-[var(--accent)]">Cargando...</div>
        ) : session ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-6 py-3">
            <p className="text-[var(--accent)] text-sm">
              Conectado como {session.user?.email}
            </p>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[var(--accent-hover)] transition-all"
          >
            Iniciar sesion con Google
          </button>
        )}

        <p className="text-sm text-[var(--text-muted)]">
          Solo cuentas @uees.edu.ec
        </p>
      </div>
    </main>
  );
}
