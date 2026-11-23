import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { loadCloudState, saveCloudState, supabase } from "./supabase";

export type Role = "cliente" | "administrador";
export type User = { id: number | string; name: string; email: string; role: Role } | null;
export type DemoProduct = {
  id: number; sku: string; name: string; category: string; price: number; regularPrice?: number;
  image: string; description: string; stock: number; rating: number; featured?: boolean; weight: string;
};
export type CartLine = { productId: number; quantity: number };
export type DemoOrder = {
  id: number; folio: string; customer: string; email: string; total: number; shipping: number;
  status: "pendiente_pago" | "pagado" | "preparando" | "enviado" | "entregado" | "cancelado";
  createdAt: string; address: string; items: CartLine[]; tracking?: string;
};
export type ReturnRequest = { id: number; folio: string; orderId: number; reason: string; status: string; createdAt: string };

const images = [
  "photo-1626218174358-7769486c4b79", "photo-1610041321327-b794c052db27",
  "photo-1610465299993-e6675c9f9efa", "photo-1614179924047-e1ab49a0a0cf",
  "photo-1538481199705-c710c4e965fc", "photo-1615663245857-ac93bb7c39e7",
  "photo-1770194993269-2521ad916c23", "photo-1636487658609-28282bb5a3a0",
  "photo-1560419015-7c427e8ae5ba", "photo-1527814050087-3793815479db",
  "photo-1527443224154-c4a3942d3acf", "photo-1590602847861-f357a9332bbc",
  "photo-1616088886430-ccd86fef0713", "photo-1623949556303-b0d17d198863",
  "photo-1593640408182-31c70c8268f5",
];

const productRows = [
  ["NG-PC-4080", "PC Gamer Ultimate RTX 4080 RGB", "Computadoras", 38500, 44999],
  ["HX-CLOUD3-W", "HyperX Cloud III Wireless", "Audífonos", 2799, 0],
  ["AS-G16-4070", "Laptop ASUS ROG Strix G16", "Laptops", 29999, 34999],
  ["NG-MON-27Q", "Monitor Gaming Curvo 27 QHD 240Hz", "Monitores", 9499, 0],
  ["RZ-BWV4-TKL", "Razer BlackWidow V4 RGB", "Periféricos", 3799, 4499],
  ["LG-GPX-SL2", "Logitech G Pro X Superlight 2", "Periféricos", 2199, 0],
  ["DX-FPRO-RGB", "Silla DXRacer Formula Pro RGB", "Sillas", 8499, 9999],
  ["NG-SETUP-KIT", "Kit de escritorio RGB", "Accesorios", 2499, 0],
  ["AS-A50-G5", "Astro A50 Gen 5", "Audífonos", 5299, 0],
  ["RZ-VPR-V3", "Razer Viper V3 Pro", "Periféricos", 3299, 3699],
  ["AS-XG27AQ", "ASUS ROG Strix 27 QHD", "Monitores", 10999, 12499],
  ["NG-MIC-USB", "Micrófono USB Stream Pro", "Accesorios", 1899, 0],
  ["NG-PAD-XL", "Mousepad Nexus Control XL", "Periféricos", 649, 799],
  ["NG-CAM-2K", "Webcam Creator 2K 60fps", "Accesorios", 2499, 2899],
  ["NG-PC-4060", "PC Gamer Core RTX 4060", "Computadoras", 21999, 23999],
] as const;

export const initialProducts: DemoProduct[] = productRows.map((row, index) => ({
  id: index + 1,
  sku: row[0],
  name: row[1],
  category: row[2],
  price: row[3],
  regularPrice: row[4] || undefined,
  image: `https://images.unsplash.com/${images[index]}?auto=format&fit=crop&w=900&q=80`,
  description: `Equipo gamer seleccionado por NexusGamer México. Incluye garantía mínima de 90 días, soporte en español y envío con seguimiento.`,
  stock: 8 + (index % 5) * 4,
  rating: 4.4 + (index % 5) * 0.1,
  featured: index % 4 === 0,
  weight: `${(0.4 + index * 0.35).toFixed(1)} kg`,
}));

type Store = {
  user: User; products: DemoProduct[]; cart: CartLine[]; orders: DemoOrder[]; returns: ReturnRequest[];
  login: (email: string, password: string) => Promise<boolean>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void;
  addToCart: (id: number) => void; updateCart: (id: number, quantity: number) => void; clearCart: () => void;
  createOrder: (address: string) => DemoOrder; payOrder: (id: number, approved: boolean) => void;
  setOrderStatus: (id: number, status: DemoOrder["status"]) => void; adjustStock: (id: number, amount: number) => void;
  requestReturn: (orderId: number, reason: string) => ReturnRequest; resetDemo: () => void;
};

const Context = createContext<Store | null>(null);
const key = "nexusgamer-interactive-demo-v1";

