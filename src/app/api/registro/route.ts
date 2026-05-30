import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getSesion,
  getEstudianteByEmail,
  hasRegistered,
  createRegistro,
} from "@/lib/google-sheets";
import { sendAttendanceEmail } from "@/lib/gmail";
import { haversineDistance, isWithinRadius } from "@/lib/geo";
import { PRESENTE_WINDOW_MS, TOTAL_WINDOW_MS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const email = session.user.email;
  const { sesionId, lat, lng } = (await req.json()) as {
    sesionId: string;
    lat: number;
    lng: number;
  };

  const sesion = await getSesion(sesionId);
  if (!sesion) {
    return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 });
  }
  if (sesion.estado !== "abierta") {
    return NextResponse.json({ error: "La sesion de asistencia ya cerro" }, { status: 410 });
  }

  const apertura = new Date(`${sesion.fecha}T${sesion.hora_apertura}`);
  const now = new Date();
  const elapsed = now.getTime() - apertura.getTime();

  if (elapsed > TOTAL_WINDOW_MS) {
    return NextResponse.json({ error: "La sesion de asistencia ya cerro" }, { status: 410 });
  }

  const estudiante = await getEstudianteByEmail(email);
  if (!estudiante || estudiante.paralelo !== sesion.paralelo) {
    return NextResponse.json({ error: "Tu correo no esta registrado en este paralelo" }, { status: 403 });
  }

  const alreadyRegistered = await hasRegistered(sesionId, email);
  if (alreadyRegistered) {
    return NextResponse.json({ error: "Ya registraste tu asistencia en esta sesion" }, { status: 409 });
  }

  const buildingLat = parseFloat(process.env.BUILDING_LAT!);
  const buildingLng = parseFloat(process.env.BUILDING_LNG!);
  const radius = parseInt(process.env.GEO_RADIUS_METERS || "50");
  const distancia = haversineDistance(lat, lng, buildingLat, buildingLng);

  if (!isWithinRadius(lat, lng, buildingLat, buildingLng, radius)) {
    return NextResponse.json(
      { error: "No estas dentro del rango del aula", distancia_m: distancia },
      { status: 403 }
    );
  }

  const tipo = elapsed <= PRESENTE_WINDOW_MS ? "P" : "A";

  const horaRegistro = now.toTimeString().split(" ")[0];
  await createRegistro({
    sesion_id: sesionId,
    email,
    nombre: estudiante.nombre,
    hora_registro: horaRegistro,
    lat,
    lng,
    distancia_m: distancia,
    tipo,
    metodo: "qr",
  });

  const accessToken = (session as any).accessToken;
  if (accessToken) {
    sendAttendanceEmail(
      accessToken, email, estudiante.nombre, tipo, sesion.paralelo, sesion.fecha, horaRegistro
    ).catch((err) => console.error("Error sending email:", err));
  }

  return NextResponse.json({
    success: true,
    tipo,
    nombre: estudiante.nombre,
    hora: horaRegistro,
    distancia_m: distancia,
  });
}
