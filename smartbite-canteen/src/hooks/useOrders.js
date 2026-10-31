import { useState, useEffect } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem("smartbite_orders");
      return cached ? JSON.parse(cached) : [
        {
          id: "ORD-9421",
          items: [
            { id: 1, name: "Masala Dosa", price: 60, quantity: 2 },
            { id: 3, name: "Cold Coffee", price: 45, quantity: 1 }
          ],
          total: 165,
          status: "Ready for Pickup",
          pickupCode: "BITE-9421",
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          paymentStatus: "PAID"
        },
        {
          id: "ORD-9388",
          items: [
            { id: 2, name: "Paneer Burger", price: 80, quantity: 1 },
            { id: 5, name: "French Fries", price: 50, quantity: 1 }
          ],
          total: 130,
          status: "Completed",
          pickupCode: "BITE-9388",
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          paymentStatus: "PAID"
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("smartbite_orders", JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const addOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  return { orders, addOrder };
};

