import bcrypt from "bcryptjs";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import swaggerUi from "swagger-ui-express";
import { z, ZodError } from "zod";
import { authenticate, authorize, signAccessToken, type AuthRequest } from "./auth";
import { config } from "./config";
import { db } from "./db";
import { openApiDocument } from "./openapi";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.APP_ORIGIN, credentials: true }));
app.use(express.json({ limit: "250kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60_000, limit: 20 }));

const asyncRoute =
  (handler: (request: any, response: Response, next: NextFunction) => Promise<unknown>) =>
  (request: Request, response: Response, next: NextFunction) =>
    Promise.resolve(handler(request, response, next)).catch(next);

const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellidos: z.string().trim().min(2).max(120),
  email: z.string().email().max(254).transform((value) => value.toLowerCase()),
  telefono: z.string().trim().min(10).max(20).optional(),
  password: z.string().min(10).max(72),
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

const addressSchema = z.object({
  tipo: z.enum(["envio", "facturacion", "ambas"]).default("envio"),
  alias: z.string().max(50).optional(),
  destinatario: z.string().min(3).max(160),
  telefono: z.string().min(10).max(20),
  calle: z.string().min(2).max(140),
  numeroExterior: z.string().min(1).max(20),
  numeroInterior: z.string().max(20).optional(),
  colonia: z.string().min(2).max(100),
  codigoPostal: z.string().regex(/^\d{5}$/),
  ciudad: z.string().min(2).max(100),
  estado: z.string().min(2).max(100),
  referencias: z.string().max(300).optional(),
});

const orderSchema = z.object({
  addressId: z.number().int().positive(),
  billingAddressId: z.number().int().positive().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(30),
  coupon: z.string().trim().max(40).optional(),
  termsVersion: z.string().min(1).max(30),
  privacyVersion: z.string().min(1).max(30),
  acceptsTerms: z.literal(true),
  acceptsPrivacy: z.literal(true),
});

function requestIp(request: Request) {
  return request.ip ? `INET6_ATON(${db.escape(request.ip)})` : "NULL";
}

async function rolesForUser(id: number, connection = db) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT r.nombre
       FROM usuarios_roles ur
       JOIN roles r ON r.id_rol = ur.id_rol
      WHERE ur.id_usuario = ?`,
    [id],
  );
  return rows.map((row) => String(row.nombre));
}

app.get("/api/health", asyncRoute(async (_request, response) => {
  await db.query("SELECT 1");
  response.json({ status: "ok", database: "connected", time: new Date().toISOString() });
}));

app.post("/api/auth/register", asyncRoute(async (request, response) => {
  const input = registerSchema.parse(request.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO usuarios (email, password_hash, nombre, apellidos, telefono, estado, email_verificado_en)
       VALUES (?, ?, ?, ?, ?, 'activo', NOW())`,
      [input.email, passwordHash, input.nombre, input.apellidos, input.telefono ?? null],
    );
    const [roleRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_rol FROM roles WHERE nombre = 'cliente' LIMIT 1",
    );
    await connection.execute(
      "INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?, ?)",
      [result.insertId, roleRows[0].id_rol],
    );
    await connection.execute("INSERT INTO clientes (id_usuario) VALUES (?)", [result.insertId]);
    await connection.commit();
    const roles = ["cliente"];
    response.status(201).json({
      token: signAccessToken({ id: result.insertId, email: input.email, roles }),
      user: { id: result.insertId, email: input.email, nombre: input.nombre, roles },
    });
  } catch (error: any) {
    await connection.rollback();
    if (error?.code === "ER_DUP_ENTRY") {
      response.status(409).json({ error: "EMAIL_EXISTS", message: "Ese correo ya está registrado." });
      return;
    }
    throw error;
  } finally {
    connection.release();
  }
}));

