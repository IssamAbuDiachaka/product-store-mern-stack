/**
 * New Arrivals Section - Featured products with filtering tabs
 * Features: Product showcase, category filtering, ratings, and pricing
 */

import { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewArrivals = () => {
  const [activeTab, setActiveTab] = useState('CASES');

  const tabs = [
    { id: 'CASES', label: 'CASES' },
    { id: 'STRAPS', label: 'STRAPS' },
    { id: 'MAGSAFE', label: 'MAGSAFE' }
  ];

  const products = [
    {
      id: 1,
      name: 'iPhone 13 Pro Moment Case - Blue',
      price: 149.00,
      image: '/images/case-blue.jpg',
      category: 'CASES',
      rating: 5,
      reviews: 24,
      colors: ['#4A90E2', '#2C3E50', '#27AE60'],
      badge: null
    },
    {
      id: 2,
      name: 'Full Aquarelle iPhone XR',
      price: 169.00,
      image: '/images/case-floral.jpg',
      category: 'CASES',
      rating: 4,
      reviews: 18,
      colors: ['#E8B4CB', '#DDA0DD', '#B19CD9'],
      badge: 'SOLD OUT'
    },
    {
      id: 3,
      name: 'iPhone 12 Pro Moment Case - Olive',
      price: 159.00,
      image: '/images/case-olive.jpg',
      category: 'CASES',
      rating: 5,
      reviews: 32,
      colors: ['#8FBC8F', '#228B22', '#006400'],
      badge: 'HOT'
    },
    {
      id: 4,
      name: 'Leather Case iPhone 12 Deep Violet',
      price: 239.00,
      image: '/images/case-violet.jpg',
      category: 'CASES',
      rating: 4,
      reviews: 12,
      colors: ['#4B0082', '#8A2BE2', '#9932CC'],
      badge: null
    },
    {
      id: 5,
      name: 'iPhone 13 Case Luxe - Dusty Pink',
      price: 149.00,
      image: '/images/case-pink.jpg',
      category: 'CASES',
      rating: 5,
      reviews: 28,
      colors: ['#F5C6CB', '#E91E63', '#AD1457'],
      badge: null
    }
  ];

  const filteredProducts = products.filter(product => product.category === activeTab);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 mb-2">Hurry up to buy</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            How can you evaluate content without design
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* Placeholder for product image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="w-24 h-32 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg shadow-lg">
                    {/* Phone case representation */}
                  </div>
                </div>
                
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded ${
                    product.badge === 'HOT' 
                      ? 'bg-red-500 text-white'
                      : product.badge === 'SOLD OUT'
                      ? 'bg-gray-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {product.badge}
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link
                  to={`/products/${product.id}`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex space-x-0.5">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  {/* Color Options */}
                  <div className="flex space-x-1">
                    {product.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
