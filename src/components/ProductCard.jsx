import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiMinus, HiCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, index }) {
  const { addItem, items } = useCart();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [added, setAdded] = useState(false);
  const [ripple, setRipple] = useState(null);
  const btnRef = useRef(null);

  let variants = [];
  try {
    if (product.variants) {
      variants =
        typeof product.variants === 'string'
          ? JSON.parse(product.variants)
          : product.variants;
    }
  } catch {
    variants = [];
  }

  const [quantity, setQuantity] = useState(1);

  const inCartCount = items
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleAdd = (e) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipple({ x, y, key: Date.now() });
      setTimeout(() => setRipple(null), 500);
    }
    addItem(product, selectedVariant || null, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(92, 64, 51, 0.12)',
      }}
    >
      <div className="product-card-image-wrapper">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-image-placeholder">🍽️</div>
        )}
        {inCartCount > 0 && (
          <span className="product-card-cart-badge">{inCartCount} in cart</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-info">
          <div className="product-card-header">
            {product.category && (
              <span className="product-card-category">{product.category}</span>
            )}
          </div>
          
          <h3 className="product-card-name">{product.name}</h3>
          {product.description && (
            <div className="product-card-description-wrapper" title={product.description}>
              <p className="product-card-description">{product.description}</p>
            </div>
          )}
        </div>

        <div className="product-card-footer">
          <div className="product-card-price">
            {product.price} <span>EGP</span>
          </div>

          <div className="product-card-action-group">
            {variants.length > 0 && (
              <select
                className="product-card-variant-select"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="" disabled>Choose variant</option>
                {variants.map((v, i) => (
                  <option key={i} value={typeof v === 'string' ? v : v.name || v.label}>
                    {typeof v === 'string' ? v : v.name || v.label}
                  </option>
                ))}
              </select>
            )}

            <div className="qty-selector">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <HiMinus />
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <HiPlus />
              </button>
            </div>

            <motion.button
              ref={btnRef}
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              title="Add to Cart"
            >
              {ripple && (
                <span
                  key={ripple.key}
                  className="ripple-effect"
                  style={{ left: ripple.x, top: ripple.y }}
                />
              )}
              {added ? <HiCheck /> : <HiPlus />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line w-40" />
        <div className="skeleton skeleton-line w-70" />
        <div className="skeleton skeleton-line w-100" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}
