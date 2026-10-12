"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { initialMenuItems } from "@/data/menuData";
import {
  createOrderInFirebase,
  updateOrderStatusInFirebase,
  subscribeToOrdersFromFirebase
} from "@/server/orders";
import {
  updateMenuItemStockInFirebase,
  subscribeToMenuFromFirebase
} from "@/server/menu";
import {
  loginWithGoogle,
  logoutFromFirebase,
  saveUserProfileToFirestore,
  subscribeToAuthState,
  validateStaffId
} from "@/server/auth";
import { initiateRazorpayPayment } from "@/lib/razorpay";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Menu items state (stored in Firestore)
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  // Active view navigation ('home' | 'menu' | 'cart' | 'orders' | 'tracking' | 'admin')
  const [currentView, setCurrentView] = useState("home");

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("student"); // 'student' | 'staff'
  const [staffId, setStaffId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Orders list (Stored in Firebase Realtime Database)
  const [orders, setOrders] = useState([
    {
      orderId: "ORD-984210",
      id: "ORD-984210",
      orderNumber: "CSJ-142",
      token: "CSJ-142",
      userId: "user_210459",
      userName: "Aryan Sharma",
      studentName: "Aryan Sharma",
      studentRoll: "Roll #210459 • B.Tech CSE (3rd Yr)",
      phone: "+91 98380 12890",
      items: [
        { name: "Deluxe Veg Thali", quantity: 1, qty: 1, price: 70 },
        { name: "Hot Punjabi Samosa (Pair)", quantity: 2, qty: 2, price: 30 }
      ],
      subtotal: 100,
      discount: 20,
      gst: 4,
      total: 84,
      status: "cooking",
      paymentMethod: "GPay (UPI)",
      pickupLocation: "Main Canteen Counter #2",
      estimatedTime: "~8 mins",
      timestamp: "1:15 PM",
      kitchenNotes: "Extra green chutney, serve rotis piping hot directly from tawa.",
      station: "thali fryer",
      createdAt: "2026-10-12T01:15:00.000Z"
    },
    {
      orderId: "ORD-984211",
      id: "ORD-984211",
      orderNumber: "CSJ-145",
      token: "CSJ-145",
      userId: "user_220812",
      userName: "Priya Verma",
      studentName: "Priya Verma",
      studentRoll: "Roll #220812 • MBA (Executive)",
      phone: "+91 94150 99821",
      items: [
        { name: "Chole Bhature (2 pcs)", quantity: 2, qty: 2, price: 100 },
        { name: "Kulhad Masala Chai", quantity: 1, qty: 1, price: 10 }
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
      station: "thali beverage",
      createdAt: "2026-10-12T01:10:00.000Z"
    },
    {
      orderId: "ORD-984208",
      id: "ORD-984208",
      orderNumber: "CSJ-139",
      token: "CSJ-139",
      userId: "user_190334",
      userName: "Rahul Mishra",
      studentName: "Rahul Mishra",
      studentRoll: "Roll #190334 • BCA 3rd Yr",
      phone: "+91 98391 44510",
      items: [
        { name: "Paneer Tikka Roll", quantity: 1, qty: 1, price: 60 },
        { name: "Cold Coffee with Ice Cream", quantity: 1, qty: 1, price: 40 }
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
      station: "rolls beverage",
      createdAt: "2026-10-12T01:05:00.000Z"
    }
  ]);

  // Active tracking token
  const [activeTrackingToken, setActiveTrackingToken] = useState("CSJ-142");

  // Rush mode state (+5 min prep time buffer signal)
  const [rushMode, setRushMode] = useState(false);

  // 1. Subscribe to Firebase Auth state & Firestore user profile
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = subscribeToAuthState((user, profile) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "CSJMU User",
          photoURL: user.photoURL || ""
        });

        if (profile) {
          setUserRole(profile.role || "student");
          setStaffId(profile.staffId || "");
        } else {
          setUserRole("student");
          setStaffId("");
        }

        // Realtime listener for user data in Firestore
        if (typeof unsubscribeProfile === "function") unsubscribeProfile();
        const { subscribeToUserProfile } = require("@/server/auth");
        unsubscribeProfile = subscribeToUserProfile(user.uid, (updatedProfile) => {
          if (updatedProfile) {
            if (updatedProfile.role) setUserRole(updatedProfile.role);
            if (updatedProfile.staffId !== undefined) setStaffId(updatedProfile.staffId || "");
          }
        });
      } else {
        setCurrentUser(null);
        setUserRole("student");
        setStaffId("");
        if (typeof unsubscribeProfile === "function") unsubscribeProfile();
      }
    });

    return () => {
      if (typeof unsubscribeAuth === "function") unsubscribeAuth();
      if (typeof unsubscribeProfile === "function") unsubscribeProfile();
    };
  }, []);

  // 2. Realtime subscription to Firebase RTDB for Orders and Firestore for Menu
  useEffect(() => {
    // Orders stored in Realtime Database for instant state visibility
    const unsubscribeOrders = subscribeToOrdersFromFirebase(
      (rtdbOrders) => {
        if (rtdbOrders && rtdbOrders.length > 0) {
          const normalized = rtdbOrders.map((o) => ({
            ...o,
            id: o.orderId || o.id,
            token: o.orderNumber || o.token,
            studentName: o.userName || o.studentName || "CSJMU Student",
            studentRoll: o.userId ? `ID: ${o.userId}` : o.studentRoll || "Roll #230104",
            items: (o.items || []).map((it) => ({
              ...it,
              qty: it.quantity || it.qty || 1
            }))
          }));
          setOrders(normalized);
        }
      },
      (err) => {
        console.warn("Using local orders fallback:", err);
      }
    );

    // Menu stored in Cloud Firestore
    const unsubscribeMenu = subscribeToMenuFromFirebase(
      (firestoreMenu) => {
        if (firestoreMenu && firestoreMenu.length > 0) {
          setMenuItems(firestoreMenu);
        }
      },
      (err) => {
        console.warn("Using local menu fallback:", err);
      }
    );

    return () => {
      if (typeof unsubscribeOrders === "function") unsubscribeOrders();
      if (typeof unsubscribeMenu === "function") unsubscribeMenu();
    };
  }, []);

  // Auth operations
  const loginWithGoogleAuth = async () => {
    const { user, profile } = await loginWithGoogle();
    setCurrentUser(user);
    if (profile) {
      setUserRole(profile.role || "student");
      setStaffId(profile.staffId || "");
    } else {
      // Default to student if new user
      await saveUserProfileToFirestore(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "student"
      });
      setUserRole("student");
    }
    return user;
  };

  const logoutAuth = async () => {
    await logoutFromFirebase();
    setCurrentUser(null);
    setUserRole("student");
    setStaffId("");
    if (currentView === "admin") {
      setCurrentView("home");
    }
  };

  const updateUserRole = async (role, idInput) => {
    if (role === "staff") {
      if (!validateStaffId(idInput)) {
        throw new Error("Invalid Staff ID. Must be at least 3 characters.");
      }
    }

    setUserRole(role);
    setStaffId(role === "staff" ? idInput : "");

    if (currentUser) {
      await saveUserProfileToFirestore(currentUser.uid, {
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        role: role,
        staffId: role === "staff" ? idInput : null
      });
    }
  };

  // Stock availability toggle for 86 menu items (Stored in Firestore)
  const toggleStock = async (itemId) => {
    // Only staff can toggle stock
    if (userRole !== "staff") {
      alert("Only verified kitchen staff can manage menu stock.");
      return;
    }

    const targetItem = menuItems.find((item) => item.id === itemId);
    const newStatus = targetItem ? !targetItem.isAvailable : false;

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: newStatus } : item
      )
    );

    try {
      await updateMenuItemStockInFirebase(itemId, newStatus);
    } catch (err) {
      console.warn("Firestore menu stock update:", err.message);
    }
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
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

  // Place order action gated strictly by Razorpay payment:
  // ONLY if Razorpay payment succeeds, order is created in RTDB queue system!
  const placeOrderWithRazorpay = async (guestDetails = {}) => {
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Please add items to checkout.");
    }

    // Determine student name & identification
    const studentName =
      (currentUser && currentUser.displayName) ||
      (guestDetails.guestName && guestDetails.guestName.trim()) ||
      "";

    if (!studentName) {
      throw new Error("Student name is required to place an order.");
    }

    const studentRoll =
      (currentUser && (currentUser.email || currentUser.uid)) ||
      (guestDetails.guestRoll && guestDetails.guestRoll.trim()) ||
      "Campus Student";

    const studentPhone =
      (guestDetails.guestPhone && guestDetails.guestPhone.trim()) ||
      "+91 98765 43210";

    const email =
      (currentUser && currentUser.email) ||
      "canteen.student@csjmu.ac.in";

    // 1. Trigger Razorpay Payment Gate
    const paymentResult = await initiateRazorpayPayment({
      amount: cartTotal,
      studentName: studentName,
      studentRoll: studentRoll,
      phone: studentPhone,
      email: email,
      notes: {
        itemCount: cart.length,
        kitchenNotes: kitchenNotes || ""
      }
    });

    // 2. Strict Check: If payment was not successful, DO NOT CREATE ORDER!
    if (!paymentResult || !paymentResult.success) {
      return {
        success: false,
        cancelled: Boolean(paymentResult?.cancelled),
        error:
          paymentResult?.error ||
          paymentResult?.message ||
          "Payment not completed. Order was not created."
      };
    }

    // 3. PAYMENT WAS SUCCESSFUL: Now create the order in Realtime Database queue!
    const orderId = `ORD-${Math.floor(900000 + Math.random() * 99999)}`;
    const formattedItems = cart.map((ci) => ({
      name: ci.item.name,
      quantity: ci.quantity,
      qty: ci.quantity,
      price: ci.item.price * ci.quantity
    }));

    const orderPayload = {
      orderId: orderId,
      id: orderId,
      userId: currentUser ? currentUser.uid : `guest_${Date.now()}`,
      userName: studentName,
      studentName: studentName,
      studentRoll: studentRoll,
      phone: studentPhone,
      items: formattedItems,
      subtotal: cartSubtotal,
      discount: discountAmount,
      gst: gstAmount,
      total: cartTotal,
      status: "pending",
      paymentMethod: "Razorpay (UPI / Card)",
      paymentId: paymentResult.paymentId,
      razorpayOrderId: paymentResult.razorpayOrderId,
      paymentStatus: "paid",
      pickupLocation: "Main Canteen Counter #2",
      kitchenNotes: kitchenNotes || "Standard prep",
      station: "thali",
      createdAt: new Date().toISOString()
    };

    // Save in RTDB with sequential queue number & order token
    const createdOrder = await createOrderInFirebase(orderPayload);

    // Update client state & navigate to Live Tracking
    setOrders((prev) => [createdOrder, ...prev]);
    setActiveTrackingToken(createdOrder.orderNumber || createdOrder.token);
    clearCart();
    setCurrentView("tracking");

    return {
      success: true,
      order: createdOrder
    };
  };

  const placeOrder = placeOrderWithRazorpay;

  // Update order status (Guarded: ONLY kitchen staff can change order state!)
  const updateOrderStatus = async (tokenOrId, newStatus) => {
    if (userRole !== "staff") {
      alert("Permission Denied: Only verified kitchen staff can change order states.");
      return;
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.token === tokenOrId || ord.orderNumber === tokenOrId || ord.id === tokenOrId || ord.orderId === tokenOrId
          ? { ...ord, status: newStatus }
          : ord
      )
    );

    try {
      await updateOrderStatusInFirebase(tokenOrId, newStatus, userRole);
    } catch (err) {
      console.warn("RTDB order status update:", err.message);
    }
  };

  // Guard navigation to admin: only staff allowed
  const safeSetCurrentView = (view) => {
    if (view === "admin" && (!currentUser || userRole !== "staff")) {
      alert("Access Denied: The Kitchen Staff Admin portal is restricted to verified staff members only. Please log in with your Staff ID.");
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const isStaff = Boolean(currentUser && userRole === "staff");
  const isStudent = Boolean(!currentUser || userRole === "student");

  return (
    <AppContext.Provider
      value={{
        menuItems,
        toggleStock,
        currentView,
        setCurrentView: safeSetCurrentView,
        currentUser,
        userRole,
        staffId,
        isStaff,
        isStudent,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithGoogleAuth,
        logoutAuth,
        updateUserRole,
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
