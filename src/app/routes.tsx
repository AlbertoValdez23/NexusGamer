import { FormEvent, useMemo, useState } from "react";
import { createBrowserRouter, Link, NavLink, Navigate, Outlet, useNavigate, useParams } from "react-router";
import {
  Activity, ArrowRight, Box, Check, ChevronRight, CircleUserRound, ClipboardList, Cpu, Gauge,
  Heart, LayoutDashboard, LockKeyhole, LogOut, Menu, Minus, PackageCheck, Plus, RotateCcw,
  Search, ShieldCheck, ShoppingBag, ShoppingCart, Star, Truck, WalletCards, X,
} from "lucide-react";
import { DemoStoreProvider, money, useDemoStore, type DemoOrder } from "./demo-store";
import { Footer } from "./components/Footer";

const input = "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40";
const panel = "rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10";

function Shell() {
  const { user, cart, logout, resetDemo } = useDemoStore();
  const [mobile, setMobile] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const links = [["/", "Catálogo"], ["/seguimiento", "Seguimiento"], ["/ayuda", "Ayuda"]];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3 font-black tracking-tight"><span className="rounded-lg bg-cyan-400 p-2 text-slate-950"><Cpu size={20}/></span>NEXUS<span className="text-cyan-400">GAMER</span><small className="text-[10px] text-slate-500">MX</small></Link>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "text-cyan-300" : "text-sm text-slate-300 hover:text-white"}>{label}</NavLink>)}
            {user?.role === "administrador" && <NavLink to="/admin" className="text-sm text-violet-300">Administración</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/carrito" aria-label={`Carrito con ${count} productos`} className="relative rounded-lg p-2 hover:bg-white/10"><ShoppingCart/><span className="absolute -right-1 -top-1 rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-slate-950">{count}</span></Link>
            {user ? <><Link to="/cuenta" className="hidden rounded-lg p-2 hover:bg-white/10 sm:block" aria-label="Mi cuenta"><CircleUserRound/></Link><button onClick={logout} className="hidden rounded-lg p-2 hover:bg-white/10 sm:block" aria-label="Cerrar sesión"><LogOut/></button></> : <Link to="/acceso" className="hidden text-sm font-semibold text-cyan-300 sm:block">Ingresar</Link>}
            <button onClick={() => setMobile(!mobile)} className="rounded-lg p-2 md:hidden" aria-label="Abrir menú">{mobile ? <X/> : <Menu/>}</button>
          </div>
        </div>
        {mobile && <nav className="grid gap-1 border-t border-white/10 p-4 md:hidden">{links.map(([to,label])=><Link onClick={()=>setMobile(false)} className="rounded-lg p-3 hover:bg-white/5" to={to} key={to}>{label}</Link>)}<Link className="rounded-lg p-3" to={user ? "/cuenta" : "/acceso"}>{user ? "Mi cuenta" : "Ingresar"}</Link></nav>}
      </header>
      <main><Outlet/></main>
      <div className="border-t border-white/10 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
        Demostración académica interactiva · Datos guardados en este navegador · <button onClick={resetDemo} className="text-cyan-400 underline">Restablecer demo</button>
      </div>
      <Footer/>
    </div>
  );
}

