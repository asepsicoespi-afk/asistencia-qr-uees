import { google, sheets_v4 } from "googleapis";
import {
  SHEET_ESTUDIANTES,
  SHEET_SESIONES,
  SHEET_REGISTROS,
  SHEET_RESUMEN,
} from "./constants";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SPREADSHEET_ID = () => process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

// --- Estudiantes ---

export interface Estudiante {
  paralelo: string;
  codigo: string;
  nombre: string;
  email: string;
}

export async function getEstudiantes(paralelo: string): Promise<Estudiante[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_ESTUDIANTES}!A2:D`,
  });
  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0] === paralelo)
    .map((row) => ({
      paralelo: row[0],
      codigo: row[1],
      nombre: row[2],
      email: row[3],
    }));
}

export async function getEstudianteByEmail(
  email: string
): Promise<Estudiante | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_ESTUDIANTES}!A2:D`,
  });
  const rows = res.data.values || [];
  const row = rows.find((r) => r[3]?.toLowerCase() === email.toLowerCase());
  if (!row) return null;
  return { paralelo: row[0], codigo: row[1], nombre: row[2], email: row[3] };
}

// --- Sesiones ---

export interface Sesion {
  sesion_id: string;
  paralelo: string;
  fecha: string;
  hora_apertura: string;
  hora_cierre: string;
  estado: string;
}

export async function createSesion(sesion: Sesion): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_SESIONES}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          sesion.sesion_id,
          sesion.paralelo,
          sesion.fecha,
          sesion.hora_apertura,
          sesion.hora_cierre,
          sesion.estado,
        ],
      ],
    },
  });
}

export async function closeSesion(
  sesionId: string,
  horaCierre: string
): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_SESIONES}!A:F`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === sesionId);
  if (rowIndex === -1) throw new Error("Sesion not found");

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_SESIONES}!E${rowIndex + 1}:F${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[horaCierre, "cerrada"]],
    },
  });
}

export async function getSesion(sesionId: string): Promise<Sesion | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_SESIONES}!A:F`,
  });
  const rows = res.data.values || [];
  const row = rows.find((r) => r[0] === sesionId);
  if (!row) return null;
  return {
    sesion_id: row[0],
    paralelo: row[1],
    fecha: row[2],
    hora_apertura: row[3],
    hora_cierre: row[4],
    estado: row[5],
  };
}

// --- Registros ---

export interface Registro {
  sesion_id: string;
  email: string;
  nombre: string;
  hora_registro: string;
  lat: number;
  lng: number;
  distancia_m: number;
  tipo: "P" | "A" | "F";
  metodo: "qr" | "manual";
}

export async function createRegistro(registro: Registro): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_REGISTROS}!A:I`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          registro.sesion_id,
          registro.email,
          registro.nombre,
          registro.hora_registro,
          registro.lat,
          registro.lng,
          registro.distancia_m,
          registro.tipo,
          registro.metodo,
        ],
      ],
    },
  });
}

export async function getRegistrosBySesion(
  sesionId: string
): Promise<Registro[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_REGISTROS}!A:I`,
  });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[0] === sesionId)
    .map((r) => ({
      sesion_id: r[0],
      email: r[1],
      nombre: r[2],
      hora_registro: r[3],
      lat: parseFloat(r[4]),
      lng: parseFloat(r[5]),
      distancia_m: parseInt(r[6]),
      tipo: r[7] as "P" | "A" | "F",
      metodo: r[8] as "qr" | "manual",
    }));
}

export async function hasRegistered(
  sesionId: string,
  email: string
): Promise<boolean> {
  const registros = await getRegistrosBySesion(sesionId);
  return registros.some((r) => r.email.toLowerCase() === email.toLowerCase());
}

// --- Resumen ---

export async function updateResumen(
  paralelo: string,
  codigo: string,
  nombre: string,
  email: string,
  totalSesiones: number,
  presentes: number,
  atrasos: number,
  faltasDirectas: number,
  faltasEfectivas: number,
  descuentoPts: number,
  estado: string
): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_RESUMEN}!A:K`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(
    (r) => r[3]?.toLowerCase() === email.toLowerCase()
  );

  const rowData = [
    paralelo, codigo, nombre, email, totalSesiones, presentes, atrasos,
    faltasDirectas, faltasEfectivas, descuentoPts, estado,
  ];

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID(),
      range: `${SHEET_RESUMEN}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [rowData] },
    });
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID(),
      range: `${SHEET_RESUMEN}!A${rowIndex + 1}:K${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [rowData] },
    });
  }
}

// --- Helper: obtener todos los registros de un estudiante ---

export async function getAllRegistrosForStudent(
  email: string
): Promise<Registro[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_REGISTROS}!A:I`,
  });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[1]?.toLowerCase() === email.toLowerCase())
    .map((r) => ({
      sesion_id: r[0],
      email: r[1],
      nombre: r[2],
      hora_registro: r[3],
      lat: parseFloat(r[4]),
      lng: parseFloat(r[5]),
      distancia_m: parseInt(r[6]),
      tipo: r[7] as "P" | "A" | "F",
      metodo: r[8] as "qr" | "manual",
    }));
}

// --- Helper: contar sesiones cerradas de un paralelo ---

export async function countClosedSessions(paralelo: string): Promise<number> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_SESIONES}!A:F`,
  });
  const rows = res.data.values || [];
  return rows.filter((r) => r[1] === paralelo && r[5] === "cerrada").length;
}
