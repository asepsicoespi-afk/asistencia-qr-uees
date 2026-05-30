import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getRegistrosBySesion } from "@/lib/google-sheets";

export async function GET(
  req: NextRequest,
  { params }: { params: { sesionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const registros = await getRegistrosBySesion(params.sesionId);
  return NextResponse.json(registros);
}
