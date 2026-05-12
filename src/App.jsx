import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AnimatedRoutes({ onCartOpen }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admins-only');

  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <div className="app-page-wrapper">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admins-only" element={<AdminLogin />} />
            <Route path="/admins-only/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </div>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: { primary: '#8B9A46', secondary: '#fff' },
            },
            duration: 3000,
            className: 'toast-bounce',
          }}
        />
        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        <AnimatedRoutes onCartOpen={() => setCartOpen(true)} />
      </CartProvider>
    </Router>
  );
}
