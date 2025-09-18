/**
 * Category Grid Component - Product categories with icons and counts
 * Features: Visual category representation with product counts and navigation
 */

import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Cable, 
  Zap, 
  Watch, 
  Battery,
  Box
} from 'lucide-react';

const CategoryGrid = () => {
  const categories = [
    {
      id: 'cases',
      name: 'Cases',
      count: 33,
      icon: Smartphone,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-500',
      href: '/products?category=Cases'
    },
    {
      id: 'magsafe',
      name: 'MagSafe',
      count: 19,
      icon: Zap,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-500',
      href: '/products?category=MagSafe'
    },
    {
      id: 'cables',
      name: 'Cables',
      count: 18,
      icon: Cable,
      color: 'bg-gray-100 text-gray-600',
      bgColor: 'bg-gray-500',
      href: '/products?category=Cables'
    },
    {
      id: 'charger',
      name: 'Charger',
      count: 12,
      icon: Zap,
      color: 'bg-teal-100 text-teal-600',
      bgColor: 'bg-teal-500',
      href: '/products?category=Charger'
    },
    {
      id: 'straps',
      name: 'Straps',
      count: 34,
      icon: Watch,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-500',
      href: '/products?category=Straps'
    },
    {
      id: 'powerbanks',
      name: 'Power Banks',
      count: 16,
      icon: Battery,
      color: 'bg-gray-100 text-gray-800',
      bgColor: 'bg-gray-800',
      href: '/products?category=Power Banks'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid of Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group flex flex-col items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                {/* Category Name */}
                <h3 className="text-sm font-semibold text-gray-900 mb-1 text-center">
                  {category.name}
                </h3>
                
                {/* Product Count */}
                <p className="text-xs text-gray-500">
                  {category.count} products
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