function load() {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const saved = load();
  const [user, setUser] = useState<User>(saved?.user ?? null);
  const [products, setProducts] = useState<DemoProduct[]>(saved?.products ?? initialProducts);
  const [cart, setCart] = useState<CartLine[]>(saved?.cart ?? []);
  const [orders, setOrders] = useState<DemoOrder[]>(saved?.orders ?? []);
  const [returns, setReturns] = useState<ReturnRequest[]>(saved?.returns ?? []);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      try {
        const remote = await loadCloudState(data.session.user.id);
        if (!active) return;
        if (remote) {
          setProducts(remote.products?.length ? remote.products : initialProducts);
          setCart(remote.cart ?? []);
          setOrders(remote.orders ?? []);
          setReturns(remote.returns ?? []);
        }
        setUser({
          id: data.session.user.id,
          name: data.session.user.user_metadata?.name ?? "Cliente",
          email: data.session.user.email ?? "",
          role: "cliente",
        });
        setCloudReady(true);
      } catch (error) {
        console.error("No se pudo recuperar la sesión remota", error);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ user, products, cart, orders, returns }));
  }, [user, products, cart, orders, returns]);

  useEffect(() => {
    if (!user || user.role === "administrador" || !cloudReady) return;
    const timeout = window.setTimeout(() => {
      saveCloudState(String(user.id), { products, cart, orders, returns })
        .catch((error) => console.error("No se pudo sincronizar con Supabase", error));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [user, products, cart, orders, returns, cloudReady]);

  const value = useMemo<Store>(() => ({
    user, products, cart, orders, returns,
    async login(email, password) {
      if (!password) return false;
      const admin = email.toLowerCase() === "admin@nexusgamer.mx";
      if (admin) {
        setCloudReady(false);
        setUser({ id: 1, name: "Administrador Nexus", email, role: "administrador" });
        return true;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;
      const remote = await loadCloudState(data.user.id);
      if (remote) {
        setProducts(remote.products?.length ? remote.products : initialProducts);
        setCart(remote.cart ?? []);
        setOrders(remote.orders ?? []);
        setReturns(remote.returns ?? []);
      }
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name ?? "Cliente",
        email: data.user.email ?? email,
        role: "cliente",
      });
      setCloudReady(true);
      return true;
    },
    async register(name, email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: "cliente" } },
      });
      if (error || !data.user) throw new Error(error?.message ?? "No se pudo crear la cuenta.");
      if (!data.session) throw new Error("Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.");
      setProducts(initialProducts); setCart([]); setOrders([]); setReturns([]);
      setUser({ id: data.user.id, name, email, role: "cliente" });
      setCloudReady(true);
    },
    logout() { supabase.auth.signOut(); setCloudReady(false); setUser(null); },
    addToCart(id) {
      setCart((current) => {
        const line = current.find((item) => item.productId === id);
        const stock = products.find((product) => product.id === id)?.stock ?? 0;
        if (line) return current.map((item) => item.productId === id ? { ...item, quantity: Math.min(stock, item.quantity + 1) } : item);
        return stock > 0 ? [...current, { productId: id, quantity: 1 }] : current;
      });
    },
    updateCart(id, quantity) {
      const stock = products.find((product) => product.id === id)?.stock ?? 0;
      setCart((current) => quantity <= 0 ? current.filter((item) => item.productId !== id) : current.map((item) => item.productId === id ? { ...item, quantity: Math.min(stock, quantity) } : item));
    },
    clearCart() { setCart([]); },
    createOrder(address) {
      if (!user) throw new Error("AUTH_REQUIRED");
      const subtotal = cart.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0);
      const shipping = subtotal >= 5000 ? 0 : 199;
      const order: DemoOrder = {
        id: Date.now(), folio: `NG-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, "0")}`,
        customer: user.name, email: user.email, total: subtotal + shipping, shipping, status: "pendiente_pago",
        createdAt: new Date().toISOString(), address, items: [...cart],
      };
      setOrders((current) => [order, ...current]);
      return order;
    },
    payOrder(id, approved) {
      if (approved) {
        const order = orders.find((item) => item.id === id);
        if (order) setProducts((current) => current.map((product) => {
          const line = order.items.find((item) => item.productId === product.id);
          return line ? { ...product, stock: Math.max(0, product.stock - line.quantity) } : product;
        }));
        setOrders((current) => current.map((item) => item.id === id ? { ...item, status: "pagado" } : item));
        setCart([]);
      }
    },
    setOrderStatus(id, status) {
      setOrders((current) => current.map((item) => item.id === id ? { ...item, status, tracking: status === "enviado" ? `MX${id}NG` : item.tracking } : item));
    },
    adjustStock(id, amount) { setProducts((current) => current.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item)); },
    requestReturn(orderId, reason) {
      const item = { id: Date.now(), folio: `DEV-${new Date().getFullYear()}-${returns.length + 1}`, orderId, reason, status: "Recibida", createdAt: new Date().toISOString() };
      setReturns((current) => [item, ...current]);
      return item;
    },
    resetDemo() { localStorage.removeItem(key); setUser(null); setProducts(initialProducts); setCart([]); setOrders([]); setReturns([]); },
  }), [user, products, cart, orders, returns]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemoStore() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoStoreProvider missing");
  return context;
}

export const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