app.post("/api/auth/login", asyncRoute(async (request, response) => {
  const input = loginSchema.parse(request.body);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id_usuario, email, password_hash, nombre, apellidos, estado
       FROM usuarios WHERE email = ? AND eliminado_en IS NULL LIMIT 1`,
    [input.email],
  );
  const user = rows[0];
  if (!user || user.estado !== "activo" || !(await bcrypt.compare(input.password, user.password_hash))) {
    response.status(401).json({ error: "INVALID_CREDENTIALS", message: "Correo o contraseña incorrectos." });
    return;
  }
  const roles = await rolesForUser(user.id_usuario);
  await db.execute("UPDATE usuarios SET ultimo_acceso_en = NOW(), intentos_fallidos = 0 WHERE id_usuario = ?", [
    user.id_usuario,
  ]);
  response.json({
    token: signAccessToken({ id: user.id_usuario, email: user.email, roles }),
    user: { id: user.id_usuario, email: user.email, nombre: user.nombre, apellidos: user.apellidos, roles },
  });
}));

app.get("/api/products", asyncRoute(async (request, response) => {
  const querySchema = z.object({
    search: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    available: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
    sort: z.enum(["name", "price_asc", "price_desc", "rating"]).default("name"),
  }).parse(request.query);

  const filters = ["p.estado IN ('activo', 'agotado')"];
  const values: unknown[] = [];
  if (querySchema.search) {
    filters.push("MATCH(p.nombre, p.descripcion) AGAINST(? IN NATURAL LANGUAGE MODE)");
    values.push(querySchema.search);
  }
  if (querySchema.category) {
    filters.push("c.slug = ?");
    values.push(querySchema.category);
  }
  if (querySchema.minPrice !== undefined) {
    filters.push("p.precio >= ?");
    values.push(querySchema.minPrice);
  }
  if (querySchema.maxPrice !== undefined) {
    filters.push("p.precio <= ?");
    values.push(querySchema.maxPrice);
  }
  if (querySchema.available === "true") filters.push("v.disponibilidad > 0");

  const order = {
    name: "p.nombre ASC",
    price_asc: "p.precio ASC",
    price_desc: "p.precio DESC",
    rating: "v.calificacion DESC",
  }[querySchema.sort];
  const offset = (querySchema.page - 1) * querySchema.limit;
  const where = filters.join(" AND ");
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) total
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN vw_catalogo_productos v ON v.id_producto = p.id_producto
      WHERE ${where}`,
    values,
  );
  const [products] = await db.query<RowDataPacket[]>(
    `SELECT v.*, p.descripcion, p.garantia_dias,
            (SELECT url FROM imagenes_producto ip WHERE ip.id_producto=p.id_producto
              ORDER BY ip.es_principal DESC, ip.orden LIMIT 1) image
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN vw_catalogo_productos v ON v.id_producto = p.id_producto
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ? OFFSET ?`,
    [...values, querySchema.limit, offset],
  );
  response.json({
    data: products,
    meta: { page: querySchema.page, limit: querySchema.limit, total: countRows[0].total },
  });
}));

