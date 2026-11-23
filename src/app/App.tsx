import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard, Product } from './components/ProductCard';
import { ProductFilters, Filters } from './components/ProductFilters';
import { ShoppingCart, CartItem } from './components/ShoppingCart';
import { Footer } from './components/Footer';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { ArrowUp, Sparkles } from 'lucide-react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

// Catálogo inicial de demostración. La versión integrada se obtiene desde /api/products.
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'PC Gamer Ultimate RTX 4080 RGB',
    price: 38500,
    originalPrice: 44999,
    image: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb21wdXRlciUyMHNldHVwJTIwUkdCfGVufDF8fHx8MTc4ODM2MDIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Computadoras',
    rating: 4.9,
    reviews: 312,
    isFeatured: true,
    isNew: false,
    description: 'PC gamer de alto rendimiento con RTX 4080, Intel Core i9, 32GB RAM DDR5, SSD NVMe 2TB y refrigeración líquida AIO 360mm.'
  },
  {
    id: '2',
    name: 'Audífonos HyperX Cloud III Wireless',
    price: 2799,
    image: 'https://images.unsplash.com/photo-1610041321327-b794c052db27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxnYW1pbmclMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc4ODM2MDIzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audífonos',
    rating: 4.7,
    reviews: 218,
    isFeatured: true,
    isNew: true,
    description: 'Audífonos gaming inalámbricos con sonido surround 7.1, micrófono desmontable con cancelación de ruido y 38 horas de batería.'
  },
  {
    id: '3',
    name: 'Laptop Gamer ASUS ROG Strix G16',
    price: 29999,
    originalPrice: 34999,
    image: 'https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBsYXB0b3AlMjBSR0J8ZW58MXx8fHwxNzg4MzYwMjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Laptops',
    rating: 4.8,
    reviews: 175,
    isFeatured: true,
    isNew: false,
    description: 'Laptop gamer con pantalla 165Hz QHD, RTX 4070, AMD Ryzen 9, 16GB RAM y teclado mecánico RGB por zonas.'
  },
  {
    id: '4',
    name: 'Monitor Gaming 240Hz Curvo 27" QHD',
    price: 9499,
    image: 'https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtb25pdG9yJTIwdWx0cmF3aWRlfGVufDF8fHx8MTc4ODM2MDIzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Monitores',
    rating: 4.6,
    reviews: 143,
    isFeatured: false,
    isNew: true,
    description: 'Monitor gaming curvo 27" QHD 240Hz con panel VA, tiempo de respuesta 1ms, AMD FreeSync Premium Pro y HDR600.'
  },
  {
    id: '5',
    name: 'Teclado Mecánico RGB Razer BlackWidow V4',
    price: 3799,
    originalPrice: 4499,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwZ2FtaW5nJTIwa2V5Ym9hcmR8ZW58MXx8fHwxNzg4MzYwMjM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Periféricos',
    rating: 4.5,
    reviews: 289,
    isFeatured: false,
    isNew: false,
    description: 'Teclado mecánico gaming TKL con switches Razer Green, retroiluminación Chroma RGB por tecla, reposamuñecas magnético.'
  },
  {
    id: '6',
    name: 'Mouse Gaming Logitech G Pro X Superlight 2',
    price: 2199,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtb3VzZSUyMHByZWNpc2lvbnxlbnwxfHx8fDE3ODgzNjAyNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Periféricos',
    rating: 4.8,
    reviews: 401,
    isFeatured: true,
    isNew: false,
    description: 'Mouse gaming inalámbrico ultra ligero 60g, sensor HERO 2 25600 DPI, clic de doble velocidad y batería de 95 horas.'
  },
  {
    id: '7',
    name: 'Silla Gamer DXRacer Formula Pro RGB',
    price: 8499,
    originalPrice: 9999,
    image: 'https://images.unsplash.com/photo-1770194993269-2521ad916c23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmclMjBjaGFpciUyMGVyZ29ub21pY3xlbnwxfHx8fDE3ODgzNjAyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sillas',
    rating: 4.6,
    reviews: 167,
    isFeatured: false,
    isNew: false,
    description: 'Silla gaming ergonómica con soporte lumbar ajustable, reposabrazos 4D, inclinación 135°, cuero PU premium y LED RGB.'
  },
  {
    id: '8',
    name: 'Setup Gamer Completo Escritorio RGB',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1636487658609-28282bb5a3a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjaGFpciUyMGVyZ29ub21pY3xlbnwxfHx8fDE3ODgzNjAyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Accesorios',
    rating: 4.4,
    reviews: 98,
    isFeatured: false,
    isNew: true,
    description: 'Kit de accesorios gaming: soporte para auriculares, hub USB-C 7 puertos, porta vasos magnético y tira LED ambilight.'
  },
  {
    id: '9',
    name: 'Headset Inalámbrico Astro A50 Gen 5',
    price: 5299,
    image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc4ODM2MDIzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audífonos',
    rating: 4.9,
    reviews: 256,
    isFeatured: true,
    isNew: true,
    description: 'Headset premium inalámbrico con Dolby Atmos, estación de carga base integrada, micrófono retráctil y 24 horas de autonomía.'
  },
  {
    id: '10',
    name: 'Mouse Razer Viper V3 Pro',
    price: 3299,
    originalPrice: 3699,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1080&q=80',
    category: 'Periféricos',
    rating: 4.8,
    reviews: 84,
    isFeatured: false,
    isNew: true,
    description: 'Mouse competitivo ultraligero con sensor Focus Pro 35K y conexión inalámbrica HyperSpeed.'
  },
  {
    id: '11',
    name: 'Monitor ASUS ROG Strix 27" QHD',
    price: 10999,
    originalPrice: 12499,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1080&q=80',
    category: 'Monitores',
    rating: 4.7,
    reviews: 122,
    isFeatured: true,
    isNew: false,
    description: 'Monitor IPS QHD de 27 pulgadas, 170Hz, G-SYNC compatible y certificación DisplayHDR 400.'
  },
  {
    id: '12',
    name: 'Micrófono USB Stream Pro',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1080&q=80',
    category: 'Accesorios',
    rating: 4.6,
    reviews: 73,
    isFeatured: false,
    isNew: true,
    description: 'Micrófono de condensador con patrón cardioide, monitoreo directo y control físico de ganancia.'
  },
  {
    id: '13',
    name: 'Mousepad Nexus Control XL',
    price: 649,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1616088886430-ccd86fef0713?auto=format&fit=crop&w=1080&q=80',
    category: 'Periféricos',
    rating: 4.5,
    reviews: 191,
    isFeatured: false,
    isNew: false,
    description: 'Superficie de control de 90 × 40 cm, base antideslizante y borde reforzado para uso intensivo.'
  },
  {
    id: '14',
    name: 'Webcam Creator 2K 60fps',
    price: 2499,
    originalPrice: 2899,
    image: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?auto=format&fit=crop&w=1080&q=80',
    category: 'Accesorios',
    rating: 4.6,
    reviews: 67,
    isFeatured: false,
    isNew: true,
    description: 'Cámara para streaming con enfoque automático, HDR, doble micrófono y obturador de privacidad.'
  },
  {
    id: '15',
    name: 'PC Gamer Core RTX 4060',
    price: 21999,
    originalPrice: 23999,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1080&q=80',
    category: 'Computadoras',
    rating: 4.7,
    reviews: 109,
    isFeatured: true,
    isNew: false,
    description: 'Equipo equilibrado con RTX 4060, Ryzen 5, 16GB DDR5 y SSD NVMe de 1TB.'
  }
];

