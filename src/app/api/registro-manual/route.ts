import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createRegistro, hasRegistered } from "@/lib/google-sheets";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { sesionId, email, nombre, tipo } = (await req.json()) as {
    sesionId: string;
    email: string;
    nombre: string;
    tipo: "P" | "A" | "F";
  };

  const alreadyRegistered = await hasRegistered(sesionId, email);
  if (alreadyRegistered) {
    return NextResponse.json(
      { error: "Este estudiante ya tiene registro en esta sesion" },
      { status: 409 }
    );
  }

  const now = new Date();
  await createRegistro({
    sesion_id: sesionId,
    email,
    nombre,
    hora_registro: now.toTimeString().split(" ")[0],
    lat: 0,
    lng: 0,
    distancia_m: 0,
    tipo,
    metodo: "manual",
  });

  return NextResponse.json({ success: true });
}
