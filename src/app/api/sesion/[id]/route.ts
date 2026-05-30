import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { closeSesion } from "@/lib/google-sheets";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.PROFESSOR_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const now = new Date();
  await closeSesion(params.id, now.toTimeString().split(" ")[0]);

  return NextResponse.json({ closed: true, hora_cierre: now.toISOString() });
}
