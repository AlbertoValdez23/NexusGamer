export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "NexusGamer API",
    version: "1.0.0",
    description: "API REST académica para catálogo, identidad, pedidos, inventario y devoluciones.",
  },
  servers: [{ url: "http://localhost:4000", description: "Desarrollo local" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/api/health": { get: { summary: "Comprueba API y MySQL", responses: { "200": { description: "Disponible" } } } },
    "/api/auth/register": { post: { summary: "Registra un cliente", responses: { "201": { description: "Creado" }, "409": { description: "Correo existente" } } } },
    "/api/auth/login": { post: { summary: "Inicia sesión", responses: { "200": { description: "JWT emitido" }, "401": { description: "Credenciales inválidas" } } } },
    "/api/products": { get: { summary: "Catálogo paginado y filtrable", responses: { "200": { description: "Listado" } } } },
    "/api/products/{id}": { get: { summary: "Detalle de producto", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Detalle" }, "404": { description: "No encontrado" } } } },
    "/api/addresses": {
      get: { summary: "Direcciones del cliente", security: [{ bearerAuth: [] }], responses: { "200": { description: "Listado" } } },
      post: { summary: "Crea una dirección", security: [{ bearerAuth: [] }], responses: { "201": { description: "Creada" } } },
    },
    "/api/orders": {
      get: { summary: "Pedidos propios", security: [{ bearerAuth: [] }], responses: { "200": { description: "Listado" } } },
      post: { summary: "Crea pedido y reserva inventario", security: [{ bearerAuth: [] }], parameters: [{ name: "Idempotency-Key", in: "header", required: true, schema: { type: "string", format: "uuid" } }], responses: { "201": { description: "Pedido creado" }, "409": { description: "Inventario insuficiente" } } },
    },
    "/api/returns": { post: { summary: "Solicita devolución", security: [{ bearerAuth: [] }], responses: { "201": { description: "Solicitud creada" } } } },
    "/api/admin/orders": { get: { summary: "Pedidos para administración", security: [{ bearerAuth: [] }], responses: { "200": { description: "Listado" }, "403": { description: "Sin permiso" } } } },
    "/api/admin/reports/summary": { get: { summary: "Resumen administrativo", security: [{ bearerAuth: [] }], responses: { "200": { description: "Reporte" } } } },
  },
} as const;
