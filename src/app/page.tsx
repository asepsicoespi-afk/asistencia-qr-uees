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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Asistencia — Etica UEES
        </h1>
        <p className="text-gray-600">
          Sistema de registro de asistencia con codigo QR
        </p>
        {status === "loading" ? (
          <p className="text-gray-400">Cargando...</p>
        ) : session ? (
          <p className="text-green-600">
            Conectado como {session.user?.email}
          </p>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Iniciar sesion con Google
          </button>
        )}
        <p className="text-sm text-gray-400">
          Solo cuentas @uees.edu.ec
        </p>
      </div>
    </main>
  );
}
