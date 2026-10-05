# Créditos — Frontend

Aplicación Angular 21 con Tailwind CSS para gestionar solicitudes de crédito. Permite crear una cuenta, iniciar sesión, registrar solicitudes y consultar su estado. Se conecta a una API ASP.NET mediante autenticación JWT.

## Requisitos

- Node.js 22.12 o una versión posterior de Node.js 22; también puedes usar Node.js 24.
- pnpm 11.19.0, que es la versión utilizada en el proyecto.
- El backend configurado y ejecutándose en http://localhost:5171.

Si todavía no tienes pnpm, instálalo con:

```sh
npm install --global pnpm@11.19.0
```

No necesitas instalar Angular CLI globalmente; está incluido en las dependencias.

## Descargar e instalar

```sh
git clone https://github.com/David168247/Bluecore-technicaltest-frontend.git
cd Bluecore-technicaltest-frontend
pnpm install --frozen-lockfile
```

Si ya tienes el código descargado, ejecuta la instalación desde la carpeta donde está `package.json`. La opción `--frozen-lockfile` instala las versiones registradas en `pnpm-lock.yaml`.

## Iniciar el proyecto

### 1. Iniciar el backend

En una terminal, entra en la carpeta del backend, configura su conexión PostgreSQL y su clave JWT siguiendo su [README](https://github.com/David168247/Bluecore-technicaltest-Backend/blob/main/README.md). Después ejecuta:

```sh
dotnet run --launch-profile http
```

La API debe quedar disponible en **http://localhost:5171**. Mantén esa terminal abierta mientras utilizas el frontend.

### 2. Iniciar el frontend

En otra terminal, dentro de la carpeta del frontend, ejecuta:

```sh
pnpm start -- --host 127.0.0.1 --port 4200
```

Abre **http://127.0.0.1:4200** en el navegador. Si no tienes una sesión activa, la aplicación te llevará al login.

Los cambios que guardes en el código se actualizan automáticamente en el navegador. Para detener cualquiera de los servidores, presiona `Ctrl+C` en su terminal.

## Usar la aplicación

1. Crea una cuenta desde el enlace del login o inicia sesión con un usuario existente.
2. Consulta el listado de solicitudes y filtra por pendientes, aprobadas o rechazadas.
3. Selecciona **Nueva solicitud** e ingresa la cédula, el monto y el plazo del crédito.
4. Para revisar una solicitud pendiente, elige **Aprobar** o **Rechazar** y escribe el comentario de la decisión.
5. Usa **Salir** para cerrar la sesión.

El monto permitido es de 500 a 50000 USD y el plazo de 6 a 60 meses. La interfaz se adapta a móvil, tablet y escritorio.

Las rutas disponibles son:

| Ruta | Pantalla |
|---|---|
| `/login` | Inicio de sesión |
| `/registro` | Crear una cuenta |
| `/solicitudes` | Listado y filtro de solicitudes |
| `/solicitudes/nueva` | Registrar un crédito |

Las pantallas de solicitudes requieren iniciar sesión.

## Conexión con la API

`src/environments/environment.ts` define `/api` como la ruta del backend. Durante el desarrollo, `proxy.conf.json` redirige esas peticiones a **http://localhost:5171**.

Si el backend usa otro puerto o dirección, modifica `target` en `proxy.conf.json` y reinicia el frontend. Si aparece un error de conexión, comprueba que la API esté iniciada y que ambas direcciones coincidan.

## Compilar y ejecutar pruebas

Para generar la versión de producción:

```sh
pnpm build
```

Los archivos resultantes quedan en `dist/bluecore/browser`. Este comando compila la aplicación; no inicia un servidor.

Para ejecutar las pruebas:

```sh
pnpm test
```

Las pruebas verifican formularios, sesión, acceso a rutas, peticiones HTTP y filtros del listado.

## Ejecutar con Docker

Para levantar la aplicación completa necesitas la carpeta principal con `frontend`, `backend`, `docker-compose.yml` y su configuración `.env`. El Compose pertenece al proyecto completo y no está incluido en este repositorio independiente del frontend.

Con Docker Desktop y Compose disponibles, ejecuta desde esa carpeta principal:

```sh
docker compose up --build -d
```

Abre **http://localhost:8080**. En este modo Nginx sirve Angular y envía las peticiones de la API al contenedor del backend. No necesitas ejecutar `pnpm start` ni `dotnet run` por separado.

Para consultar los servicios y detenerlos:

```sh
docker compose ps
docker compose down
```