function LegacyApp() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('nexus-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    priceRange: '',
    isFeatured: false,
    isNew: false,
    rating: 0,
  });

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('nexus-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(mockProducts.map(product => product.category)));
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      // Search filter
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !product.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
        const minPrice = parseFloat(min) || 0;
        const maxPrice = max ? parseFloat(max) : Infinity;
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }
      }

      // Featured filter
      if (filters.isFeatured && !product.isFeatured) {
        return false;
      }

      // New filter
      if (filters.isNew && !product.isNew) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredProducts, sortBy]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-violet-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200/20 to-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      <Header
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <Hero />

      <section id="productos" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full mb-6 animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Envío express a todo México</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent mb-6">
              Catálogo Gamer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La mejor selección de hardware, periféricos y accesorios gaming
              al mejor precio del mercado mexicano.
              <span className="text-blue-600 font-semibold"> ¡Precios en pesos mexicanos!</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                totalProducts={sortedProducts.length}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <div className="text-gray-700">
                  <span className="font-semibold text-blue-600">
                    {sortedProducts.length}
                  </span>
                  <span className="text-gray-600"> de {mockProducts.length} productos disponibles</span>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-56 bg-white/80 backdrop-blur-sm border-blue-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="rating">Mejor Valorados</SelectItem>
                    <SelectItem value="newest">Más Nuevos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-32 h-32 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Intenta ajustar los filtros para encontrar más productos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sortedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="transform transition-all duration-500 hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={addToCart}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Enhanced Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full h-14 w-14 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 shadow-2xl z-40 transform transition-all duration-300 hover:scale-110 animate-bounce"
          size="sm"
        >
          <ArrowUp className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0s' }}></div>
      <div className="fixed top-40 right-20 w-3 h-3 bg-violet-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="fixed bottom-32 left-16 w-2 h-2 bg-cyan-500 rounded-full opacity-50 animate-ping" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
