# API REST de Alumnos y Cursos — Express + PostgreSQL

Proyecto educativo de la materia **DAI** (ORT). Una API REST que hace CRUD de alumnos y cursos contra PostgreSQL, construida en **4 versiones incrementales** para que veas cómo se refactoriza código paso a paso: desde un solo archivo con todo adentro, hasta una arquitectura en capas con clases intercambiables de acceso a datos.

---

## 🗂️ Estructura del proyecto

```
src/
├── server-noob.js              ← V1: todo en un archivo, Client por request
├── server-noob-mejorada.js     ← V2: Router + Pool
├── server.js                   ← V3: arquitectura en capas (controller/service/repository)
├── controllers/                ← Reciben el request HTTP, llaman al service, responden
│   ├── alumnos-controller.js
│   └── cursos-controller.js
├── services/                   ← Lógica de negocio (calcular edad, validar curso)
│   ├── alumnos-service.js
│   └── cursos-service.js
├── repositories/               ← Acceso a datos (SQL puro)
│   ├── alumnos-repository.js       ← versión original (boilerplate completo)
│   ├── alumnos-repository-new.js   ← versión refactorizada (usa DbPg)
│   ├── cursos-repository.js        ← versión original
│   ├── cursos-repository-new.js    ← versión refactorizada (usa DbPg)
│   ├── db-pg.js                    ← V4: clase helper para PostgreSQL
│   └── db-mssql.js                 ← V4: clase helper para SQL Server
├── entities/                   ← Clases que representan las tablas
│   ├── alumno.js
│   └── curso.js
├── router/                     ← Routers de la V2 (server-noob-mejorada)
│   ├── alumnos-router-noob.js
│   └── cursos-router-noob.js
├── configs/
│   └── db-config.js            ← Configuración de conexión a PostgreSQL
└── helpers/
    └── log-helper.js           ← Logueo de errores a archivo y/o consola
```

---

## 🚀 Cómo arrancar

### 1. Tener PostgreSQL corriendo

En Windows, el servicio de PostgreSQL tiene que estar iniciado. Si no arranca, abrí **Servicios** (`services.msc`), buscá `postgresql-x64-18` y dale **Start**:

![Servicio de PostgreSQL en Windows](documents/images/services-postgress.jpg)

### 2. Crear la base de datos y cargar datos

Abrí **pgAdmin** o cualquier cliente de PostgreSQL y ejecutá el script:

```
documents/database/script-postgress.sql
```

Este archivo crea las tablas `cursos` y `alumnos`, y las llena con datos de ejemplo (135 alumnos repartidos en 5 cursos).

### 3. Configurar la conexión

Copiá `.env-template` como `.env` y completá con tus datos locales:

```env
DB_HOST       = "localhost"
DB_DATABASE   = "DAI"
DB_USER       = "postgres"
DB_PASSWORD   = "root"
DB_PORT       = 5432
PORT          = 3000
```

### 4. Instalar dependencias y ejecutar

```bash
npm install
```

Según la versión que quieras probar:

| Comando | Qué ejecuta | Versión |
|---------|------------|---------|
| `npm run server-noob` | `server-noob.js` | V1 — todo en un archivo |
| `npm run server-noob-mejorada` | `server-noob-mejorada.js` | V2 — Router + Pool |
| `npm run server` | `server.js` | V3 — capas (controller/service/repository) — **versión final** |

### 5. Probar con Postman

Importá la colección de Postman que está en:

```
documents/postman/DAI - PG - Alumnos-cursos.postman_collection.json
```

Tiene requests para todos los endpoints, incluyendo casos de error (404, 400).

---

## 🌐 Endpoints

