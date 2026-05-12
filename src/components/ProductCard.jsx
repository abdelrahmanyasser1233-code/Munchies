import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, index }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [added, setAdded] = useState(false);

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

  const handleAdd = () => {
    addItem(product, selectedVariant || null, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
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
                {variants.map((v, i) => (
                  <option key={i} value={typeof v === 'string' ? v : v.name || v.label}>
                    {typeof v === 'string' ? v : v.name || v.label}
                  </option>
                ))}
              </select>
            )}

            <motion.button
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              title="Add to Cart"
            >
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
