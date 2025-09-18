import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";

// Context providers
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/navbar/Navbar.jsx";

// Lazy load pages for better performance
const Homepage = lazy(() => import("./pages/Homepage.jsx"));
const CreatePage = lazy(() => import("./pages/CreatePage.jsx"));
const ProductsPage = lazy(() => import("./pages/ProductsPage.jsx"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }) => {
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
          <div className="min-h-screen bg-white flex flex-col">
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              richColors
              expand={true}
              closeButton
              theme="light"
            />

            {/* Navbar
            <Navbar /> */}
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="flex-1">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/create-product" element={<CreatePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Theme>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