Tanto `alumnos` como `cursos` siguen el mismo patrón CRUD:

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/alumnos` | Listar todos los alumnos | 200 |
| GET | `/api/alumnos/:id` | Obtener un alumno por ID | 200 / 404 |
| POST | `/api/alumnos` | Crear un alumno (body JSON) | 201 / 400 |
| PUT | `/api/alumnos/:id` | Modificar un alumno | 200 / 404 |
| DELETE | `/api/alumnos/:id` | Eliminar un alumno | 200 / 404 |
| GET | `/api/alumnos/test-insert` | Ejemplo: crear un alumno desde código | 201 |

Lo mismo para `/api/cursos` (sin el `test-insert`).

---

## 📚 Documentación — Guía de lectura

El proyecto tiene **4 documentos de explicación** que hay que leer **en orden**. Cada uno analiza una versión del código, explica los problemas que tiene y cómo la siguiente versión los resuelve.

### Recorrido recomendado

```
 V1                    V2                       V3                        V4
 server-noob    →    server-noob-mejorada  →   server (capas)    →     db-pg / db-mssql
 ┌──────────┐        ┌──────────────────┐      ┌──────────────┐        ┌──────────────┐
 │ 1 archivo│        │ Router + Pool    │      │ controller   │        │ clase Db     │
 │ Client   │        │ 3 archivos       │      │ service      │        │ intercambiable│
 │ todo     │        │ sin finally      │      │ repository   │        │ PG / MSSQL   │
 │ junto    │        │                  │      │ dotenv       │        │              │
 └──────────┘        └──────────────────┘      └──────────────┘        └──────────────┘
```

| # | Documento | Qué explica | Archivo de código |
|---|-----------|-------------|-------------------|
| 1 | [Server Noob — Análisis de la versión inicial](documents/server-noob-explicacion.md) | Los 8 problemas de meter todo en un solo archivo: Client vs Pool, código repetido, credenciales hardcodeadas, etc. | `src/server-noob.js` |
| 2 | [Server Noob Mejorada — Router + Pool](documents/server-noob-mejorada-explicacion.md) | Cómo separar endpoints con `Router`, reemplazar `Client` por `Pool`, y eliminar el `finally` problemático. | `src/server-noob-mejorada.js` + `src/router/` |
| 3 | [Server con Capas — Controller, Service, Repository](documents/server-capas-explicacion.md) | Arquitectura en 3 capas, variables de entorno con dotenv, lógica de negocio en el service (calcular edad, validar FK). | `src/server.js` + `src/controllers/` + `src/services/` + `src/repositories/` |
| 4 | [DbPg — Clase helper de acceso a datos](documents/db-pg-explicacion.md) | Extraer el boilerplate repetido de los repositories en una clase `Db` intercambiable. Cómo cambiar de PostgreSQL a SQL Server cambiando una sola línea. | `src/repositories/db-pg.js` + `db-mssql.js` + `*-repository-new.js` |

> 💡 Cada documento asume que ya leíste el anterior. Si salteás alguno, no vas a entender *por qué* se hace el cambio.

### Documento extra

| Documento | Qué contiene |
|-----------|-------------|
| [Análisis de errores y mejoras](documents/analisis-mejoras.md) | Lista detallada de bugs encontrados y mejoras didácticas aplicadas al proyecto. |

---

## 🏗️ Arquitectura en capas (V3)

Esta es la versión principal (`npm run server`). Cada capa tiene una sola responsabilidad:

![Diagrama de arquitectura en capas](documents/images/arquitectura.jpg)

```
Postman / Browser
       │
       ▼
    server.js                  → Configura Express, monta controllers
       │
  ┌────┴────┐
  ▼         ▼
Controller  Controller         → Recibe req, llama al service, responde con status code
  │         │
  ▼         ▼
Service     Service            → Lógica de negocio (calcular edad, validar que el curso existe)
  │         │
  ▼         ▼
Repository  Repository         → SQL puro contra PostgreSQL
  │         │
  ▼         ▼
     PostgreSQL
```

**Regla clave**: cada capa solo habla con la de abajo. El controller no sabe de SQL, el repository no sabe de HTTP, y el service no sabe de ninguno de los dos.

---

## 🔄 Las 4 versiones explicadas en breve

### V1 — `server-noob.js` — Todo en un archivo

Un solo archivo de ~215 líneas con los 7 endpoints, conexión `Client` que se abre y cierra en cada request, credenciales hardcodeadas, y código repetido en cada endpoint.

```js
// Cada endpoint repite este patrón:
const client = new Client(config);
try {
    await client.connect();
    const result = await client.query(sql);
    res.json(result.rows);
} catch (error) {
    console.log(error);
} finally {
    await client.end();    // ← puede fallar si connect() falló
}
```

**Problema principal**: no escala. Funciona para 7 endpoints, pero con 20+ es inmantenible.

---

### V2 — `server-noob-mejorada.js` — Router + Pool

Separa los endpoints en archivos con `Router` y reemplaza `Client` por `Pool`:

```js
// server-noob-mejorada.js — 26 líneas, solo setup
app.use("/api/alumnos", AlumnosRouter);
app.use("/api/cursos",  CursosRouter);

