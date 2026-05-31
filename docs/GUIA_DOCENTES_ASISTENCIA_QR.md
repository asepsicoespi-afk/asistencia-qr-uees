# Guia para Docentes: Sistema de Asistencia con Codigo QR

**Universidad de Especialidades Espiritu Santo (UEES)**
Autor: Felipe Andres Guzman Dahik — Profesor de Etica (UFORU1103)
Fecha: Mayo 2026

---

## Que es este proyecto

Es un sistema web gratuito que te permite tomar asistencia en clase usando un codigo QR que proyectas en pantalla. Tus estudiantes lo escanean con su celular y su asistencia queda registrada automaticamente en un Google Sheets.

### Como funciona en clase

1. Abres tu panel desde la laptop y seleccionas el paralelo
2. Se genera un codigo QR unico en pantalla
3. Los estudiantes lo escanean con su celular
4. El sistema valida que esten en el aula (geolocalizacion), que usen su correo institucional, y que esten en tu lista
5. La asistencia queda registrada con fecha, hora y tipo (presente o atraso)
6. El estudiante recibe un correo de comprobante
7. Todo se guarda automaticamente en Google Sheets

### Que necesitas para replicarlo

- Una cuenta de Google con dominio institucional (@uees.edu.ec)
- Acceso a Google Cloud Console (gratuito)
- Una laptop con conexion a internet
- Un asistente de inteligencia artificial (Claude Code, ChatGPT, Copilot, Gemini, o cualquier otro)
- Aproximadamente 2-3 horas para la configuracion inicial

### Costo

**$0.** Todo funciona con servicios gratuitos: Vercel (hosting), Google Sheets (base de datos), Google Cloud (autenticacion), Gmail (correos).

---

## Antes de empezar

### Vocabulario minimo

No necesitas saber programar, pero estos terminos aparecen en la guia:

| Termino | Que significa |
|---|---|
| **Deploy** | Publicar tu aplicacion en internet para que sea accesible |
| **Vercel** | Un servicio gratuito que hospeda tu aplicacion web |
| **API** | Una forma en que dos sistemas se comunican entre si |
| **OAuth** | El sistema que permite "Iniciar sesion con Google" |
| **QR dinamico** | Un codigo QR que cambia cada vez que abres una sesion |
| **Geolocalizacion** | La capacidad del celular de saber donde esta fisicamente |
| **Repositorio (repo)** | Una carpeta en internet (GitHub) donde vive el codigo |
| **Variable de entorno** | Un dato secreto (contrasenya, clave) que la aplicacion necesita pero no se muestra en el codigo |
| **Google Sheets API** | La herramienta que permite a una aplicacion leer y escribir en un Google Sheets automaticamente |
| **Service Account** | Una "cuenta robot" de Google que tu aplicacion usa para acceder a Sheets sin que un humano haga login |

---

## Fase 1: Crear el proyecto en Google Cloud

**Tiempo estimado: 20 minutos**
**Donde: navegador web**

Esta fase se hace una sola vez. Aqui creas las credenciales que tu aplicacion necesita para funcionar.

### Paso 1.1 — Crear un proyecto en Google Cloud

1. Abre https://console.cloud.google.com
2. Inicia sesion con tu cuenta institucional @uees.edu.ec
3. En la barra superior, haz clic en el selector de proyectos (dice "Seleccionar un proyecto")
4. Clic en **Nuevo proyecto**
5. Nombre del proyecto: `asistencia-qr` (o el nombre que prefieras)
6. Clic en **Crear**
7. Espera unos segundos y asegurate de que el proyecto nuevo este seleccionado en la barra superior

### Paso 1.2 — Habilitar las APIs necesarias

1. En el menu lateral izquierdo, ve a **APIs y servicios** > **Biblioteca**
2. Busca **Google Sheets API** y haz clic en **Habilitar**
3. Regresa a la Biblioteca, busca **Gmail API** y haz clic en **Habilitar**