app.get("/api/products/:id", asyncRoute(async (request, response) => {
  const id = z.coerce.number().int().positive().parse(request.params.id);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT v.*, p.descripcion, p.garantia_dias, p.peso_kg
       FROM productos p JOIN vw_catalogo_productos v ON v.id_producto=p.id_producto
      WHERE p.id_producto=? LIMIT 1`,
    [id],
  );
  if (!rows[0]) {
    response.status(404).json({ error: "NOT_FOUND", message: "Producto no encontrado." });
    return;
  }
  const [images] = await db.query<RowDataPacket[]>(
    "SELECT url, texto_alternativo, es_principal FROM imagenes_producto WHERE id_producto=? ORDER BY orden",
    [id],
  );
  const [specifications] = await db.query<RowDataPacket[]>(
    "SELECT grupo, nombre, valor FROM especificaciones_tecnicas WHERE id_producto=? ORDER BY grupo, orden",
    [id],
  );
  response.json({ ...rows[0], images, specifications });
}));

app.get("/api/addresses", authenticate, asyncRoute(async (request: AuthRequest, response) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM direcciones WHERE id_usuario=? ORDER BY predeterminada DESC, creado_en DESC",
    [request.auth!.id],
  );
  response.json({ data: rows });
}));

app.post("/api/addresses", authenticate, asyncRoute(async (request: AuthRequest, response) => {
  const input = addressSchema.parse(request.body);
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO direcciones
      (id_usuario, tipo, alias_direccion, destinatario, telefono, calle, numero_exterior,
       numero_interior, colonia, codigo_postal, ciudad, estado, referencias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [request.auth!.id, input.tipo, input.alias ?? null, input.destinatario, input.telefono, input.calle,
      input.numeroExterior, input.numeroInterior ?? null, input.colonia, input.codigoPostal, input.ciudad,
      input.estado, input.referencias ?? null],
  );
  response.status(201).json({ id: result.insertId });
}));

app.post("/api/orders", authenticate, asyncRoute(async (request: AuthRequest, response) => {
  const input = orderSchema.parse(request.body);
  const idempotencyKey = z.string().uuid().parse(request.header("idempotency-key"));
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id_pedido, folio FROM solicitudes_idempotentes WHERE clave=? AND id_usuario=? FOR UPDATE",
      [idempotencyKey, request.auth!.id],
    );
    if (existing[0]?.id_pedido) {
      await connection.commit();
      response.status(200).json({ id: existing[0].id_pedido, folio: existing[0].folio, duplicate: true });
      return;
    }
    if (!existing[0]) {
      await connection.execute(
        "INSERT INTO solicitudes_idempotentes (clave, id_usuario, expira_en) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))",
        [idempotencyKey, request.auth!.id],
      );
    }

    const [clientRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_cliente FROM clientes WHERE id_usuario=? LIMIT 1",
      [request.auth!.id],
    );
    const [addressRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_direccion FROM direcciones WHERE id_direccion=? AND id_usuario=? LIMIT 1",
      [input.addressId, request.auth!.id],
    );
    if (!clientRows[0] || !addressRows[0]) throw new ApiError(400, "INVALID_CUSTOMER_DATA", "La dirección no es válida.");

    let subtotal = 0;
    const snapshots: Array<{ id: number; sku: string; name: string; quantity: number; price: number; tax: number }> = [];
    for (const item of input.items) {
      const [productRows] = await connection.query<RowDataPacket[]>(
        `SELECT p.id_producto, p.sku, p.nombre, p.precio, p.tasa_iva,
                SUM(i.existencia-i.reservado) disponibilidad
           FROM productos p JOIN inventario i ON i.id_producto=p.id_producto
          WHERE p.id_producto=? AND p.estado='activo'
          GROUP BY p.id_producto FOR UPDATE`,
        [item.productId],
      );
      const product = productRows[0];
      if (!product || product.disponibilidad < item.quantity) {
        throw new ApiError(409, "INSUFFICIENT_STOCK", `Inventario insuficiente para el producto ${item.productId}.`);
      }
      subtotal += product.precio * item.quantity;
      snapshots.push({
        id: product.id_producto,
        sku: product.sku,
        name: product.nombre,
        quantity: item.quantity,
        price: product.precio,
        tax: product.tasa_iva,
      });
      await reserveInventory(connection, product.id_producto, item.quantity);
    }

    const shipping = subtotal >= 5000 ? 0 : 199;
    const discount = 0;
    const total = Number((subtotal - discount + shipping).toFixed(2));
    const taxes = Number((subtotal * 16 / 116).toFixed(2));
    const folio = `NG-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [statusRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_estado FROM estados_pedido WHERE clave='pendiente_pago' LIMIT 1",
    );
    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO pedidos
       (folio, id_cliente, id_estado, id_direccion_envio, id_direccion_facturacion,
        subtotal, descuento, envio, impuestos, total, acepto_terminos, version_terminos,
        acepto_privacidad, version_privacidad, ip_compra)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, TRUE, ?, INET6_ATON(?))`,
      [folio, clientRows[0].id_cliente, statusRows[0].id_estado, input.addressId,
        input.billingAddressId ?? input.addressId, subtotal, discount, shipping, taxes, total,
        input.termsVersion, input.privacyVersion, request.ip ?? null],
    );
    for (const item of snapshots) {
      await connection.execute(
        `INSERT INTO detalle_pedido
         (id_pedido, id_producto, sku, nombre_producto, cantidad, precio_unitario,
          descuento_unitario, tasa_iva, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [orderResult.insertId, item.id, item.sku, item.name, item.quantity, item.price,
          item.tax, item.price * item.quantity],
      );
    }
    await connection.execute(
      "UPDATE solicitudes_idempotentes SET id_pedido=?, folio=? WHERE clave=?",
      [orderResult.insertId, folio, idempotencyKey],
    );
    await connection.commit();
    response.status(201).json({ id: orderResult.insertId, folio, subtotal, shipping, taxes, total });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

async function reserveInventory(connection: PoolConnection, productId: number, quantity: number) {
  const [stocks] = await connection.query<RowDataPacket[]>(
    `SELECT id_almacen, existencia, reservado FROM inventario
      WHERE id_producto=? AND existencia-reservado>0 ORDER BY existencia-reservado DESC FOR UPDATE`,
    [productId],
  );
  let remaining = quantity;
  for (const stock of stocks) {
    const allocated = Math.min(remaining, stock.existencia - stock.reservado);
    if (allocated > 0) {
      await connection.execute(
        "UPDATE inventario SET reservado=reservado+? WHERE id_almacen=? AND id_producto=?",
        [allocated, stock.id_almacen, productId],
      );
      await connection.execute(
        `INSERT INTO movimientos_inventario
          (id_almacen,id_producto,tipo,cantidad,motivo) VALUES (?,?,'reserva',?,'Reserva para pedido')`,
        [stock.id_almacen, productId, allocated],
      );
      remaining -= allocated;
    }
    if (remaining === 0) break;
  }
}

app.get("/api/orders", authenticate, asyncRoute(async (request: AuthRequest, response) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.id_pedido, p.folio, p.total, p.creado_en, ep.clave estado, ep.nombre estado_nombre
       FROM pedidos p
       JOIN clientes c ON c.id_cliente=p.id_cliente
       JOIN estados_pedido ep ON ep.id_estado=p.id_estado
      WHERE c.id_usuario=? ORDER BY p.creado_en DESC`,
    [request.auth!.id],
  );
  response.json({ data: rows });
}));

app.get("/api/admin/orders", authenticate, authorize("administrador", "soporte", "almacen"), asyncRoute(async (_request, response) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT p.id_pedido, p.folio, CONCAT(u.nombre,' ',u.apellidos) cliente, p.total,
            ep.clave estado, p.creado_en
       FROM pedidos p
       LEFT JOIN clientes c ON c.id_cliente=p.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario=c.id_usuario
       JOIN estados_pedido ep ON ep.id_estado=p.id_estado
      ORDER BY p.creado_en DESC LIMIT 200`,
  );
  response.json({ data: rows });
}));

