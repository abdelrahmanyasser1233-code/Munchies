import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiArrowUp } from 'react-icons/hi';
import { fetchProducts } from '../lib/supabase';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import './MenuPage.css';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 400], [0, -60]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <motion.div
      className="menu-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero */}
      <section className="menu-hero" ref={heroRef}>
        <div className="menu-hero-container">
          <motion.div
            className="menu-hero-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div style={{ y: heroParallaxY }}>
              <picture>
                <source media="(max-width: 768px)" srcSet="/Mobile.png" />
                <img src="/Desktop.png" alt="Munchies Hero Background" className="hero-image" />
              </picture>
            </motion.div>
          </motion.div>

          <div className="menu-hero-text-wrapper">
            <motion.div 
              className="menu-hero-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1>Today's <span>Menu</span></h1>
              <p>Fresh, delicious, and made with love —<br/>order your favorites and skip the line!</p>
            </motion.div>
            <div className="menu-hero-action">
              <button
                className="view-full"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Full Menu &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="menu-content">
        {/* Search Bar */}
        <div className="menu-search-wrapper">
          <HiOutlineSearch className="menu-search-icon" />
          <input
            type="text"
            className="menu-search-input"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="menu-skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            className="menu-error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="menu-error-icon">😕</div>
            <h3>Oops!</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadProducts}>
              Try Again
            </button>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            className="menu-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="menu-empty-icon">🍽️</div>
            <h3>No items found</h3>
            <p>
              {activeCategory !== 'All'
                ? `No products in "${activeCategory}" right now. Try another category!`
                : 'The menu is being prepared. Check back soon!'}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="menu-count">
              Showing {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="menu-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        )}

        {/* Browse Categories Section */}
        <div id="categories" className="browse-categories-section">
          <h2>Browse <span>Categories</span></h2>
          <div className="category-cards-grid">
            {[
              { id: 'Bakery', title: 'Bakery', desc: 'Freshly baked goodness', icon: '🥐' },
              { id: 'Meals', title: 'Meals', desc: 'Wholesome and satisfying meals', icon: '🍕' },
              { id: 'Drinks', title: 'Drinks', desc: 'Refreshing and energizing', icon: '🥤' },
              { id: 'Snacks', title: 'Snacks', desc: 'Tasty bites for every mood', icon: '🧁' }
            ].map((cat, i) => (
              <motion.div
                key={cat.id}
                className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id === activeCategory ? 'All' : cat.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="category-icon-wrapper">
                  <div className="category-icon-inner">{cat.icon}</div>
                </div>
                <div className="category-card-text">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                </div>
                <div className="category-card-arrow">&rarr;</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="healthy-choices-banner">
          <div className="healthy-banner-content">
            <div className="healthy-banner-icon">🎒🍏</div>
            <div className="healthy-banner-text">
              <h3>Healthy choices,</h3>
              <h2>happier days!</h2>
            </div>
          </div>
          <button
            className="healthy-banner-btn"
            onClick={() => window.open('https://www.who.int/news-room/fact-sheets/detail/healthy-diet', '_blank', 'noopener')}
          >
            Learn More &rarr;
          </button>
        </div>
      </div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