// alumnos-router-noob.js — cada endpoint es más simple
const pool = new Pool(config);   // se crea UNA vez

router.get('', async (req, res) => {
    const result = await pool.query(sql);   // sin connect/end/finally
    res.json(result.rows);
});
```

**Lo que se ganó**: archivos separados por recurso, Pool reutilizado, sin `finally`.

---

### V3 — `server.js` — Arquitectura en capas

Separa cada archivo en 3 capas (controller → service → repository) y usa variables de entorno:

```js
// Controller — solo HTTP
router.get('/:id', async (req, res) => {
    const alumno = await currentService.getByIdAsync(req.params.id);
    res.status(StatusCodes.OK).json(alumno);
});

// Service — lógica de negocio
getByIdAsync = async (id) => {
    const alumno = await this.AlumnosRepository.getByIdAsync(id);
    return agregarEdad(alumno);     // calcula la edad al vuelo
}

// Repository — SQL puro
getByIdAsync = async (id) => {
    const sql = `SELECT * FROM alumnos WHERE id=$1`;
    const resultPg = await this.getDBPool().query(sql, [id]);
    return resultPg.rows[0];
}
```

**Lo que se ganó**: si cambiás la base de datos, solo tocás el repository. Si cambiás una regla de negocio, solo tocás el service. Si cambiás la URL, solo tocás el controller.

---

### V4 — `db-pg.js` / `db-mssql.js` — Clase Db intercambiable

Extrae el boilerplate repetido de los repositories (Pool, try/catch, LogHelper, `.rows`) en una clase `Db` con 4 métodos:

```js
// Repository ANTES (96 líneas) — repite try/catch/Pool en cada método
import pkg from 'pg'
import config from './../configs/db-config.js';
import LogHelper from './../helpers/log-helper.js'
// ... getDBPool(), try/catch en cada método ...

// Repository DESPUÉS (33 líneas) — solo SQL
import Db from './db-pg.js';

getAllAsync = async () => {
    return await this.db.queryAll(`SELECT * FROM cursos`);
}
```

Y para cambiar de PostgreSQL a SQL Server, solo cambiás **una línea**:

```js
import Db from './db-pg.js';       // ← hoy: PostgreSQL
// import Db from './db-mssql.js'; // ← mañana: SQL Server
```

---

## 📦 Carpeta `entities/` — Clases de dominio

Las clases `Alumno` y `Curso` representan las entidades de la base de datos. Sirven para crear objetos desde código (no solo desde `req.body`):

```js
import Alumno from './../entities/alumno.js'

// En vez de depender de lo que manda el cliente...
const nuevoAlumno = new Alumno('Willy', 'Wonka', 1, '2005-07-15', true);
const newId = await currentService.createAsync(nuevoAlumno);
```

Podés ver esto funcionando en el endpoint `GET /api/alumnos/test-insert`.

---

## 🗄️ Base de datos

### Tablas

| Tabla | Columnas |
|-------|----------|
| `cursos` | `id` (SERIAL PK), `nombre` |
| `alumnos` | `id` (SERIAL PK), `nombre`, `apellido`, `id_curso` (FK → cursos), `fecha_nacimiento`, `hace_deportes` |

### Scripts

| Archivo | Qué hace |
|---------|----------|
| `documents/database/script-postgress.sql` | Crea las tablas e inserta 5 cursos + 135 alumnos |
| `documents/database/alumnos.json` | Los 135 alumnos en formato JSON (fuente de verdad de los INSERTs) |

---

## 🧪 Postman

La colección para probar la API está en:

```
documents/postman/DAI - PG - Alumnos-cursos.postman_collection.json
```

Incluye requests para todos los endpoints con ejemplos de happy path y casos de error.

---

## 📦 Dependencias

```bash
npm install express         # framework web
npm install cors            # habilitar CORS
npm install pg              # driver PostgreSQL
npm install dotenv          # variables de entorno desde .env
npm install http-status-codes  # constantes legibles (StatusCodes.OK vs 200)
npm install nodemon --save-dev # reinicio automático en desarrollo
```
