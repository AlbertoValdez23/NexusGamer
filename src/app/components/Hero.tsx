import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Truck, Award, Sparkles, ArrowRight, Zap, Cpu } from 'lucide-react';

export function Hero() {
  const scrollToProducts = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 py-24 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/20 to-violet-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-cyan-400/15 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-violet-500/15 to-blue-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(96,165,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full shadow-lg shadow-blue-500/10">
              <Zap className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">El mejor gaming gear en Nuevo Laredo</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
              Equipa tu{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent relative">
                Setup
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full"></div>
              </span>
              <br />
              Juega en{' '}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Otro Nivel
              </span>
            </h1>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-xl text-slate-300 leading-relaxed">
                Computadoras gamer, audífonos, teclados mecánicos, monitores y más.
                Todo el hardware que necesitas para dominar cada partida.
              </p>
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-300">
                <span className="text-2xl">$</span>
                <span>Precios en pesos mexicanos</span>
                <span>🇲🇽</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToProducts}
                className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group border-0"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToAbout}
                className="border-2 border-blue-500/40 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 bg-transparent"
              >
                Conocer Más
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  Productos
                </div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  4.8★
                </div>
                <div className="text-sm text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Award className="h-4 w-4 text-blue-400" />
                  Calificación
                </div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Truck className="h-4 w-4 text-blue-400" />
                  Soporte
                </div>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-700 border border-blue-500/20">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBjb21wdXRlciUyMHNldHVwJTIwUkdCfGVufDF8fHx8MTc4ODM2MDIzNHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Setup gamer profesional"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-violet-900/20"></div>
            </div>

            {/* Floating badges */}
            <div className="absolute -bottom-8 -left-8 bg-slate-800/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-xl shadow-blue-500/10 p-4 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-blue-300">RGB Certificado</span>
              </div>
            </div>

            <div className="absolute -top-8 -right-8 bg-slate-800/90 backdrop-blur-sm border border-violet-500/30 rounded-2xl shadow-xl shadow-violet-500/10 p-4 animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-violet-400" />
                <span className="font-bold text-violet-300">Garantía MX</span>
              </div>
            </div>

            <div className="absolute top-1/2 -left-6 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-2xl shadow-xl p-3 animate-bounce" style={{ animationDelay: '2s' }}>
              <div className="text-center">
                <div className="font-bold text-lg flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  HOT
                </div>
                <div className="text-xs">Oferta</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </section>
  );
}
