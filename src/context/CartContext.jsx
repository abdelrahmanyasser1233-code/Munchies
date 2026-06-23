import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'munchies_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cartReducer(state, action) {
  let newState;

  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity = 1 } = action.payload;
      const itemKey = variant ? `${product.id}_${variant}` : product.id;
      const existingIndex = state.findIndex(item => item.key === itemKey);

      if (existingIndex >= 0) {
        newState = state.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Use the discount price when it's a valid, lower sale price.
        const basePrice = Number(product.price) || 0;
        const discount = Number(product.discount_price);
        const hasDiscount =
          product.discount_price != null &&
          product.discount_price !== '' &&
          discount > 0 &&
          discount < basePrice;
        newState = [
          ...state,
          {
            key: itemKey,
            id: product.id,
            name: product.name,
            price: hasDiscount ? discount : basePrice,
            original_price: hasDiscount ? basePrice : null,
            image_url: product.image_url,
            variant: variant || null,
            quantity: quantity,
          },
        ];
      }
      break;
    }

    case 'REMOVE_ITEM': {
      newState = state.filter(item => item.key !== action.payload);
      break;
    }

    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        newState = state.filter(item => item.key !== key);
      } else {
        newState = state.map(item =>
          item.key === key ? { ...item, quantity } : item
        );
      }
      break;
    }

    case 'CLEAR_CART': {
      newState = [];
      break;
    }

    default:
      return state;
  }

  saveCart(newState);
  return newState;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  const addItem = (product, variant, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
  };

  const removeItem = (key) => {
    dispatch({ type: 'REMOVE_ITEM', payload: key });
  };

  const updateQuantity = (key, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
