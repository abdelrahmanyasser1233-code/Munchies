import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar({ onCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admins-only');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (isAdmin) return null;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Mobile Menu Button - shows hamburger on mobile */}
          <button 
            className="navbar-menu-btn mobile-only" 
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu className="hamburger-icon" />
            <span>Menu</span>
          </button>

          <Link to="/" className="navbar-brand">
            <div className="navbar-logo-wrapper">
              <img src="/logo.png" alt="Munchies" className="navbar-logo" />
            </div>
            <div className="navbar-brand-text">
              <div className="navbar-title">munchies</div>
              <div className="navbar-tagline">Better Food, Better School Days</div>
            </div>
          </Link>

          <div className="navbar-actions">
            <Link
              to="/"
              className={`navbar-link desktop-only ${location.pathname === '/' ? 'active' : ''}`}
            >
              Menu
            </Link>
            <a 
              href="#categories" 
              className="navbar-link desktop-only"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Categories
            </a>

            <motion.button
              className="cart-button"
              onClick={onCartOpen}
              animate={{ 
                scale: totalItems > 0 ? [1, 1.15, 1] : 1,
                rotate: totalItems > 0 ? [0, -5, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.3, times: [0, 0.2, 0.5, 0.8, 1] }}
              key={`cart-btn-${totalItems}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open cart"
            >
              <HiOutlineShoppingBag />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    className="cart-badge"
                    key={totalItems}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mobile-menu-header">
                <span className="navbar-title" style={{ fontSize: '1.3rem' }}>
                  munchies
                </span>
                <button
                  className="mobile-menu-close"
                  onClick={() => setMobileOpen(false)}
                >
                  <HiOutlineX />
                </button>
              </div>

              <Link to="/" className="mobile-menu-link">
                🍽️ Menu
              </Link>
              <Link to="/checkout" className="mobile-menu-link">
                🛒 Checkout
              </Link>

              <div className="mobile-menu-divider" />
              <div className="mobile-menu-section-label">Categories</div>
              {[
                { id: 'Bakery', icon: '🥐' },
                { id: 'Meals', icon: '🍕' },
                { id: 'Drinks', icon: '🥤' },
                { id: 'Snacks', icon: '🧁' },
              ].map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.id}`}
                  className="mobile-menu-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.icon} {cat.id}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
