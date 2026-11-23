import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Plus, Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isNew?: boolean;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice ?
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    onAddToCart(product);
    setIsAdding(false);
  };

  return (
    <Card className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl p-[1px]">
        <div className="w-full h-full bg-white rounded-xl"></div>
      </div>

      <div className="relative z-10">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg animate-pulse border-0">
                ✨ Nuevo
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg border-0">
                🔥 Destacado
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg animate-bounce border-0">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Floating action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLiked(!isLiked)}
              className={`h-10 w-10 p-0 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border-0 ${
                isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform duration-300 ${isLiked ? 'scale-110 fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`h-10 w-10 p-0 rounded-full shadow-lg transition-all duration-300 border-0 ${
                isAdding
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 hover:scale-110'
              }`}
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {product.category}
            </Badge>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 transition-colors duration-200 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1 font-medium">
                ({product.reviews})
              </span>
            </div>
          </div>

          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300 text-lg leading-tight">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                ¡Ahorras {formatPrice(product.originalPrice! - product.price)}!
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold px-4 py-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Añadiendo...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Añadir</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-3xl"></div>
    </Card>
  );
}
