import { google } from "googleapis";

export async function sendAttendanceEmail(
  accessToken: string,
  to: string,
  nombre: string,
  tipo: "P" | "A",
  paralelo: string,
  fecha: string,
  hora: string
): Promise<void> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const isPresenteEmail = tipo === "P";
  const tipoLabel = isPresenteEmail ? "PRESENTE" : "ATRASO";
  const subject = isPresenteEmail
    ? `Asistencia registrada - Etica ${paralelo}`
    : `Atraso registrado - Etica ${paralelo}`;

  const atrasoNote = isPresenteEmail
    ? ""
    : "\nRecuerda que 3 atrasos equivalen a 1 falta efectiva.\n";

  const body = `Hola ${nombre},

Tu asistencia ha sido registrada como ${tipoLabel} en la clase de Etica (UFORU1103).

- Fecha: ${fecha}
- Hora de registro: ${hora}
- Paralelo: ${paralelo}
${atrasoNote}
Este correo es un comprobante automatico. No es necesario responder.

Felipe Andres Guzman Dahik
Profesor de Etica (UFORU1103) - UEES`;

  const raw = Buffer.from(
    `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
      body
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
