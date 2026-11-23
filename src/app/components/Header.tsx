import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, Menu, X, Cpu } from 'lucide-react';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-slate-900 border-b border-blue-900/50 sticky top-0 z-50 shadow-lg shadow-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              NexusGamer
            </span>
            <span className="text-xs font-medium text-slate-400 hidden sm:block">MX</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Inicio
            </a>
            <a href="#productos" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Catálogo
            </a>
            <a href="#sobre-nosotros" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Sobre Nosotros
            </a>
            <a href="#contacto" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Contacto
            </a>
          </nav>

          {/* Cart and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative border-blue-700 bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 hover:text-white hover:border-blue-500 transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-violet-600 text-white border-0">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <nav className="flex flex-col space-y-4">
              <a
                href="#inicio"
                className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </a>
              <a
                href="#productos"
                className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catálogo
              </a>
              <a
                href="#sobre-nosotros"
                className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre Nosotros
              </a>
              <a
                href="#contacto"
                className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
