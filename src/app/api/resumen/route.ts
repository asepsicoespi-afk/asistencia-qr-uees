import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getEstudiantes,
  getSesion,
  updateResumen,
  getAllRegistrosForStudent,
  countClosedSessions,
} from "@/lib/google-sheets";
import {
  calculateFaltasEfectivas,
  calculateDescuento,
  getEstado,
} from "@/lib/attendance-rules";
import type { Paralelo } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { sesionId } = (await req.json()) as { sesionId: string };

  const sesion = await getSesion(sesionId);
  if (!sesion) {
    return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 });
  }

  const paralelo = sesion.paralelo as Paralelo;
  const estudiantes = await getEstudiantes(paralelo);
  const totalSesiones = await countClosedSessions(paralelo);

  for (const est of estudiantes) {
    const studentRegs = await getAllRegistrosForStudent(est.email);

    const presentes = studentRegs.filter((r) => r.tipo === "P").length;
    const atrasosCount = studentRegs.filter((r) => r.tipo === "A").length;
    const faltasDirectas = totalSesiones - presentes - atrasosCount;

    const faltasEfectivas = calculateFaltasEfectivas(faltasDirectas, atrasosCount);
    const descuento = calculateDescuento(faltasDirectas, atrasosCount);
    const estado = getEstado(faltasEfectivas, paralelo);

    await updateResumen(
      paralelo, est.codigo, est.nombre, est.email,
      totalSesiones, presentes, atrasosCount, faltasDirectas,
      faltasEfectivas, descuento, estado
    );
  }

  return NextResponse.json({ success: true, updated: estudiantes.length });
}
