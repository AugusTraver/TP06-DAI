# Análisis del proyecto tp-pg-alumnos — Errores y mejoras didácticas

> Fecha: 2026-05-10
> Objetivo: Revisión completa del código y documentación para mejorar la enseñanza de APIs en capas con Node + PostgreSQL.

---

## 🐛 ERRORES / BUGS en el código

### 1. `db-config.js` exporta la config hardcodeada, no la de `.env`

**Archivo**: `src/configs/db-config.js:36`

```js
export default DBConfig;  // ← exporta la hardcodeada con credenciales en el código
```

`DBConfigBest` (la que lee de `.env`) existe pero nunca se exporta. Las versiones server-04+ que usan `dotenv` importan este archivo pero reciben la config hardcodeada — el `.env` se ignora silenciosamente. El alumno piensa que está usando variables de entorno pero no.

---

### 2. Credenciales reales hardcodeadas en el código

**Archivo**: `src/configs/db-config.js:1-7`

```js
const DBConfig = {
    host        : "aws-0-us-east-2.pooler.supabase.com",
    password    : "SuperMegaClave1234%&#",
    ...
}
```

Y en los comentarios (líneas 22-35) hay más credenciales de Supabase. Esto está en un repo — cualquiera que tenga acceso las ve. Justamente estás enseñando `dotenv` para evitar esto, y el propio archivo de ejemplo rompe la regla.

---

### 3. `CursosRepository` le faltan 3 métodos — crashea en runtime

**Archivo**: `src/repositories/cursos-repository.js`

Solo implementa `getAllAsync` y `getByIdAsync`. Pero `cursos-service.js:22-37` llama a `createAsync`, `updateAsync` y `deleteByIdAsync` que no existen. Si un alumno hace POST/PUT/DELETE a `/api/cursos` le va a tirar `TypeError: this.CursosRepository.createAsync is not a function`.

---

### 4. Variable `respuesta` nunca asignada en DELETE

**Archivo**: `alumnos-controller.js:51-56` y `cursos-controller.js:51-56`

```js
router.delete('/:id', async (req, res) => {
    let respuesta;        // ← declarada, nunca asignada
    // ...
    res.status(StatusCodes.OK).json(respuesta);  // ← devuelve undefined
});
```

---

### 5. Archivos Supabase importados pero inexistentes

**`server-05-supabase-client.js:6-7`** importa:
- `./controllers/alumnos-controller-supabase.js`
- `./controllers/cursos-controller-supabase.js`

**`server-06-supabase-client-clean.js:6`** importa:
- `./repositories/supabaseClient.js`

Ninguno de estos archivos existe en el repo. `npm run server-05` y `npm run server-06` crashean al arrancar.

---

### 6. README tiene extensión equivocada

El README dice:

> Script de PostgreSQL `documents/postman/DAI - 2025 - EXPRESS y PG - ALUMNOS.postman_collection.sql`

El archivo real es `.postman_collection.json`, no `.sql`.

---

### 7. Dos Pools separados en server-03

`alumnos-router.js:9` y `cursos-router.js:9` crean cada uno su propio `new Pool(config)`. Cada router tiene su pool independiente. Funciona, pero derrota el propósito del Pool (compartir conexiones). Los alumnos deberían entender que el Pool se crea una vez y se comparte.

---

## 🎓 MEJORAS DIDÁCTICAS

### 1. El repositorio "traga" los errores — el patrón más peligroso del proyecto

Este es el problema didáctico más importante. En `alumnos-repository.js` todos los métodos hacen esto:

```js
try {
    // query...
} catch (error) {
    LogHelper.logError(error);   // logea
}
return returnArray;              // devuelve null
```

El error se logea y desaparece. Después el controller recibe `null` y no puede distinguir entre:
- "No se encontró el alumno" (404 legítimo)
- "La base de datos se cayó" (500 real)

El controller en `alumnos-controller.js:11-16` incluso lo resuelve mal:

