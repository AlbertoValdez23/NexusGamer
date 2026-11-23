import { FormEvent, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  Cookie,
  Cpu,
  ExternalLink,
  Facebook,
  FileCheck2,
  FileText,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Scale,
  ShieldCheck,
  Twitter,
  Youtube,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

type FormType = 'factura' | 'queja' | 'arco' | null;
type CookiePreference = 'accepted' | 'essential' | null;

const complianceModules = [
  {
    id: 'terminos',
    icon: FileCheck2,
    title: 'Compra, precios y facturación',
    content: (
      <div className="space-y-3">
        <p>
          Todos los precios se expresan en pesos mexicanos (MXN) e incluyen IVA. El costo de envío,
          cuando corresponda, se calcula y muestra antes de confirmar el pago.
        </p>
        <p>
          Aceptamos Mercado Pago, Stripe, PayPal y pagos referenciados en OXXO. Si detectas un cargo
          no autorizado, repórtalo de inmediato a tu banco y a soporte@nexusgamer.mx. Investigaremos
          el caso y atenderemos contracargos conforme a las reglas de la pasarela utilizada.
        </p>
        <p>
          La factura CFDI puede solicitarse durante el mes calendario de la compra con RFC, razón
          social, régimen fiscal, uso de CFDI, código postal fiscal y constancia de situación fiscal.
        </p>
        <p>
          En caso de falta de inventario superveniente o de un error tipográfico evidente en el
          precio, notificaremos la cancelación y realizaremos el reembolso automático al mismo método
          de pago, sin cargos para el cliente.
        </p>
      </div>
    ),
  },
  {
    id: 'devoluciones',
    icon: ShieldCheck,
    title: 'Garantías, devoluciones y excepciones',
    content: (
      <div className="space-y-3">
        <p>
          Conforme al artículo 56 de la LFPC, puedes revocar tu compra dentro de los 5 días hábiles
          posteriores a la entrega, sin penalización. Escríbenos con tu número de pedido para recibir
          instrucciones y conservar el producto, accesorios y empaque en buen estado.
        </p>
        <p>
          No se aceptan devoluciones de productos personalizados, perecederos, cosméticos abiertos,
          ropa interior ni bienes que por su naturaleza legal o sanitaria no puedan retornarse, salvo
          defecto de origen. Estas excepciones no limitan tus derechos sobre productos defectuosos.
        </p>
        <p>
          Los productos cuentan con garantía mínima legal de 90 días, sin perjuicio de una garantía
          de fabricante mayor. Reporta defectos a garantias@nexusgamer.mx con evidencia y número de
          serie. NexusGamer cubrirá las guías de retorno cuando se confirme defecto, daño de origen o
          envío incorrecto.
        </p>
      </div>
    ),
  },
  {
    id: 'promociones',
    icon: BadgeCheck,
    title: 'Promociones, ofertas y concursos',
    content: (
      <div className="space-y-3">
        <p>
          Cada promoción indicará vigencia, unidades disponibles, productos participantes,
          restricciones geográficas y límite por cliente. Los cupones no son acumulables salvo que
          la promoción señale expresamente lo contrario y deben aplicarse antes del pago.
        </p>
        <p>
          Un precio tachado corresponde al precio regular previamente ofrecido por NexusGamer; el
          precio destacado es el vigente durante la oferta. Las bases de concursos se publicarán con
          fechas, mecánica, premios y criterios de selección verificables.
        </p>
      </div>
    ),
  },
  {
    id: 'privacidad',
    icon: LockKeyhole,
    title: 'Privacidad, cookies y derechos ARCO',
    content: (
      <div className="space-y-3">
        <p>
          Nexus Gamer México, S.A. de C.V. trata datos de identidad, contacto, facturación y entrega
          para procesar pedidos, prevenir fraude, emitir CFDI y brindar soporte. Los datos bancarios
          son procesados por pasarelas certificadas y no se almacenan en nuestros servidores.
        </p>
        <p>
          Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición enviando una
          solicitud a privacidad@nexusgamer.mx con tu nombre, identificación, derecho a ejercer y
          descripción clara de los datos. Recibirás acuse y seguimiento conforme a la LFPDPPP.
        </p>
        <p>
          Las cookies esenciales mantienen el carrito y la seguridad. Analítica y publicidad son
          opcionales y solo se activan con consentimiento. Puedes rechazar las no esenciales desde
          el banner sin afectar las funciones básicas.
        </p>
      </div>
    ),
  },
  {
    id: 'seguridad',
    icon: Scale,
    title: 'Propiedad intelectual y seguridad digital',
    content: (
      <div className="space-y-3">
        <p>
          Imágenes, textos, diseños, código, identidad visual y logotipos de NexusGamer están
          protegidos por la legislación mexicana en materia de propiedad intelectual. Las marcas de
          terceros pertenecen a sus respectivos titulares.
        </p>
        <p>
          El sitio utiliza HTTPS/SSL para cifrar datos en tránsito. Los pagos se procesan en
          Mercado Pago, Stripe, PayPal u OXXO; NexusGamer no almacena números completos de tarjeta ni
          códigos de seguridad.
        </p>
        <p>
          Antes de pagar, el cliente debe aceptar expresamente mediante casilla los Términos y
          Condiciones y el Aviso de Privacidad. La aceptación queda vinculada a la orden.
        </p>
      </div>
    ),
  },
];

export function Footer() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [formSent, setFormSent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [cookiePreference, setCookiePreference] = useState<CookiePreference>(null);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem('nexus-cookie-preference');
    if (savedPreference === 'accepted' || savedPreference === 'essential') {
      setCookiePreference(savedPreference);
    }
  }, []);

  const saveCookiePreference = (preference: Exclude<CookiePreference, null>) => {
    window.localStorage.setItem('nexus-cookie-preference', preference);
    setCookiePreference(preference);
  };

  const openForm = (type: Exclude<FormType, null>) => {
    setFormSent(false);
    setActiveForm(type);
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newsletterConsent) setNewsletterSent(true);
  };

  const formCopy = {
    factura: {
      title: 'Solicitar factura CFDI',
      description: 'Enviaremos tu CFDI al correo registrado. Solicítalo dentro del mes de tu compra.',
      label: 'RFC',
      placeholder: 'XAXX010101000',
    },
    queja: {
      title: 'Canal de quejas',
      description: 'Tu folio se asignará de inmediato y responderemos en un máximo de 48 horas.',
      label: 'Número de pedido',
      placeholder: 'NG-2025-0000',
    },
    arco: {
      title: 'Solicitud de derechos ARCO',
      description: 'Indica el derecho que deseas ejercer y te enviaremos acuse de recepción.',
      label: 'Derecho a ejercer',
      placeholder: 'Acceso, rectificación, cancelación u oposición',
    },
  };

  const selectedForm = activeForm ? formCopy[activeForm] : null;

  return (
    <>
      <footer id="contacto" className="relative overflow-hidden border-t border-blue-500/20 bg-slate-950 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <section className="relative border-b border-white/10 bg-gradient-to-r from-blue-600/10 via-slate-950 to-violet-600/10">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">Compra protegida</p>
                <p className="text-xs text-slate-400">5 días hábiles para revocar</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-center">
              <LockKeyhole className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">Pago cifrado SSL</p>
                <p className="text-xs text-slate-400">No almacenamos datos bancarios</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Clock3 className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">Respuesta garantizada</p>
                <p className="text-xs text-slate-400">Quejas atendidas en máximo 48 h</p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.8fr_1.1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 p-2">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">NexusGamer México</span>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-400">
                Nombre comercial: NexusGamer. Operado por Nexus Gamer México, S.A. de C.V.
                <br />
                RFC: NGM250101KX7 <span className="text-slate-500">(dato ficticio para demostración)</span>
              </p>
              <div className="space-y-3 text-sm text-slate-300">
                <a
                  href="https://maps.google.com/?q=Avenida+Reforma+222+Ciudad+de+Mexico"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 transition-colors hover:text-cyan-300"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  Av. Paseo de la Reforma 222, Col. Juárez, Cuauhtémoc, 06600, Ciudad de México, México
                </a>
                <a href="tel:+528001239637" className="flex items-center gap-3 transition-colors hover:text-cyan-300">
                  <Phone className="h-4 w-4 text-blue-400" />
                  800 123 9637 · Lun–Vie 09:00–18:00 CST
                </a>
                <a
                  href="mailto:soporte@nexusgamer.mx"
                  className="flex items-center gap-3 transition-colors hover:text-cyan-300"
                >
                  <Mail className="h-4 w-4 text-blue-400" />
                  soporte@nexusgamer.mx
                </a>
              </div>
              <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-100/80">
                <AlertTriangle className="mr-2 inline h-4 w-4 text-amber-300" />
                Las compras requieren ser mayor de 18 años o contar con autorización de madre, padre
                o tutor legal.
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Gestiones</h3>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => openForm('factura')}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm transition hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <span className="flex items-center gap-3"><ReceiptText className="h-4 w-4 text-blue-400" />Solicitar CFDI</span>
                  <span className="text-slate-500 transition group-hover:translate-x-1">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => openForm('queja')}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm transition hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <span className="flex items-center gap-3"><FileText className="h-4 w-4 text-blue-400" />Levantar una queja</span>
                  <span className="text-slate-500 transition group-hover:translate-x-1">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => openForm('arco')}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm transition hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <span className="flex items-center gap-3"><LockKeyhole className="h-4 w-4 text-blue-400" />Ejercer derechos ARCO</span>
                  <span className="text-slate-500 transition group-hover:translate-x-1">→</span>
                </button>
                <a
                  href="https://concilianet.profeco.gob.mx/"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <span className="flex items-center gap-3"><Scale className="h-4 w-4 text-blue-400" />Concilianet PROFECO</span>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Para controversias no resueltas serán aplicables las leyes mexicanas y las
                autoridades competentes del domicilio del consumidor, sin limitar el derecho de
                acudir a PROFECO.
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                Centro de cumplimiento
              </h3>
              <Accordion type="single" collapsible className="rounded-2xl border border-white/10 bg-white/[0.03] px-4">
                {complianceModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <AccordionItem key={module.id} value={module.id} id={module.id} className="border-white/10">
                      <AccordionTrigger className="text-slate-200 hover:text-cyan-300 hover:no-underline">
                        <span className="flex items-center gap-3 pr-2 text-left">
                          <Icon className="h-4 w-4 shrink-0 text-blue-400" />
                          {module.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-7 text-xs leading-5 text-slate-400">
                        {module.content}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>

          <Separator className="my-10 bg-white/10" />

          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div>
              <h3 className="mb-2 font-semibold text-white">Intel gamer, solo si tú quieres</h3>
              <p className="mb-4 text-sm text-slate-400">
                Promociones y lanzamientos. La casilla está desmarcada por defecto.
              </p>
              {newsletterSent ? (
                <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                  Suscripción registrada. Puedes cancelarla desde cualquier correo.
                </p>
              ) : (
                <form onSubmit={submitNewsletter} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      required
                      type="email"
                      aria-label="Correo para boletín"
                      placeholder="tu@email.com"
                      className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-600"
                    />
                    <Button
                      type="submit"
                      disabled={!newsletterConsent}
                      className="border-0 bg-gradient-to-r from-blue-500 to-violet-600 text-white disabled:opacity-40"
                    >
                      Suscribirme
                    </Button>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-xs font-normal leading-5 text-slate-400">
                    <Checkbox
                      checked={newsletterConsent}
                      onCheckedChange={(checked) => setNewsletterConsent(checked === true)}
                      className="mt-0.5 border-slate-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                    />
                    Acepto recibir comunicaciones comerciales. Puedo retirar mi consentimiento en
                    cualquier momento.
                  </label>
                </form>
              )}
            </div>

            <div className="flex flex-col gap-5 lg:items-end">
              <div className="flex gap-1">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    aria-label="Red social de NexusGamer"
                    className="text-slate-500 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <div className="text-xs leading-5 text-slate-500 lg:text-right">
                <p>© 2025 Nexus Gamer México, S.A. de C.V. Todos los derechos reservados.</p>
                <p>Última actualización de políticas: 15 de enero de 2025.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Dialog
        open={activeForm !== null}
        onOpenChange={(open) => {
          if (!open) setActiveForm(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-blue-500/20 bg-slate-950 text-white sm:max-w-xl">
          {selectedForm && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-blue-400" />
                  {selectedForm.title}
                </DialogTitle>
                <DialogDescription className="text-slate-400">{selectedForm.description}</DialogDescription>
              </DialogHeader>
              {formSent ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
                  <BadgeCheck className="mx-auto mb-3 h-9 w-9 text-emerald-400" />
                  <p className="font-semibold text-emerald-200">Solicitud recibida</p>
                  <p className="mt-1 text-sm text-emerald-100/70">
                    Enviamos el folio NG-{new Date().getFullYear()}-1842 a tu correo.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitForm} className="space-y-4">
                  <label className="block space-y-2 text-sm">
                    <span>Nombre completo</span>
                    <Input required className="border-slate-700 bg-slate-900 text-white" />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>Correo electrónico</span>
                    <Input required type="email" className="border-slate-700 bg-slate-900 text-white" />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>{selectedForm.label}</span>
                    <Input
                      required
                      placeholder={selectedForm.placeholder}
                      className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-600"
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <span>Detalles</span>
                    <textarea
                      required
                      rows={4}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Cuéntanos la información necesaria para atender tu solicitud"
                    />
                  </label>
                  <Button type="submit" className="w-full border-0 bg-gradient-to-r from-blue-500 to-violet-600 text-white">
                    Enviar solicitud
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {cookiePreference === null && (
        <aside
          role="dialog"
          aria-label="Preferencias de cookies"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-2xl border border-blue-400/30 bg-slate-950/95 p-5 text-white shadow-2xl shadow-blue-950/50 backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex flex-1 items-start gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Cookie className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="font-semibold">Tú controlas tus cookies</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Usamos cookies esenciales para carrito y seguridad. Con tu permiso activamos
                  analítica y personalización; puedes rechazarlas sin perder funciones básicas.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => saveCookiePreference('essential')}
                className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800"
              >
                Solo esenciales
              </Button>
              <Button
                onClick={() => saveCookiePreference('accepted')}
                className="border-0 bg-gradient-to-r from-blue-500 to-violet-600 text-white"
              >
                Aceptar todas
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
