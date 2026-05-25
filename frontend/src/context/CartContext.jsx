import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/index.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET': return { ...state, items: action.payload, loading: false };
    case 'LOADING': return { ...state, loading: action.payload };
    case 'CLEAR': return { ...state, items: [] };
    default: return state;
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, { items: [], loading: false });

  const fetchCart = useCallback(async () => {
    if (!user) { dispatch({ type: 'CLEAR' }); return; }
    dispatch({ type: 'LOADING', payload: true });
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: 'SET', payload: data.data.items });
    } catch { dispatch({ type: 'LOADING', payload: false }); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (product_id, quantity, size, color) => {
    await cartAPI.add({ product_id, quantity, size, color });
    await fetchCart();
  };

  const updateItem = async (itemId, quantity) => {
    await cartAPI.update(itemId, quantity);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartAPI.remove(itemId);
    await fetchCart();
  };

  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const total = state.items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, count, total, addItem, updateItem, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
