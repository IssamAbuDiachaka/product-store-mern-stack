/**
 * Enhanced Homepage - Modern e-commerce homepage matching the design
 * Features: Hero section, category grid, new arrivals, and optimized layout
 */

import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import NewArrivals from '../components/NewArrivals';
import { useProducts } from '../hooks/useProducts';

const Homepage = () => {
  const {
    products,
    loading,
    error,
    fetchProducts
  } = useProducts();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 0,
    inStock: 0
  });

  // Fetch featured products and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get featured products
        const featured = products.filter(product => product.isFeatured).slice(0, 6);
        setFeaturedProducts(featured);

        // Calculate stats
        const categories = [...new Set(products.map(p => p.category))].length;
        const inStock = products.filter(p => p.stock > 0).length;
        
        setStats({
          totalProducts: products.length,
          categories,
          inStock
        });
      } catch (error) {
        console.error('Error loading homepage data:', error);
      }
    };

    if (products.length > 0) {
      loadData();
    }
  }, [products]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Grid */}
      <CategoryGrid />

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Stats Section */}
      {!loading && products.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">
                  {stats.totalProducts}+
                </div>
                <div className="text-gray-600">Products Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-600">
                  {stats.categories}
                </div>
                <div className="text-gray-600">Product Categories</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-purple-600">
                  {stats.inStock}
                </div>
                <div className="text-gray-600">Items In Stock</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-8">
              Get the latest updates on new products and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
