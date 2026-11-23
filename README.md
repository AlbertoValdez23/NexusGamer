# NexusGamer

Tienda virtual académica de electrónicos gamer para México.

## Arquitectura

- React 18, TypeScript, Vite y Tailwind CSS.
- API REST con Node.js, Express y TypeScript.
- MySQL 8.
- Autenticación JWT y autorización por roles.
- OpenAPI disponible en `/api/docs`.

Se eligió Node.js para la API porque el entorno de desarrollo disponible sí incluye Node, mientras que PHP y Composer no están instalados. El modelo MySQL se conserva.

## Requisitos

- Node.js 20 o superior.
- pnpm 10 o superior.
- MySQL 8.

## Instalación

```bash
pnpm install
cp .env.example .env
```

1. Crear un usuario MySQL de mínimo privilegio.
2. Ajustar las variables `DB_*` en `.env`.
3. Ejecutar `database/nexusgamer_mysql8.sql` en MySQL Workbench.
4. Sustituir el hash del administrador de demostración o registrar una cuenta desde la API.

## Ejecución

### Demostración inmediata, sin configuración

```bash
pnpm dev
```

Abrir `http://localhost:5173`. Este modo guarda productos, carrito, pedidos, inventario y devoluciones en el navegador, por lo que permite demostrar el flujo completo aun cuando MySQL no esté disponible.

Para comprobar el paquete de producción:

```bash
pnpm build
pnpm preview
```

Acceso:

- Cliente: crear una cuenta desde **Ingresar → Crear una cuenta nueva**. La cuenta y su actividad se guardan en Supabase.
- Administrador académico local: `admin@nexusgamer.mx`, con cualquier contraseña de al menos 8 caracteres.

Para proteger la privacidad durante la evaluación deben utilizarse nombres, correos y direcciones ficticias.

Desde el enlace **Restablecer demo** se eliminan los datos locales y se recupera el estado inicial.

### API y MySQL

Terminal para la API:

```bash
pnpm api:dev
```

Terminal para el frontend:

```bash
pnpm exec vite
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/api/docs`

## Controles implementados en la API

- Contraseñas con bcrypt, costo 12.
- JWT firmado y con vencimiento.
- Helmet, CORS y rate limiting.
- Validación Zod.
- Consultas parametrizadas.
- Autorización por roles.
- Reserva transaccional de inventario con bloqueo `FOR UPDATE`.
- Clave de idempotencia al crear pedidos.
- Cálculo de precios en servidor.
- No se reciben ni guardan PAN o CVV.
- Detalle histórico de nombre, SKU, precio e IVA.
- Bitácora de estados mediante triggers.

## Variables

Nunca se debe subir el archivo `.env`. El archivo `.env.example` solo contiene nombres y valores de ejemplo.

## Publicación externa

Figma Make no permite publicar este archivo mientras mantiene conectada la integración de Supabase. La demo se publica en Netlify y se conecta directamente a Supabase con políticas RLS.

1. En Supabase abrir **SQL Editor → New query**.
2. Ejecutar `docs/Supabase_Setup.sql`.
3. En **Authentication → Providers → Email** decidir si la evaluación requiere confirmación por correo. Para una demostración rápida puede desactivarse temporalmente **Confirm email**.
4. Subir el repositorio a GitHub e importarlo desde Netlify, o compilar y arrastrar la carpeta `dist` a Netlify Drop.
5. Registrar una cuenta ficticia, cerrar sesión y volver a entrar para comprobar persistencia.

`netlify.toml` contiene el comando de compilación, la carpeta de publicación y la redirección necesaria para React Router.

## Base de datos

El script académico recrea el esquema completo y carga 15 productos. Contiene `DROP DATABASE IF EXISTS nexusgamer`; retirar esa línea en un entorno con información real.

## Limitaciones de la demostración

El modo inmediato es una demostración interactiva local y no debe usarse con datos reales. Para comprobar persistencia de servidor, concurrencia, respaldos y recuperación se necesita una instancia MySQL 8 accesible. Las credenciales, respaldos y cuentas reales no se incluyen en el repositorio.