app.patch("/api/admin/orders/:id/status", authenticate, authorize("administrador", "soporte", "almacen"), asyncRoute(async (request: AuthRequest, response) => {
  const id = z.coerce.number().int().positive().parse(request.params.id);
  const input = z.object({ status: z.enum(["pagado", "preparando", "enviado", "entregado", "cancelado", "devuelto"]), comment: z.string().max(500).optional() }).parse(request.body);
  await db.query("CALL sp_cambiar_estado_pedido(?, ?, ?, ?)", [id, input.status, input.comment ?? null, request.auth!.id]);
  response.json({ message: "Estado actualizado." });
}));

app.post("/api/returns", authenticate, asyncRoute(async (request: AuthRequest, response) => {
  const input = z.object({
    orderId: z.number().int().positive(),
    detailId: z.number().int().positive().optional(),
    reason: z.enum(["revocacion", "defecto", "danio_origen", "producto_incorrecto", "otro"]),
    description: z.string().min(20).max(1000),
    quantity: z.number().int().positive().default(1),
  }).parse(request.body);
  const [ownership] = await db.query<RowDataPacket[]>(
    `SELECT p.id_pedido FROM pedidos p JOIN clientes c ON c.id_cliente=p.id_cliente
      WHERE p.id_pedido=? AND c.id_usuario=?`,
    [input.orderId, request.auth!.id],
  );
  if (!ownership[0]) throw new ApiError(404, "ORDER_NOT_FOUND", "El pedido no existe.");
  const folio = `DEV-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO devoluciones (folio,id_pedido,id_detalle,motivo,descripcion,cantidad)
     VALUES (?,?,?,?,?,?)`,
    [folio, input.orderId, input.detailId ?? null, input.reason, input.description, input.quantity],
  );
  response.status(201).json({ id: result.insertId, folio, status: "solicitada" });
}));

app.get("/api/admin/reports/summary", authenticate, authorize("administrador"), asyncRoute(async (_request, response) => {
  const [[sales], [stock], [returns]] = await Promise.all([
    db.query<RowDataPacket[]>("SELECT * FROM vw_ventas_mensuales ORDER BY periodo DESC LIMIT 12"),
    db.query<RowDataPacket[]>(
      `SELECT p.sku,p.nombre,SUM(i.existencia-i.reservado) disponible
         FROM productos p JOIN inventario i ON i.id_producto=p.id_producto
        GROUP BY p.id_producto HAVING disponible<=3 ORDER BY disponible`,
    ),
    db.query<RowDataPacket[]>(
      "SELECT estado,COUNT(*) total FROM devoluciones GROUP BY estado",
    ),
  ]);
  response.json({ sales, lowStock: stock, returns });
}));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use((_request, response) => {
  response.status(404).json({ error: "NOT_FOUND", message: "Ruta no encontrada." });
});

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    response.status(422).json({ error: "VALIDATION_ERROR", message: "Revisa los datos enviados.", fields: error.flatten() });
    return;
  }
  if (error instanceof ApiError) {
    response.status(error.status).json({ error: error.code, message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({
    error: "INTERNAL_ERROR",
    message: config.NODE_ENV === "production" ? "Ocurrió un error inesperado." : String(error),
  });
});
