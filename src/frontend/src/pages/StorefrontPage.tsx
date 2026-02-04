import { useState } from 'react';
import { useGetAllProducts, useGetAllCategories } from '../hooks/useQueries';
import { useCart } from '../contexts/CartContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types/erp-types';

export default function StorefrontPage() {
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: categories = [] } = useGetAllCategories();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    if (Number(product.stock) === 0) {
      toast.error('Product is out of stock');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const getImageUrl = (product: Product) => {
    if (product.image) {
      return product.image.getDirectURL?.() || '/assets/generated/product-placeholder.dim_300x300.png';
    }
    return '/assets/generated/product-placeholder.dim_300x300.png';
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
          Product Catalog
        </h1>
        <p className="text-muted-foreground">
          Browse our comprehensive selection of products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back later for new products'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  {product.digital && (
                    <Badge variant="secondary" className="ml-2">Digital</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {Number(product.stock)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={Number(product.stock) === 0}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
