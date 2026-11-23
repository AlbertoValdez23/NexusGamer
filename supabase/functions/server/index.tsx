import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-77879402/health", (c) => {
  return c.json({ status: "ok" });
});

const admin = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const getUser = async (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) return null;
  const { data, error } = await admin().auth.getUser(authorization.slice(7));
  return error ? null : data.user;
};

app.post("/make-server-77879402/signup", async (c) => {
  try {
    const body = await c.req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (name.length < 2 || !email.includes("@") || password.length < 8) {
      return c.json({ error: "Nombre, correo y contraseña de 8 caracteres son obligatorios." }, 422);
    }
    const { data, error } = await admin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "cliente" },
    });
    if (error) return c.json({ error: error.message }, 400);
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      role: "cliente",
      createdAt: new Date().toISOString(),
    });
    return c.json({ success: true }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "No fue posible crear la cuenta." }, 500);
  }
});

app.get("/make-server-77879402/profile", async (c) => {
  const user = await getUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Sesión no válida." }, 401);
  const profile = await kv.get(`profile:${user.id}`);
  return c.json(profile ?? {
    id: user.id,
    name: user.user_metadata?.name ?? "Cliente",
    email: user.email,
    role: user.user_metadata?.role ?? "cliente",
  });
});

app.get("/make-server-77879402/state", async (c) => {
  const user = await getUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Sesión no válida." }, 401);
  return c.json({ state: await kv.get(`shop-state:${user.id}`) });
});

app.put("/make-server-77879402/state", async (c) => {
  const user = await getUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Sesión no válida." }, 401);
  const body = await c.req.json();
  const state = {
    products: Array.isArray(body.products) ? body.products : [],
    cart: Array.isArray(body.cart) ? body.cart : [],
    orders: Array.isArray(body.orders) ? body.orders : [],
    returns: Array.isArray(body.returns) ? body.returns : [],
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`shop-state:${user.id}`, state);
  return c.json({ success: true, updatedAt: state.updatedAt });
});

app.post("/make-server-77879402/orders", async (c) => {
  const user = await getUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Sesión no válida." }, 401);
  const order = await c.req.json();
  if (!order?.id || !order?.folio) return c.json({ error: "Pedido no válido." }, 422);
  await kv.set(`order:${user.id}:${order.id}`, { ...order, userId: user.id });
  return c.json({ success: true }, 201);
});

Deno.serve(app.fetch);
