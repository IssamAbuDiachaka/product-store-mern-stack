/**
 * Enhanced Homepage with improved state management, search, filtering, and UX
 * Features: Loading states, error handling, search functionality, responsive design
 */

import { useState, useMemo } from 'react';
import { Rocket, Search, Plus, Filter, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, TextField, Select, Flex, Badge } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { debounce } from '../utils/helpers';

const Homepage = () => {
  const {
    products,
    loading,
    error,
    updateProduct,
    deleteProduct,
    searchProducts,
    refetch,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      if (query.trim()) {
        searchProducts(query);
      } else {
        refetch();
      }
    }, 300),
    [searchProducts, refetch]
  );

  // Handle search input
  const handleSearch = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply stock filter
    if (filterBy === 'in-stock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (filterBy === 'out-of-stock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filterBy, sortBy]);

  // Loading component
  const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Rocket size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No products found' : 'No products yet'}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchQuery 
            ? `No products match "${searchQuery}". Try adjusting your search.`
            : 'Get started by adding your first product to the store.'
          }
        </p>
        {!searchQuery && (
          <Link to="/create-product">
            <Button size="3">
              <Plus size={16} />
              Add First Product
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={refetch}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Product Store
                <Rocket className="text-blue-600" size={28} />
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your products with ease
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/create-product">
                <Button size="3">
                  <Plus size={16} />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <Flex gap="4" wrap="wrap" align="center">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <TextField.Root
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                >
                  <TextField.Slot>
                    <Search size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </div>

              {/* Sort */}
              <Select.Root value={sortBy} onValueChange={setSortBy}>
                <Select.Trigger placeholder="Sort by">
                  <Filter size={16} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="name">Name A-Z</Select.Item>
                  <Select.Item value="price-low">Price: Low to High</Select.Item>
                  <Select.Item value="price-high">Price: High to Low</Select.Item>
                  <Select.Item value="stock">Stock Level</Select.Item>
                </Select.Content>
              </Select.Root>

              {/* Filter by stock */}
              <Select.Root value={filterBy} onValueChange={setFilterBy}>
                <Select.Trigger placeholder="Filter">
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All Products</Select.Item>
                  <Select.Item value="in-stock">In Stock</Select.Item>
                  <Select.Item value="out-of-stock">Out of Stock</Select.Item>
                </Select.Content>
              </Select.Root>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-md">
                <Button
                  size="2"
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  size="2"
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </Flex>

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="soft">
                  {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
                </Badge>
                {searchQuery && (
                  <span className="text-sm text-gray-600">
                    for "{searchQuery}"
                  </span>
                )}
              </div>
              {(searchQuery || filterBy !== 'all') && (
                <Button
                  size="1"
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                    refetch();
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {loading ? (
            <LoadingGrid />
          ) : filteredAndSortedProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${filteredAndSortedProducts.length}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onUpdate={updateProduct}
                      onDelete={deleteProduct}
                      onView={(product) => {
                        // Handle product view - could open a modal or navigate to detail page
                        console.log('View product:', product);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.stock > 0).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
