/**
 * Hero Section Component - Main banner with carousel functionality
 * Features: Product showcase, call-to-action buttons, and navigation dots
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Charge Your Phone Safely!',
      subtitle: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.',
      image: '/images/hero-wireless-charging.jpg', // You'll need to add this image
      primaryButton: {
        text: 'TO SHOP',
        href: '/products'
      },
      secondaryButton: {
        text: 'READ MORE',
        href: '/about'
      }
    },
    {
      id: 2,
      title: 'Premium Phone Cases',
      subtitle: 'Protect your device with our premium collection of cases designed for style and durability.',
      image: '/images/hero-cases.jpg',
      primaryButton: {
        text: 'SHOP CASES',
        href: '/products?category=Cases'
      },
      secondaryButton: {
        text: 'LEARN MORE',
        href: '/products/cases'
      }
    },
    {
      id: 3,
      title: 'MagSafe Accessories',
      subtitle: 'Experience the convenience of magnetic charging and mounting with our MagSafe collection.',
      image: '/images/hero-magsafe.jpg',
      primaryButton: {
        text: 'EXPLORE MAGSAFE',
        href: '/products?category=MagSafe'
      },
      secondaryButton: {
        text: 'VIEW ALL',
        href: '/products'
      }
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-[500px] md:h-[600px] bg-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-gray-100" />
      
      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full py-12">
          {/* Text Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {currentSlideData.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                {currentSlideData.subtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={currentSlideData.primaryButton.href}
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
              >
                {currentSlideData.primaryButton.text}
              </Link>
              <Link
                to={currentSlideData.secondaryButton.href}
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-gray-700 font-semibold border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors duration-200 text-center"
              >
                {currentSlideData.secondaryButton.text}
              </Link>
            </div>
          </div>

          {/* Product Showcase */}
          <div className="relative">
            {/* Main Product Display */}
            <div className="relative z-10">
              {/* Placeholder for product images - you can replace with actual product images */}
              <div className="relative w-full h-80 md:h-96 bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                {/* Wireless Charging Pad */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-gray-900 rounded-xl shadow-lg flex items-center justify-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="absolute top-8 right-12 w-20 h-36 bg-gradient-to-b from-purple-900 via-purple-700 to-purple-500 rounded-2xl shadow-lg transform rotate-12">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-800 rounded-full"></div>
                </div>
                
                {/* Cable */}
                <div className="absolute bottom-8 right-8 w-24 h-4 bg-gray-800 rounded-full transform -rotate-12"></div>
                
                {/* MagSafe Charger */}
                <div className="absolute bottom-4 left-8 w-16 h-16 bg-white border-4 border-gray-200 rounded-full shadow-md"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-100 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center">
        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentSlide
                ? 'bg-blue-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Demo Badge */}
      <div className="absolute top-6 right-6 bg-black text-white px-3 py-1 text-xs font-medium rounded">
        DEMO
      </div>
    </section>
  );
};

export default HeroSection;
