import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiPlus, HiMinus, HiOutlineTrash, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="cart-header">
              <h2>
                Your Cart
                {totalItems > 0 && (
                  <span className="cart-header-count">{totalItems}</span>
                )}
              </h2>
              <button className="cart-close-btn" onClick={onClose}>
                <HiOutlineX />
              </button>
            </div>

            <div className="cart-items">
              {items.length === 0 ? (
                <motion.div
                  className="cart-empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="cart-empty-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Browse our menu and add some delicious items!</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, padding: 0, margin: 0, overflow: 'hidden' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-placeholder">🍽️</div>
                      )}

                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.name}</div>
                        {item.variant && (
                          <div className="cart-item-variant">{item.variant}</div>
                        )}
                        <div className="cart-item-price">
                          {item.price * item.quantity} EGP
                          {item.original_price && (
                            <span className="cart-item-price-original">
                              {item.original_price * item.quantity} EGP
                            </span>
                          )}
                        </div>

                        <div className="cart-item-actions">
                          <motion.button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            whileTap={{ scale: 0.85 }}
                          >
                            <HiMinus />
                          </motion.button>
                          <motion.span
                            className="cart-qty"
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            whileTap={{ scale: 0.85 }}
                          >
                            <HiPlus />
                          </motion.button>

                          <motion.button
                            className="cart-item-remove"
                            onClick={() => removeItem(item.key)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <HiOutlineTrash />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <motion.div
                className="cart-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="cart-total-row">
                  <span className="cart-total-label">Total</span>
                  <motion.span
                    className="cart-total-value"
                    key={totalPrice}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {totalPrice} EGP
                  </motion.span>
                </div>

                <motion.button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout <HiArrowRight />
                </motion.button>

                <button className="cart-clear-btn" onClick={clearCart}>
                  Clear cart
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
