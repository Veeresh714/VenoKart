import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // useCallback memoizes this function so it doesn't get recreated on
  // every render - important since we use it inside useEffect's
  // dependency array below (prevents an infinite effect loop).
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/api/cart");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Whenever login state changes, refresh (or clear) the cart.
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [] }); // clear cart display on logout
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/api/cart", { productId, quantity });
    setCart(data);
    return data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const { data } = await api.put(`/api/cart/${itemId}`, { quantity });
    setCart(data);
    return data;
  };

  const removeCartItem = async (itemId) => {
    const { data } = await api.delete(`/api/cart/${itemId}`);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    await api.delete("/api/cart");
    setCart({ items: [] });
  };

  // Derived values - calculated fresh on every render from cart.items,
  // rather than stored as separate state (which could get out of sync).
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    cart,
    loading,
    itemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
