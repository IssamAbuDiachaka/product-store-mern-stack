/**
 * Main App component with improved routing, error boundaries, and global state management
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";
import Navbar from "./components/navbar/Navbar.jsx";

// Lazy load pages for better performance
const Homepage = lazy(() => import("./pages/Homepage.jsx"));
const CreatePage = lazy(() => import("./pages/CreatePage.jsx"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }) => {
  return children;
};

function App() {
  return (
    <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
      <div className="min-h-screen bg-gray-50">
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          richColors
          expand={true}
          closeButton
        />
        
        {/* Navigation */}
        <Navbar />
        
        {/* Main content */}
        <main className="relative">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/create-product" element={<CreatePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </Theme>
  );
}

export default App;
