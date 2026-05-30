import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getEstudiantes } from "@/lib/google-sheets";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const paralelo = req.nextUrl.searchParams.get("paralelo");
  if (!paralelo) {
    return NextResponse.json({ error: "paralelo requerido" }, { status: 400 });
  }

  const estudiantes = await getEstudiantes(paralelo);
  return NextResponse.json(estudiantes);
}
