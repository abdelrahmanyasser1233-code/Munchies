import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchProducts } from '../lib/supabase';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import './MenuPage.css';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadProducts();
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
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <motion.div
      className="menu-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero */}
      <section className="menu-hero">
        <div className="menu-hero-container">
          <motion.div
            className="menu-hero-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/Mobile.png" />
              <img src="/Desktop.png" alt="Munchies Hero Background" className="hero-image" />
            </picture>
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
              <span className="view-full">View Full Menu &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="menu-content">
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
            ].map(cat => (
              <div 
                key={cat.id} 
                className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id === activeCategory ? 'All' : cat.id)}
              >
                <div className="category-icon-wrapper">
                  <div className="category-icon-inner">{cat.icon}</div>
                </div>
                <div className="category-card-text">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                </div>
                <div className="category-card-arrow">&rarr;</div>
              </div>
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
          <button className="healthy-banner-btn">Learn More &rarr;</button>
        </div>
      </div>
    </motion.div>
  );
}
