"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { initialMenuItems } from "@/data/menuData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Menu items state (allows toggling availability from admin)
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  // Active view navigation ('home' | 'menu' | 'cart' | 'orders' | 'tracking' | 'admin')
  const [currentView, setCurrentView] = useState("home");

  // Cart state: Array of { item, quantity }
  const [cart, setCart] = useState([
    { item: initialMenuItems[0], quantity: 1 }, // Deluxe Veg Thali
    { item: initialMenuItems[1], quantity: 2 }  // Samosa Pair
  ]);

  // Coupon state
  const [coupon, setCoupon] = useState({
    code: "CSJMU20",
    discount: 20,
    applied: true
  });

  // Kitchen instructions note
  const [kitchenNotes, setKitchenNotes] = useState("");

  // Orders list (Initial mock active order + history)
  const [orders, setOrders] = useState([
    {
      id: "ORD-984210",
      token: "CSJ-142",
      studentName: "Aryan Sharma",
      studentRoll: "Roll #210459 • B.Tech CSE (3rd Yr)",
      phone: "+91 98380 12890",
      items: [
        { name: "Deluxe Veg Thali", qty: 1, price: 70 },
        { name: "Hot Punjabi Samosa (Pair)", qty: 2, price: 30 }
      ],
      subtotal: 100,
      discount: 20,
      gst: 4,
      total: 84,
      status: "cooking", // 'pending' | 'cooking' | 'ready' | 'completed'
      paymentMethod: "GPay (UPI)",
      pickupLocation: "Main Canteen Counter #2",
      estimatedTime: "~8 mins",
      timestamp: "1:15 PM",
      kitchenNotes: "Extra green chutney, serve rotis piping hot directly from tawa.",
      station: "thali fryer"
    },
    {
      id: "ORD-984211",
      token: "CSJ-145",
      studentName: "Priya Verma",
      studentRoll: "Roll #220812 • MBA (Executive)",
      phone: "+91 94150 99821",
      items: [
        { name: "Chole Bhature (2 pcs)", qty: 2, price: 100 },
        { name: "Kulhad Masala Chai", qty: 1, price: 10 }
      ],
      subtotal: 110,
      discount: 0,
      gst: 0,
      total: 110,
      status: "pending",
      paymentMethod: "CSJMU Smart Card",
      pickupLocation: "Main Canteen Counter #2",
      estimatedTime: "~10 mins",
      timestamp: "1:18 PM",
      kitchenNotes: "Less spicy chole please, extra pickled ginger on side.",
      station: "thali beverage"
    },
    {
      id: "ORD-984208",
      token: "CSJ-139",
      studentName: "Rahul Mishra",
      studentRoll: "Roll #190334 • BCA 3rd Yr",
      phone: "+91 98391 44510",
      items: [
        { name: "Paneer Tikka Roll", qty: 1, price: 60 },
        { name: "Cold Coffee with Ice Cream", qty: 1, price: 40 }
      ],
      subtotal: 100,
      discount: 0,
      gst: 0,
      total: 100,
      status: "ready",
      paymentMethod: "PhonePe UPI",
      pickupLocation: "Main Canteen Counter #2",
      estimatedTime: "Ready Now",
      timestamp: "1:10 PM",
      kitchenNotes: "Strictly no onions in roll. Extra tissue napkins requested.",
      station: "rolls beverage"
    }
  ]);

  // Active tracking token
  const [activeTrackingToken, setActiveTrackingToken] = useState("CSJ-142");

  // Rush mode state (+5 min prep time buffer signal)
  const [rushMode, setRushMode] = useState(false);

  // Stock availability toggle for 86 menu items
  const toggleStock = (itemId) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  // Calculate cart subtotal, discount, gst & total
  const cartSubtotal = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  const discountAmount =
    coupon.applied && cartSubtotal > 20 ? coupon.discount : 0;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const gstAmount = taxableAmount > 0 ? 4 : 0;
  const cartTotal = taxableAmount + gstAmount;

  // Place order action
  const placeOrder = (paymentMethodStr) => {
    const nextTokenNum = Math.floor(140 + Math.random() * 60);
    const newToken = `CSJ-${nextTokenNum}`;
    const newId = `ORD-${Math.floor(900000 + Math.random() * 99999)}`;

    const newOrder = {
      id: newId,
      token: newToken,
      studentName: "You (Student)",
      studentRoll: "Roll #230104 • CSJMU Campus",
      phone: "+91 98765 43210",
      items: cart.map((ci) => ({
        name: ci.item.name,
        qty: ci.quantity,
        price: ci.item.price * ci.quantity
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      gst: gstAmount,
      total: cartTotal,
      status: "pending",
      paymentMethod: paymentMethodStr || "GPay (UPI)",
      pickupLocation: "Main Canteen Counter #2",
      estimatedTime: "~8-10 mins",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      kitchenNotes: kitchenNotes || "Standard prep",
      station: "thali"
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingToken(newToken);
    clearCart();
    setCurrentView("tracking");
    return newOrder;
  };

  // Update order status (for Kitchen Admin panel)
  const updateOrderStatus = (token, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.token === token ? { ...ord, status: newStatus } : ord
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        menuItems,
        toggleStock,
        currentView,
        setCurrentView,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        discountAmount,
        gstAmount,
        cartTotal,
        coupon,
        setCoupon,
        kitchenNotes,
        setKitchenNotes,
        orders,
        placeOrder,
        updateOrderStatus,
        activeTrackingToken,
        setActiveTrackingToken,
        rushMode,
        setRushMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