function Catalog() {
  const { products, addToCart } = useDemoStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...new Set(products.map((p) => p.category))];
  const filtered = useMemo(() => products.filter((p) => (category === "Todas" || p.category === category) && `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase())), [products, search, category]);
  return <>
    <section className="relative overflow-hidden border-b border-white/10 px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,.16),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(139,92,246,.14),transparent_30%)]"/>
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-5 font-mono text-xs uppercase tracking-[.28em] text-cyan-300">Hardware verificado · México</p>
        <h1 className="max-w-4xl text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">TU SIGUIENTE VICTORIA<br/><span className="text-cyan-400">EMPIEZA AQUÍ.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">15 productos con existencia visible, precios en MXN con IVA incluido y garantía mínima de 90 días.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#catalogo" className={primary}>Explorar catálogo <ArrowRight size={18}/></a><Link to="/ayuda" className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/5">Políticas de compra</Link></div>
      </div>
    </section>
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="font-mono text-xs text-cyan-300">CATÁLOGO / {filtered.length} RESULTADOS</p><h2 className="mt-2 text-3xl font-black">Equipo listo para competir</h2></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-500" size={18}/><span className="sr-only">Buscar</span><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nombre o SKU" className={`${input} pl-10 sm:w-72`}/></label>
          <select aria-label="Categoría" value={category} onChange={(e)=>setCategory(e.target.value)} className={input}>{categories.map((item)=><option key={item}>{item}</option>)}</select>
        </div>
      </div>
      <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => <article key={product.id} className="group bg-slate-950 p-5">
          <Link to={`/producto/${product.id}`} className="block overflow-hidden rounded-xl bg-slate-900"><img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"/></Link>
          <div className="mt-5 flex items-center justify-between text-xs"><span className="font-mono text-cyan-300">{product.sku}</span><span className={product.stock > 5 ? "text-emerald-400" : "text-amber-300"}>{product.stock} disponibles</span></div>
          <Link to={`/producto/${product.id}`}><h3 className="mt-3 text-xl font-bold group-hover:text-cyan-300">{product.name}</h3></Link>
          <div className="mt-2 flex items-center gap-1 text-sm text-amber-300"><Star size={14} fill="currentColor"/>{product.rating.toFixed(1)}</div>
          <div className="mt-5 flex items-end justify-between"><div><strong className="text-2xl">{money(product.price)}</strong><p className="text-xs text-slate-500">MXN · IVA incluido</p></div><button onClick={()=>addToCart(product.id)} disabled={!product.stock} aria-label={`Agregar ${product.name}`} className="rounded-xl bg-white p-3 text-slate-950 transition hover:bg-cyan-300 disabled:opacity-30"><Plus/></button></div>
        </article>)}
      </div>
    </section>
  </>;
}

function ProductDetail() {
  const { id } = useParams(); const { products, addToCart } = useDemoStore(); const product = products.find((p)=>p.id===Number(id));
  if (!product) return <Message title="Producto no encontrado" link="/"/>;
  return <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-2">
    <div className="overflow-hidden rounded-3xl bg-slate-900"><img src={product.image} alt={product.name} className="aspect-square w-full object-cover"/></div>
    <div className="flex flex-col justify-center"><p className="font-mono text-sm text-cyan-300">{product.sku} · {product.category}</p><h1 className="mt-4 text-4xl font-black sm:text-6xl">{product.name}</h1><p className="mt-6 text-lg leading-8 text-slate-300">{product.description}</p>
      <div className="my-8 grid grid-cols-3 border-y border-white/10 py-5 text-sm"><div><b className="block text-white">Existencia</b>{product.stock} unidades</div><div><b className="block text-white">Peso</b>{product.weight}</div><div><b className="block text-white">Garantía</b>90 días</div></div>
      <strong className="text-4xl">{money(product.price)}</strong><p className="mt-1 text-sm text-slate-400">MXN, IVA incluido. Envío calculado antes del pago.</p>
      <button onClick={()=>addToCart(product.id)} className={`${primary} mt-7 w-full sm:w-auto`}><ShoppingBag size={19}/>Agregar al carrito</button>
    </div>
  </div>;
}

function Cart() {
  const { cart, products, updateCart, user } = useDemoStore(); const navigate=useNavigate();
  const lines=cart.map((line)=>({...line, product:products.find((p)=>p.id===line.productId)!}));
  const subtotal=lines.reduce((s,l)=>s+l.product.price*l.quantity,0); const shipping=subtotal>=5000?0:199;
  if (!lines.length) return <Message title="Tu carrito está vacío" body="Explora el catálogo y agrega el equipo para tu siguiente partida." link="/"/>;
  return <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_360px]"><section><h1 className="text-4xl font-black">Tu carrito</h1><div className="mt-7 divide-y divide-white/10">{lines.map(({product,quantity})=><div key={product.id} className="flex gap-4 py-5"><img src={product.image} alt="" className="h-24 w-24 rounded-xl object-cover"/><div className="flex-1"><p className="font-mono text-xs text-cyan-300">{product.sku}</p><h2 className="font-bold">{product.name}</h2><p>{money(product.price)}</p></div><div className="flex items-center gap-2"><button aria-label="Restar" onClick={()=>updateCart(product.id,quantity-1)} className="p-2"><Minus size={16}/></button><span>{quantity}</span><button aria-label="Sumar" onClick={()=>updateCart(product.id,quantity+1)} disabled={quantity>=product.stock} className="p-2 disabled:opacity-30"><Plus size={16}/></button></div></div>)}</div></section>
    <aside className={`${panel} h-fit p-6`}><h2 className="text-xl font-bold">Resumen</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div className="flex justify-between"><dt>Envío estimado</dt><dd>{shipping?money(shipping):"Gratis"}</dd></div><div className="flex justify-between text-slate-400"><dt>IVA</dt><dd>Incluido</dd></div><div className="flex justify-between border-t border-white/10 pt-4 text-xl font-bold"><dt>Total</dt><dd>{money(subtotal+shipping)}</dd></div></dl><button onClick={()=>navigate(user?"/checkout":"/acceso?next=checkout")} className={`${primary} mt-6 w-full`}>Continuar al checkout</button></aside>
  </div>;
}

function Access() {
  const { login, register }=useDemoStore(); const navigate=useNavigate(); const [mode,setMode]=useState<"login"|"register">("login"); const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setBusy(true);const data=new FormData(e.currentTarget);const email=String(data.get("email"));const password=String(data.get("password"));try{if(mode==="login"){if(!(await login(email,password))){setError("Correo o contraseña incorrectos.");return;}}else await register(String(data.get("name")),email,password);navigate(email==="admin@nexusgamer.mx"?"/admin":"/carrito");}catch(error){setError(error instanceof Error?error.message:"No fue posible completar el registro.");}finally{setBusy(false);}}
  return <div className="mx-auto max-w-md px-4 py-16"><div className={`${panel} p-7`}><LockKeyhole className="text-cyan-300"/><h1 className="mt-4 text-3xl font-black">{mode==="login"?"Iniciar sesión":"Crear cuenta"}</h1><p className="mt-2 text-sm text-slate-400">{mode==="login"?"Ingresa con una cuenta registrada. Administrador académico: admin@nexusgamer.mx.":"Tu cuenta y actividad se guardarán en la nube. Para la evaluación usa datos ficticios."}</p><form onSubmit={submit} className="mt-7 space-y-4">{mode==="register"&&<label className="block text-sm">Nombre<input name="name" required minLength={2} className={`${input} mt-2`}/></label>}<label className="block text-sm">Correo<input name="email" type="email" required defaultValue={mode==="login"?"":""} className={`${input} mt-2`}/></label><label className="block text-sm">Contraseña<input name="password" type="password" minLength={8} required defaultValue={mode==="login"?"":"Demo2025!"} className={`${input} mt-2`}/></label>{error&&<p role="alert" className="text-red-300">{error}</p>}<button disabled={busy} className={`${primary} w-full`}>{busy?"Conectando…":mode==="login"?"Ingresar":"Registrarme y guardar"}</button></form><button onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}} className="mt-5 w-full text-sm text-cyan-300">{mode==="login"?"Crear una cuenta nueva":"Ya tengo una cuenta"}</button></div></div>;
}

function Checkout() {
  const { user, cart, products, createOrder, payOrder }=useDemoStore(); const navigate=useNavigate(); const [consent,setConsent]=useState(false); const [processing,setProcessing]=useState(false);
  if(!user)return <Navigate to="/acceso"/>; if(!cart.length)return <Navigate to="/carrito"/>;
  const subtotal=cart.reduce((sum,line)=>sum+(products.find(p=>p.id===line.productId)?.price||0)*line.quantity,0);
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!consent)return;setProcessing(true);const data=new FormData(e.currentTarget);const order=createOrder(`${data.get("street")}, ${data.get("city")}, C.P. ${data.get("zip")}`);setTimeout(()=>{payOrder(order.id,true);navigate(`/confirmacion/${order.id}`)},700);}
  return <div className="mx-auto max-w-3xl px-4 py-14"><p className="font-mono text-xs text-cyan-300">CHECKOUT SEGURO / PASO FINAL</p><h1 className="mt-2 text-4xl font-black">Entrega y confirmación</h1><form onSubmit={submit} className="mt-8 grid gap-5"><div className={`${panel} grid gap-4 p-6 sm:grid-cols-2`}><label>Nombre<input required defaultValue={user.name} className={`${input} mt-2`}/></label><label>Correo<input required type="email" defaultValue={user.email} className={`${input} mt-2`}/></label><label className="sm:col-span-2">Calle y número<input required name="street" className={`${input} mt-2`}/></label><label>Ciudad<input required name="city" defaultValue="Nuevo Laredo, Tamaulipas" className={`${input} mt-2`}/></label><label>Código postal<input required name="zip" pattern="\d{5}" defaultValue="88000" className={`${input} mt-2`}/></label></div>
    <div className={`${panel} p-6`}><h2 className="font-bold">Pago académico seguro</h2><p className="mt-2 text-sm text-slate-400">Simulación aprobada. No se solicitan ni almacenan datos de tarjeta.</p><div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><WalletCards className="text-cyan-300"/>Pasarela sandbox NexusPay</div></div>
    <label className="flex items-start gap-3 rounded-xl border border-white/10 p-4 text-sm"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} className="mt-1"/>Acepto expresamente los Términos versión 2025-01-15 y el Aviso de Privacidad. Total: {money(subtotal+(subtotal>=5000?0:199))} MXN con IVA incluido.</label>
    <button disabled={!consent||processing} className={primary}>{processing?"Procesando sin doble envío…":"Confirmar pedido de prueba"}</button></form></div>;
}

function Confirmation(){const {id}=useParams();const {orders}=useDemoStore();const order=orders.find(o=>o.id===Number(id));if(!order)return <Message title="Pedido no encontrado" link="/cuenta"/>;return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-400 text-slate-950"><Check size={40}/></div><p className="mt-7 font-mono text-cyan-300">{order.folio}</p><h1 className="mt-3 text-5xl font-black">Pedido confirmado</h1><p className="mt-5 text-slate-300">Pago de prueba aprobado. El inventario fue actualizado y el pedido ya aparece en administración.</p><div className="mt-8 flex justify-center gap-3"><Link to="/cuenta" className={primary}>Ver mis pedidos</Link><Link to="/" className="rounded-xl border border-white/20 px-5 py-3">Volver al catálogo</Link></div></div>}

function Account(){const {user,orders,requestReturn}=useDemoStore();const [reason,setReason]=useState("");if(!user)return <Navigate to="/acceso"/>;const own=user.role==="administrador"?orders:orders.filter(o=>o.email===user.email);return <div className="mx-auto max-w-6xl px-4 py-14"><h1 className="text-4xl font-black">Hola, {user.name}</h1><p className="mt-2 text-slate-400">Historial, seguimiento y devoluciones.</p><div className="mt-8 grid gap-4">{own.length?own.map(o=><div className={`${panel} p-5`} key={o.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs text-cyan-300">{o.folio}</p><h2 className="mt-1 text-xl font-bold">{money(o.total)}</h2></div><Status value={o.status}/></div><p className="mt-4 text-sm text-slate-400">{o.address}{o.tracking&&` · Guía ${o.tracking}`}</p><div className="mt-4 flex gap-2"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Motivo de devolución" className={`${input} max-w-sm`}/><button disabled={!reason||o.status!=="entregado"} onClick={()=>{requestReturn(o.id,reason);setReason("")}} className="rounded-xl border border-white/20 px-4 disabled:opacity-30">Solicitar devolución</button></div></div>):<p className={`${panel} p-8`}>Aún no tienes pedidos. Completa una compra de prueba.</p>}</div></div>}

function Tracking(){const {orders}=useDemoStore();const [folio,setFolio]=useState("");const order=orders.find(o=>o.folio.toLowerCase()===folio.toLowerCase());return <div className="mx-auto max-w-2xl px-4 py-16"><Truck className="text-cyan-300"/><h1 className="mt-4 text-4xl font-black">Rastrea tu pedido</h1><div className="mt-7 flex gap-2"><input value={folio} onChange={e=>setFolio(e.target.value)} placeholder="NG-2025-0001" className={input}/><button className={primary}>Buscar</button></div>{folio&&<div className={`${panel} mt-6 p-6`}>{order?<><Status value={order.status}/><h2 className="mt-4 text-xl font-bold">{order.folio}</h2><p className="mt-2 text-slate-400">{order.tracking?`Guía: ${order.tracking}`:"La guía se publicará cuando el pedido sea enviado."}</p></>:<p>No encontramos ese folio en esta demostración.</p>}</div>}</div>}

function Admin(){const {user,orders,products,returns,setOrderStatus,adjustStock}=useDemoStore();if(user?.role!=="administrador")return <Navigate to="/acceso"/>;const revenue=orders.filter(o=>o.status!=="cancelado").reduce((s,o)=>s+o.total,0);return <div className="mx-auto max-w-7xl px-4 py-12"><div className="flex items-center gap-3"><LayoutDashboard className="text-violet-300"/><div><p className="font-mono text-xs text-violet-300">OPERACIÓN / TIEMPO REAL</p><h1 className="text-4xl font-black">Panel administrativo</h1></div></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric icon={WalletCards} label="Venta demostrada" value={money(revenue)}/><Metric icon={ClipboardList} label="Pedidos" value={String(orders.length)}/><Metric icon={RotateCcw} label="Devoluciones" value={String(returns.length)}/></div>
  <section className="mt-10"><h2 className="text-2xl font-bold">Pedidos</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">Folio</th><th>Cliente</th><th>Total</th><th>Estado autorizado</th></tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-t border-white/10"><td className="p-3 font-mono text-cyan-300">{o.folio}</td><td>{o.customer}</td><td>{money(o.total)}</td><td><select value={o.status} onChange={e=>setOrderStatus(o.id,e.target.value as DemoOrder["status"])} className="rounded-lg border border-white/10 bg-slate-900 p-2">{["pendiente_pago","pagado","preparando","enviado","entregado","cancelado"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div></section>
  <section className="mt-10"><h2 className="text-2xl font-bold">Inventario</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{products.map(p=><div key={p.id} className={`${panel} flex items-center justify-between p-4`}><div><p className="font-mono text-xs text-cyan-300">{p.sku}</p><p className="truncate font-semibold">{p.name}</p><p className={p.stock<=3?"text-red-300":"text-slate-400"}>{p.stock} unidades</p></div><div><button aria-label="Restar existencia" onClick={()=>adjustStock(p.id,-1)} className="p-2"><Minus size={16}/></button><button aria-label="Agregar existencia" onClick={()=>adjustStock(p.id,1)} className="p-2"><Plus size={16}/></button></div></div>)}</div></section></div>}

function Help(){return <div className="mx-auto max-w-4xl px-4 py-14"><ShieldCheck className="text-cyan-300"/><h1 className="mt-4 text-4xl font-black">Ayuda, compra y protección</h1><div className="mt-8 grid gap-4">{[["Precios transparentes","Todos los precios se muestran en MXN con IVA incluido. El envío se informa antes de confirmar."],["Envíos","Cobertura nacional sujeta a código postal. Entrega estimada de 2 a 7 días hábiles y guía al despachar."],["Cancelación","Solicítala antes del envío desde soporte. Si ya fue enviado, se evalúa como devolución."],["Devoluciones y garantía","Puedes iniciar una solicitud con folio. Defectos de origen conservan sus derechos legales y garantía mínima informada de 90 días."],["Privacidad y ARCO","Usamos solo datos necesarios para compra, entrega y soporte. Escribe a privacidad@nexusgamer.mx para ejercer derechos ARCO."],["Contacto","soporte@nexusgamer.mx · 800 123 9637 · Lun–Vie 09:00–18:00 CST. No solicitamos contraseñas ni datos completos de tarjeta."]].map(([title,body])=><section className={`${panel} p-6`} key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 leading-7 text-slate-300">{body}</p></section>)}</div></div>}

function Metric({icon:Icon,label,value}:{icon:any;label:string;value:string}){return <div className={`${panel} p-5`}><Icon className="text-cyan-300"/><p className="mt-5 text-sm text-slate-400">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>}
function Status({value}:{value:string}){return <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">{value.replaceAll("_"," ")}</span>}
function Message({title,body,link}:{title:string;body?:string;link:string}){return <div className="mx-auto max-w-xl px-4 py-24 text-center"><Box className="mx-auto text-cyan-300" size={48}/><h1 className="mt-5 text-4xl font-black">{title}</h1>{body&&<p className="mt-3 text-slate-400">{body}</p>}<Link to={link} className={`${primary} mt-7`}>Continuar <ChevronRight size={18}/></Link></div>}

function Root(){return <DemoStoreProvider><Shell/></DemoStoreProvider>}
export const router=createBrowserRouter([{path:"/",Component:Root,children:[
  {index:true,Component:Catalog},{path:"producto/:id",Component:ProductDetail},{path:"carrito",Component:Cart},
  {path:"acceso",Component:Access},{path:"checkout",Component:Checkout},{path:"confirmacion/:id",Component:Confirmation},
  {path:"cuenta",Component:Account},{path:"seguimiento",Component:Tracking},{path:"admin",Component:Admin},
  {path:"ayuda",Component:Help},{path:"*",element:<Message title="Página no encontrada" link="/"/>},
]}]);
