# Créditos

Aplicación Angular con Tailwind CSS para gestionar solicitudes de crédito. Se conecta al backend ASP.NET mediante una API REST con autenticación JWT.

## Ejecutar

Iniciar el backend con `dotnet run` en el puerto 5171. En esta carpeta:

```sh
pnpm install --frozen-lockfile
pnpm start -- --host 127.0.0.1 --port 4200
```

Abrir http://127.0.0.1:4200.

## Comandos

```sh
pnpm build
pnpm test
```

## Funciones

- Inicio y cierre de sesión.
- Registro de usuarios.
- Creación y consulta de solicitudes.
- Filtro por estado.
- Aprobación o rechazo con comentario.
- Diseño adaptable a móvil y escritorio.

La URL de la API está en `src/environments/environment.ts`. El proxy de desarrollo está en `proxy.conf.json`.

## Docker

Desde la carpeta principal del proyecto, ejecutar `docker compose up --build -d`. Abrir http://localhost:8080. La configuración y los comandos están en el README principal.
