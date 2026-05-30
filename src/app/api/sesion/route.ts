import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createSesion, getSesion } from "@/lib/google-sheets";
import { v4 as uuidv4 } from "uuid";
import type { Paralelo } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { paralelo } = (await req.json()) as { paralelo: Paralelo };
  if (!["M02", "P83", "P04"].includes(paralelo)) {
    return NextResponse.json({ error: "Paralelo invalido" }, { status: 400 });
  }

  const now = new Date();
  const sesionId = uuidv4();

  await createSesion({
    sesion_id: sesionId,
    paralelo,
    fecha: now.toISOString().split("T")[0],
    hora_apertura: now.toTimeString().split(" ")[0],
    hora_cierre: "",
    estado: "abierta",
  });

  return NextResponse.json({
    sesion_id: sesionId,
    paralelo,
    hora_apertura: now.toISOString(),
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sesionId = req.nextUrl.searchParams.get("id");
  if (!sesionId) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const sesion = await getSesion(sesionId);
  if (!sesion) {
    return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 });
  }

  return NextResponse.json(sesion);
}