```js
if (returnArray != null) {
    res.status(StatusCodes.OK).json(returnArray);
} else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error interno.`); // ¿Y si simplemente no hay datos?
}
```

**Lo que se debería enseñar**: el repository debe dejar que las excepciones suban (o lanzar excepciones propias). El controller (o un middleware de error) decide qué status devolver. "Loguear y tragarse el error" es un anti-patrón clásico en producción porque los errores se vuelven invisibles.

---

### 2. Los controllers no tienen try/catch — se pierden errores no manejados

En server-04, si el service o repository tiran una excepción que no fue tragada, no hay try/catch en el controller ni middleware global de error. Express devuelve un 500 genérico sin formato. Esto va de la mano con el punto anterior: una vez que dejés de tragar errores en el repository, necesitás manejarlos arriba.

Sería una buena versión intermedia (server-04b): agregar un middleware de error centralizado:

```js
app.use((err, req, res, next) => {
    LogHelper.logError(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
});
```

---

### 3. Los services son 100% pass-through — el alumno no entiende para qué existen

Cada método del service hace exactamente esto:

```js
getAllAsync = async () => {
    const returnArray = await this.AlumnosRepository.getAllAsync();
    return returnArray;
}
```

Sin ningún ejemplo de lógica de negocio real, el alumno va a pensar (con razón) que la capa de service es burocracia innecesaria. Sugerencia: agregar al menos un caso real. Por ejemplo:

- Validar que `id_curso` exista antes de crear un alumno (cruzando con `CursosRepository`)
- No permitir borrar un curso que tenga alumnos asignados
- Calcular la edad a partir de `fecha_nacimiento` antes de devolver

Un solo ejemplo real vale más que la explicación teórica de "acá iría la lógica de negocio".

---

### 4. PUT con ID en el body en vez de en la URL

```
PUT /api/alumnos/     ← sin :id en la URL
body: { "id": 5, "nombre": "..." }
```

La convención REST estándar es `PUT /api/alumnos/:id`. Tener el ID solo en el body es confuso y rompe la simetría con GET/DELETE que sí usan `:id`. Vale la pena al menos señalarlo en clase y explicar por qué la convención existe (el recurso se identifica por la URL, no por el body).

---

### 5. Falta el "por qué" en la progresión de versiones

La progresión server.js → 01 → 02 → 03 → 04 es excelente como idea, pero el README lista los cambios sin enmarcarlos como problemas que se resuelven. Sugerencia para cada salto:

| De → A | Problema que resuelve |
|--------|----------------------|
| 00 → 01 | "Si el `client.end()` falla, ¿qué pasa? Se pierde el error de conexión" |
| 01 → 02 | "Abrir y cerrar una conexión por cada request es lento, ¿cómo reutilizar?" |
| 02 → 03 | "100 endpoints en un solo archivo es inmantenible, ¿cómo separar?" |
| 03 → 04 | "El router sabe de SQL — ¿qué pasa si cambio de base de datos?" |

Si cada versión arranca con el problema concreto, el alumno entiende *por qué* refactorizar, no solo *cómo*.

---

### 6. El `updateAsync` del repository hace un SELECT antes del UPDATE

**Archivo**: `alumnos-repository.js:89-90`

```js
const previousEntity = await this.getByIdAsync(id);
if (previousEntity == null) return 0;
```

Hace una query extra para obtener los valores previos y usarlos como fallback con `??`. Esto es:
- Una race condition (alguien puede modificar entre el SELECT y el UPDATE)
- Performance innecesaria (dos queries en vez de una)
- Confuso conceptualmente: un PUT debería reemplazar el recurso completo

Si querés enseñar "actualización parcial", es mejor introducir PATCH explícitamente. Si es un PUT, el cliente manda todo el objeto completo y no hacen falta defaults.

---

### 7. Naming inconsistente: "controller" vs "router"

- La carpeta `src/router/` tiene archivos que son **routers con lógica de acceso a datos inline** (server-03)
- La carpeta `src/controllers/` tiene archivos que son **routers que delegan al service** (server-04)
- `server-04-layers.js` importa como `AlumnosController` lo que en realidad es un `Router`
- El comentario en server-04 dice `// Routers` pero la variable se llama `Controller`

Para un alumno esto es confuso. Sugerencia: ser consistente. Si los archivos se llaman `*-controller.js`, importalos como `Controller`. O mejor: explicar que en Express el "controller" y el "router" suelen vivir juntos, y que la separación formal es más de frameworks como NestJS.

---

### 8. `server.js` base no usa `dotenv` — el `port` está hardcodeado

Versiones 00 a 03 tienen `const port = 3000;` hardcodeado. Versiones 04+ usan `import 'dotenv/config'` pero aún así hardcodean el puerto:

```js
const port = 3000;  // ← nunca lee process.env.PORT
```

El `.env-template` define `PORT = 3000` pero nadie lo lee. Si estás enseñando variables de entorno, usalo:

```js
const port = process.env.PORT || 3000;
```

---

### 9. Oportunidad perdida: enseñar qué pasa cuando falta el `express.json()`

Todos los servers ya traen `app.use(express.json())` configurado. Un ejercicio didáctico potente: pedirles que lo comenten, hagan un POST, y vean que `req.body` es `undefined`. Después explicar por qué. Es una de las trampas más comunes y la entienden mejor rompiéndola que leyendo la explicación.

---

## 📋 Resumen de prioridades

| Prioridad | Qué | Por qué |
|-----------|-----|---------|
| **Crítica** | Exportar `DBConfigBest` en vez de `DBConfig` | El `.env` no se está usando — todo el ejercicio de dotenv es mentira |
| **Crítica** | Sacar credenciales hardcodeadas de `db-config.js` | Contradice exactamente lo que estás enseñando |
| **Crítica** | Completar `CursosRepository` (create/update/delete) | 3 endpoints crashean |
| **Crítica** | Crear los archivos Supabase faltantes o sacar los imports | server-05 y server-06 no arrancan |
| **Alta** | Dejar de tragar errores en los repositories | El anti-patrón más dañino para un alumno que después va a producción |
| **Alta** | Agregar al menos un ejemplo de lógica real en el service | Sin esto la capa parece burocracia inútil |
| **Media** | Unificar naming controller/router | Reduce confusión |
| **Media** | Usar `process.env.PORT` donde ya se importa dotenv | Coherencia con lo que se enseña |
| **Baja** | Arreglar la variable `respuesta` en DELETE | Bug menor pero visible |
| **Baja** | Corregir extensión en el README | `.sql` → `.json` |
