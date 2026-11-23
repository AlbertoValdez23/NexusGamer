import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';
import { Product } from './ProductCard';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function ShoppingCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: ShoppingCartProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    setIsProcessingCheckout(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessingCheckout(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-slate-900 via-blue-950/80 to-violet-950/50 border-blue-800/30 shadow-2xl shadow-blue-900/20">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-blue-400" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Tu Carrito
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-3 py-1 border-0">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </Badge>
          </SheetTitle>
          <SheetDescription className="text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Revisa y gestiona los productos en tu carrito
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Tu carrito está vacío
                </h3>
                <p className="text-slate-400 mb-6 max-w-sm">
                  Añade hardware gamer y lleva tu setup al siguiente nivel
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 border-0"
                >
                  Ver Catálogo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="p-4 bg-slate-800/60 backdrop-blur-sm border border-blue-800/30 shadow-lg hover:shadow-xl hover:border-blue-600/40 transition-all duration-300 rounded-xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border border-blue-700/20">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate text-sm">
                          {item.name}
                        </h4>
                        <p className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1 border-blue-700/50 text-blue-300 bg-blue-900/30">
                          {item.category}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="h-8 w-8 p-0 rounded-full border-blue-700/50 hover:border-blue-500 hover:bg-blue-900/50 transition-all duration-200 text-blue-300 bg-transparent"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-900/50 to-violet-900/50 border border-blue-700/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-300">
                            {item.quantity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 rounded-full border-blue-700/50 hover:border-blue-500 hover:bg-blue-900/50 transition-all duration-200 text-blue-300 bg-transparent"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/30 border-red-800/50 hover:border-red-600/50 transition-all duration-200 hover:scale-110 bg-transparent"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-blue-800/30 pt-6 space-y-4 bg-slate-900/50 p-4 rounded-xl mt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-slate-200">Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="text-xs text-slate-400 bg-blue-900/20 border border-blue-800/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-300">Beneficios incluidos:</span>
                </div>
                <ul className="space-y-1 ml-5">
                  <li>• Envío express gratis en órdenes mayores a $5,000 MXN</li>
                  <li>• Garantía mínima legal de 90 días en México</li>
                  <li>• Soporte técnico 24/7 en español 🎮</li>
                </ul>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-800/30 bg-slate-950/40 p-3 text-xs font-normal leading-5 text-slate-300">
                <Checkbox
                  checked={legalConsent}
                  onCheckedChange={(checked) => setLegalConsent(checked === true)}
                  className="mt-0.5 border-blue-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                />
                <span>
                  Acepto expresamente los{' '}
                  <a
                    href="#terminos"
                    onClick={onClose}
                    className="font-semibold text-blue-300 underline underline-offset-2"
                  >
                    Términos y Condiciones
                  </a>{' '}
                  y el{' '}
                  <a
                    href="#privacidad"
                    onClick={onClose}
                    className="font-semibold text-blue-300 underline underline-offset-2"
                  >
                    Aviso de Privacidad
                  </a>
                  . Confirmo que los precios están en MXN con IVA incluido y que los costos de envío
                  se mostrarán antes del pago.
                </span>
              </label>

              <Button
                onClick={handleCheckout}
                disabled={isProcessingCheckout || !legalConsent}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                size="lg"
              >
                {isProcessingCheckout ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span>{legalConsent ? 'Proceder al Pago' : 'Acepta los términos para continuar'}</span>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full border-blue-700/50 text-blue-300 hover:bg-blue-900/30 hover:border-blue-500 transition-all duration-300 bg-transparent"
                onClick={onClose}
              >
                Seguir Comprando
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