### Paso 1.3 — Configurar la pantalla de consentimiento OAuth

1. Ve a **APIs y servicios** > **Pantalla de consentimiento OAuth**
2. Selecciona **Interno** (esto hace que solo usuarios de tu dominio @uees.edu.ec puedan usarlo)
3. Llena los campos obligatorios:
   - Nombre de la aplicacion: `Asistencia QR`
   - Correo electronico de asistencia: tu correo @uees.edu.ec
   - Correo del desarrollador: tu correo @uees.edu.ec
4. Clic en **Guardar y continuar** en todos los pasos hasta terminar

### Paso 1.4 — Crear credenciales OAuth 2.0

1. Ve a **APIs y servicios** > **Credenciales**
2. Clic en **Crear credenciales** > **ID de cliente OAuth 2.0**
3. Tipo de aplicacion: **Aplicacion web**
4. Nombre: `Asistencia QR Web`
5. En **URIs de redireccionamiento autorizados**, agrega:
   - `http://localhost:3000/api/auth/callback/google`
   - (Despues agregaras la URL de produccion, pero por ahora solo esta)
6. Clic en **Crear**
7. **IMPORTANTE:** Copia y guarda en un lugar seguro:
   - **Client ID** (se ve como: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (se ve como: `GOCSPX-xxxxxx`)

### Paso 1.5 — Crear una cuenta de servicio

1. En **APIs y servicios** > **Credenciales**, clic en **Crear credenciales** > **Cuenta de servicio**
2. Nombre: `asistencia-sheets`
3. Clic en **Crear y continuar** > puedes saltar los roles > **Listo**
4. Haz clic en la cuenta de servicio que acabas de crear
5. Ve a la pestanya **Claves**
6. Clic en **Agregar clave** > **Crear clave nueva** > **JSON** > **Crear**
7. Se descarga un archivo JSON. Abrelo con un editor de texto y copia:
   - El valor de `"client_email"` (se ve como: `asistencia-sheets@tu-proyecto.iam.gserviceaccount.com`)
   - El valor de `"private_key"` (empieza con `-----BEGIN PRIVATE KEY-----`)

**Guarda estos 4 valores en un lugar seguro (Client ID, Client Secret, Service Account Email, Private Key). Los necesitaras mas adelante.**

---

## Fase 2: Crear la aplicacion con ayuda de IA

**Tiempo estimado: 30-60 minutos**
**Donde: en tu computadora, usando un asistente de IA**

En esta fase, le pides a un asistente de IA que construya la aplicacion por ti. No necesitas saber programar — solo necesitas darle las instrucciones correctas.

### Paso 2.1 — Preparar tu informacion

Antes de hablar con la IA, ten listos estos datos:

1. **Tu correo institucional** (ejemplo: juan.perez@uees.edu.ec)
2. **Tus paralelos** con cantidad de estudiantes (ejemplo: P01 con 30, P02 con 35)
3. **Las reglas de asistencia de tu materia:**
   - Cuantas faltas para advertencia formal
   - Cuantas faltas para perder el curso
   - Si los atrasos se convierten en faltas (y cuantos)
   - Cuantos puntos se descuentan por falta y por atraso
4. **Las listas de estudiantes** en CSV o Excel con: nombre, apellido, correo institucional, codigo
5. **Las coordenadas GPS del edificio** donde das clase (puedes obtenerlas abriendo Google Maps en tu celular mientras estas en el edificio, manteniendo presionado un punto en el mapa)
6. **Las credenciales de Google Cloud** que obtuviste en la Fase 1

### Paso 2.2 — El prompt para la IA

Copia el siguiente texto y pegalo en tu asistente de IA preferido (Claude Code, ChatGPT, Copilot, etc.). Reemplaza todo lo que esta entre [corchetes] con tu informacion real.

---

**PROMPT PARA LA IA:**

```
Necesito que me construyas un sistema de asistencia universitaria con codigo QR para mis clases. Te voy a dar toda la especificacion y necesito que lo construyas paso a paso.

## Que hace el sistema

1. Yo (el profesor) abro un panel web desde mi laptop y selecciono el paralelo
2. Se genera un QR unico que proyecto en pantalla
3. Los estudiantes escanean el QR con su celular
4. El sistema valida: login con Google institucional (@uees.edu.ec), geolocalizacion (que esten en el aula), y que esten en mi lista
5. Los primeros 3 minutos registra como PRESENTE, los minutos 3 a 5 como ATRASO
6. Yo puedo cerrar la asistencia manualmente o se cierra sola a los 5 minutos
7. El estudiante recibe un email de comprobante
8. Todo se guarda en Google Sheets
9. Yo puedo registrar manualmente a un estudiante (para excepciones)

## Mis datos

- Mi correo institucional (profesor): [tu-correo@uees.edu.ec]
- Paralelos y estudiantes:
  - [Paralelo 1]: [cantidad] estudiantes
  - [Paralelo 2]: [cantidad] estudiantes
  - (agrega todos los que tengas)

## Reglas de asistencia

- 1 falta = -[X] punto(s)
- 1 atraso = -[X] punto(s)
- [X] atrasos = 1 falta efectiva
- [X] faltas efectivas = advertencia formal (para [paralelos])
- [X] faltas efectivas = pierde el curso (para [paralelos])
- (Si las reglas son diferentes por paralelo, especificalo)

## Geolocalizacion

- Coordenadas del edificio: latitud [X], longitud [X]
- Radio de validacion: [X] metros

## Tecnologias que quiero usar

- Next.js 14 con TypeScript y Tailwind CSS
- NextAuth.js para login con Google (restringido a @uees.edu.ec)
- Google Sheets API como base de datos
- Gmail API para enviar comprobantes desde mi correo institucional
- Vercel para hosting (gratis)
- Tema visual: oscuro, futurista, minimalista

## Google Sheets

Necesito 4 hojas:
- "Estudiantes": paralelo, codigo, nombre, email
- "Sesiones": sesion_id, paralelo, fecha, hora_apertura, hora_cierre, estado
- "Registros": sesion_id, email, nombre, hora_registro, lat, lng, distancia_m, tipo (P/A/F), metodo (qr/manual)
- "Resumen": paralelo, codigo, nombre, email, total_sesiones, presentes, atrasos, faltas_directas, faltas_efectivas, descuento_pts, estado

## Seguridad

- QR dinamico (token UUID unico por sesion)
- Solo cuentas @uees.edu.ec pueden hacer login
- Geolocalizacion obligatoria
- Un estudiante solo puede registrar una vez por sesion
- Solo mi cuenta tiene acceso al panel de profesor

## Credenciales (para el archivo .env.local)

- GOOGLE_CLIENT_ID: [pegar aqui]
- GOOGLE_CLIENT_SECRET: [pegar aqui]
- GOOGLE_SERVICE_ACCOUNT_EMAIL: [pegar aqui]
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: [pegar aqui]
- PROFESSOR_EMAIL: [tu-correo@uees.edu.ec]
- BUILDING_LAT: [latitud]
- BUILDING_LNG: [longitud]
- GEO_RADIUS_METERS: [radio en metros]

Construye el proyecto completo, paso a paso, con commits. Al final quiero poder hacer deploy a Vercel.
```

---

### Paso 2.3 — Lo que la IA va a hacer

La IA deberia:

1. Crear el proyecto Next.js con todas las dependencias
2. Crear los archivos de configuracion (constantes, reglas de asistencia)
3. Crear el servicio de Google Sheets (lectura/escritura)
4. Crear el servicio de Gmail (envio de comprobantes)
5. Crear la autenticacion con Google
6. Crear las APIs del servidor (sesiones, registros, etc.)
7. Crear las paginas (landing, panel del profesor, pagina del estudiante)
8. Configurar los tests

**Si la IA te pide informacion adicional, dasela.** Si algo no funciona, copia el error y pegaselo a la IA para que lo corrija.

### Paso 2.4 — Verificar que funciona localmente

Cuando la IA termine, deberia decirte como ejecutar el proyecto en tu computadora:

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador. Deberias ver la pagina de inicio con el boton "Iniciar sesion con Google".

---

## Fase 3: Crear y configurar el Google Sheets

**Tiempo estimado: 15 minutos**

### Paso 3.1 — Crear el Google Sheets

1. Ve a https://sheets.google.com con tu cuenta institucional
2. Crea un nuevo Google Sheets
3. Nombralo: `Asistencia QR — [Tu Materia]`

### Paso 3.2 — Compartir con la cuenta de servicio

1. Clic en **Compartir** (boton verde arriba a la derecha)
2. Pega el email de la cuenta de servicio (el `client_email` del JSON que descargaste)
3. Permisos: **Editor**
4. Clic en **Enviar**

### Paso 3.3 — Obtener el Spreadsheet ID

Mira la URL de tu Google Sheets. Se ve asi:
```
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
```

Copia la parte que dice `ESTE_ES_EL_ID`. Lo necesitas para la variable de entorno `GOOGLE_SHEETS_SPREADSHEET_ID`.

### Paso 3.4 — Crear las hojas y encabezados

Pidele a la IA que cree las 4 hojas con los encabezados correctos usando un script. Dale el Spreadsheet ID.

### Paso 3.5 — Cargar las listas de estudiantes

Preparar un CSV con las columnas: paralelo, codigo, nombre, email

El formato del nombre debe ser: `APELLIDOS, NOMBRES` (ejemplo: `GARCIA LOPEZ, MARIA FERNANDA`)

Pidele a la IA que cargue los datos al Google Sheets.

---

## Fase 4: Publicar en internet (Deploy a Vercel)

**Tiempo estimado: 20 minutos**

### Paso 4.1 — Crear una cuenta en Vercel

1. Ve a https://vercel.com
2. Crea una cuenta (puedes usar "Continue with GitHub")
3. Es gratis para proyectos personales

### Paso 4.2 — Crear una cuenta en GitHub

Si no tienes una:
1. Ve a https://github.com
2. Crea una cuenta gratuita

### Paso 4.3 — Subir el codigo a GitHub

Pidele a la IA que:
1. Cree un repositorio en GitHub
2. Suba todo el codigo

### Paso 4.4 — Deploy a Vercel

Pidele a la IA que:
1. Conecte el repositorio con Vercel
2. Configure todas las variables de entorno en Vercel
3. Haga el deploy a produccion

La IA te dara una URL como: `https://tu-proyecto.vercel.app`

### Paso 4.5 — Agregar la URL de produccion a Google Cloud

1. Ve a Google Cloud Console > APIs y servicios > Credenciales
2. Edita tu ID de cliente OAuth
3. En **URIs de redireccionamiento autorizados**, agrega:
   - `https://tu-proyecto.vercel.app/api/auth/callback/google`
4. Guarda los cambios

### Paso 4.6 — Probar en produccion

1. Abre la URL de tu proyecto en el navegador
2. Inicia sesion con tu cuenta institucional
3. Abre una sesion de asistencia
4. Escanea el QR con tu celular
5. Verifica que el registro aparezca en el Google Sheets

---

## Fase 5: Usar en clase

### Antes de la primera clase

1. Verifica que las listas de estudiantes estan completas en el Google Sheets
2. Abre la URL de tu proyecto y confirma que puedes hacer login
3. Prueba abrir una sesion y cerrarla

### Durante la clase

1. Abre tu proyecto desde la laptop: `https://tu-proyecto.vercel.app/profesor`
2. Selecciona el paralelo
3. Clic en **Abrir asistencia**
4. Proyecta el QR en pantalla
5. Los estudiantes escanean con su celular
6. Monitora los registros en tiempo real
7. Si algun estudiante tiene problemas (celular sin GPS, sin bateria), usa el **Registro manual**
8. Cuando estes listo, clic en **Cerrar asistencia** (o espera los 5 minutos)

### Despues de la clase

- Los datos ya estan en Google Sheets
- La hoja "Resumen" se actualiza automaticamente con los acumulados
- Puedes consultar el estado de cualquier estudiante en cualquier momento

---

## Solucion de problemas comunes

| Problema | Solucion |
|---|---|
| El estudiante no puede escanear el QR | Que copie la URL manualmente en el navegador (Chrome o Safari) |
| "Necesitas compartir tu ubicacion" | El estudiante debe dar permiso de ubicacion en su navegador. No funciona en navegadores in-app (Instagram, WhatsApp). Debe abrir en Chrome o Safari |
| "No estas dentro del rango del aula" | El estudiante esta fuera del radio configurado. Verificar que las coordenadas GPS son correctas |
| "Tu correo no esta registrado" | El correo del estudiante no coincide con el que esta en el Google Sheets. Verificar la hoja "Estudiantes" |
| "Ya registraste tu asistencia" | El estudiante ya escaneo el QR para esta sesion. Solo se permite un registro por sesion |
| El QR no se genera | Verificar conexion a internet y que las credenciales esten bien configuradas |
| No llegan los correos de comprobante | Verificar que la Gmail API este habilitada y que el scope de OAuth incluya gmail.send |

---

## Seguridad y privacidad

- **Credenciales:** Nunca compartas tu Client Secret, Private Key, ni el archivo JSON de la cuenta de servicio. Guardalos en un lugar seguro.
- **Google Sheets:** Solo tu y la cuenta de servicio tienen acceso. No compartas el link del Sheets publicamente.
- **Datos de estudiantes:** El sistema solo almacena nombre, correo institucional y datos de asistencia. No almacena ubicaciones permanentes — solo valida la distancia al momento del registro.
- **Variables de entorno:** Nunca las subas a GitHub ni las compartas en chats. En Vercel estan encriptadas.

---

## Creditos y recursos

- **Proyecto original:** Felipe Andres Guzman Dahik — Profesor de Etica, UEES
- **Repositorio de referencia:** https://github.com/asepsicoespi-afk/asistencia-qr-uees
- **Tecnologias usadas:** Next.js, Vercel, Google Sheets API, Gmail API, NextAuth.js
- **Asistente IA utilizado:** Claude Code (Anthropic) — pero puedes usar cualquier asistente de IA

---

## Apendice: Datos de referencia del proyecto original

### Configuracion utilizada

| Parametro | Valor |
|---|---|
| Materia | Etica (UFORU1103) |
| Paralelos | M02 (41 est.), P83 (30 est.), P04 (30 est.) |
| Radio GPS | 25 metros |
| Ventana presente | 3 minutos |
| Ventana atraso | 3 a 5 minutos |
| Cierre automatico | 5 minutos |
| Dominio restringido | @uees.edu.ec |

### Reglas de asistencia utilizadas

| Regla | M02 y P04 | P83 |
|---|---|---|
| 1 falta | -1.0 punto | -1.0 punto |
| 1 atraso | -0.33 puntos | -0.33 puntos |
| 3 atrasos | = 1 falta efectiva | = 1 falta efectiva |
| Advertencia formal | 3 faltas efectivas | 6 faltas efectivas |
| Pierde el curso | 4 faltas efectivas | 7 faltas efectivas |

### Estructura del Google Sheets

| Hoja | Columnas |
|---|---|
| Estudiantes | paralelo, codigo, nombre, email |
| Sesiones | sesion_id, paralelo, fecha, hora_apertura, hora_cierre, estado |
| Registros | sesion_id, email, nombre, hora_registro, lat, lng, distancia_m, tipo, metodo |
| Resumen | paralelo, codigo, nombre, email, total_sesiones, presentes, atrasos, faltas_directas, faltas_efectivas, descuento_pts, estado |
