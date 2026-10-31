import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("smartbite_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage on every cart change
  useEffect(() => {
    try {
      localStorage.setItem("smartbite_cart", JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  // Add Item to cart
  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove item by id
  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Increase quantity by 1
  const increaseQuantity = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  // Decrease quantity by 1 (removes if quantity reaches 0)
  const decreaseQuantity = (id) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity - 1;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  // Generic update with delta
  const updateQuantity = (id, delta) => {
    if (delta > 0) {
      increaseQuantity(id);
    } else {
      decreaseQuantity(id);
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Immediate reactive calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [items]);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        subtotal,
        totalAmount: subtotal, // alias for backwards compatibility
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
