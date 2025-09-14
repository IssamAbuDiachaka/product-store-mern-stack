/**
 * Loading components for different UI states
 * Provides consistent loading indicators across the app
 */

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Simple spinner loader
export const Spinner = ({ size = 20, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

// Full page loader
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <Spinner size={40} className="text-blue-600 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </motion.div>
  </div>
);

// Card skeleton loader
export const CardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg border p-4">
    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

// Grid skeleton loader
export const GridSkeleton = ({ count = 8, columns = 4 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6`}>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

// Button loader
export const ButtonLoader = ({ children, loading, ...props }) => (
  <button disabled={loading} {...props}>
    {loading && <Spinner size={16} className="mr-2" />}
    {children}
  </button>
);
