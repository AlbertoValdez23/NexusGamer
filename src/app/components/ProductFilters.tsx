import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X, Sparkles } from 'lucide-react';

export interface Filters {
  search: string;
  category: string;
  priceRange: string;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
}

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
  totalProducts: number;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  totalProducts,
}: ProductFiltersProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      priceRange: 'all',
      isFeatured: false,
      isNew: false,
      rating: 0,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') return value !== '' && value !== 'all';
    return false;
  }).length;

  return (
    <Card className="sticky top-24 bg-white/80 backdrop-blur-lg border-0 shadow-2xl overflow-hidden">
      {/* Decorative gradient header bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500"></div>

      <CardHeader className="pb-4 bg-gradient-to-br from-blue-50/50 to-violet-50/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-violet-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Filtros
            </span>
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all duration-300 hover:scale-105"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-blue-700 font-medium">{totalProducts} productos</span>
          <span className="text-gray-600">encontrados</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Search */}
        <div className="space-y-3">
          <Label htmlFor="search" className="text-gray-700 font-medium">Buscar productos</Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="search"
              placeholder="¿Qué equipo buscas?"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 bg-gray-50/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-300 hover:bg-gray-50"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Categoría</Label>
          <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}>
            <SelectTrigger className="bg-gray-50/50 border-gray-200 hover:border-blue-300 focus:border-blue-300 transition-all duration-300">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range in Colones */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Rango de precio (MXN)</Label>
          <Select value={filters.priceRange || 'all'} onValueChange={(value) => updateFilter('priceRange', value === 'all' ? '' : value)}>
            <SelectTrigger className="bg-gray-50/50 border-gray-200 hover:border-blue-300 focus:border-blue-300 transition-all duration-300">
              <SelectValue placeholder="Cualquier precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier precio</SelectItem>
              <SelectItem value="0-3000">$0 - $3,000</SelectItem>
              <SelectItem value="3000-10000">$3,000 - $10,000</SelectItem>
              <SelectItem value="10000-30000">$10,000 - $30,000</SelectItem>
              <SelectItem value="30000+">$30,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-300">
            <Checkbox
              id="featured"
              checked={filters.isFeatured}
              onCheckedChange={(checked) => updateFilter('isFeatured', checked)}
              className="border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label htmlFor="featured" className="cursor-pointer text-gray-700 font-medium">
              Solo productos destacados 🔥
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-violet-50/50 transition-colors duration-300">
            <Checkbox
              id="new"
              checked={filters.isNew}
              onCheckedChange={(checked) => updateFilter('isNew', checked)}
              className="border-violet-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
            />
            <Label htmlFor="new" className="cursor-pointer text-gray-700 font-medium">
              Lanzamientos nuevos ✨
            </Label>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Calificación mínima</Label>
          <Select
            value={filters.rating.toString()}
            onValueChange={(value) => updateFilter('rating', parseInt(value))}
          >
            <SelectTrigger className="bg-gray-50/50 border-gray-200 hover:border-blue-300 focus:border-blue-300 transition-all duration-300">
              <SelectValue placeholder="Cualquier calificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Cualquier calificación</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4+ estrellas</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3+ estrellas</SelectItem>
              <SelectItem value="2">⭐⭐ 2+ estrellas</SelectItem>
              <SelectItem value="1">⭐ 1+ estrellas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50/80 to-violet-50/60 rounded-xl border border-blue-100">
            <Label className="text-blue-800 font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Filtros activos
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                  🔍 {filters.search}
                </Badge>
              )}
              {filters.category && filters.category !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-800 hover:bg-violet-200 transition-colors">
                  📂 {filters.category}
                </Badge>
              )}
              {filters.priceRange && filters.priceRange !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-colors">
                  💰 ${filters.priceRange}
                </Badge>
              )}
              {filters.isFeatured && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                  🔥 Destacado
                </Badge>
              )}
              {filters.isNew && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
                  ✨ Nuevo
                </Badge>
              )}
              {filters.rating > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors">
                  ⭐ {filters.rating}+ estrellas
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
