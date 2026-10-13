"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { initialMenuItems } from "@/data/menuData";
import { rtdb, auth } from "@/server/firebase";
import {
  createOrderInFirebase,
  updateOrderStatusInFirebase,
  subscribeToMyOrders,
  subscribeToAllOrders,
} from "@/server/orders";
import {
  updateMenuItemStockInFirebase,
  subscribeToMenuFromFirebase,
  saveMenuItemInFirebase,
} from "@/server/menu";
import {
  loginWithGoogle,
  logoutFromFirebase,
  saveUserProfileToFirestore,
  subscribeToAuthState,
  subscribeToUserProfile,
} from "@/server/auth";
import { initiateRazorpayPayment } from "@/lib/razorpay";

const AppContext = createContext();

export function AppProvider({ children }) {
  // ---------- Menu (Cloud Firestore) ----------
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  // ---------- Navigation ----------
  // 'home' | 'menu' | 'cart' | 'orders' | 'tracking' | 'admin'
  const [currentView, setCurrentView] = useState("home");

  // ---------- Auth & role ----------
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("student"); // 'student' | 'staff' (comes from /admins in RTDB)
  const [staffId, setStaffId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ---------- Cart ----------
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState({ code: "CSJMU20", discount: 20, applied: true });
  const [kitchenNotes, setKitchenNotes] = useState("");

  // ---------- Orders (Realtime Database) ----------
  const [orders, setOrders] = useState([]);
  const [activeTrackingToken, setActiveTrackingToken] = useState("");
  const [rushMode, setRushMode] = useState(false);

  // =====================================================
  // 1. Auth state, staff check, and profile listener
  // =====================================================
  useEffect(() => {
    let unsubscribeProfile = null;
    let cancelled = false;

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      if (typeof unsubscribeProfile === "function") {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        setCurrentUser(null);
        setUserRole("student");
        setStaffId("");
        return;
      }

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "CSJMU User",
        photoURL: user.photoURL || "",
      });

      // Staff = /admins/<uid> === true (you set this in the Firebase Console)
      try {
        const snap = await get(ref(rtdb, `admins/${user.uid}`));
        if (!cancelled) setUserRole(snap.val() === true ? "staff" : "student");
      } catch {
        if (!cancelled) setUserRole("student");
      }

      // Listener starts only after login, so Firestore sees an authenticated user
      unsubscribeProfile = subscribeToUserProfile(user.uid, (profile) => {
        if (profile && profile.staffId !== undefined) setStaffId(profile.staffId || "");
      });
    });

    return () => {
      cancelled = true;
      if (typeof unsubscribeAuth === "function") unsubscribeAuth();
      if (typeof unsubscribeProfile === "function") unsubscribeProfile();
    };
  }, []);

  // =====================================================
  // 2. Orders: students see their own, staff see all.
  //    Starts only after login and after the role is known.
  // =====================================================
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    const normalize = (list) =>
      list.map((o) => ({
        ...o,
        id: o.orderId || o.id,
        token: o.orderNumber || o.token,
        studentName: o.userName || o.studentName || "CSJMU Student",
        items: (o.items || []).map((it) => ({
          ...it,
          qty: it.quantity || it.qty || 1,
        })),
      }));

    const onErr = (err) => console.error("Orders listener failed:", err.message);

    const unsub =
      userRole === "staff"
        ? subscribeToAllOrders((list) => setOrders(normalize(list)), onErr)
        : subscribeToMyOrders(currentUser.uid, (list) => setOrders(normalize(list)), onErr);

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [currentUser?.uid, userRole]);

  // =====================================================
  // 3. Menu: public read, no login needed
  // =====================================================
  useEffect(() => {
    const unsub = subscribeToMenuFromFirebase(
      (firestoreMenu) => {
        if (firestoreMenu && firestoreMenu.length > 0) setMenuItems(firestoreMenu);
      },
      (err) => console.error("Menu listener failed:", err?.message || err)
    );
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // =====================================================
  // Auth operations
  // =====================================================
  const loginWithGoogleAuth = async () => {
    const { user, profile } = await loginWithGoogle();
    setCurrentUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "CSJMU User",
      photoURL: user.photoURL || "",
    });

    if (!profile) {
      // No "role" field here: the Firestore rules do not let users set their own role
      try {
        await saveUserProfileToFirestore(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } catch (err) {
        console.error("Could not save profile:", err.message);
      }
    }
    return user;
  };

  const logoutAuth = async () => {
    await logoutFromFirebase();
    setCurrentUser(null);
    setUserRole("student");
    setStaffId("");
    setOrders([]);
    if (currentView === "admin") setCurrentView("home");
  };

  // Staff access can no longer be self-assigned in the browser.
  // An owner adds /admins/<uid>: true in the Firebase Console.
    // Staff access: the passcode is checked on the server, never in the browser
  const updateUserRole = async (role, passcode) => {
    if (role !== "staff") return;        // everyone is a student by default
    if (userRole === "staff") return;    // already staff

    if (!auth.currentUser) throw new Error("Please log in first.");
    const idToken = await auth.currentUser.getIdToken();

    const res = await fetch("/api/staff/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Could not verify the passcode.");
    }
    setUserRole("staff");
  };

    const claimStaffAccess = async (passcode) => {
    if (!auth.currentUser) throw new Error("Please log in first.");
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/staff/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.error || "Could not verify passcode.");
    setUserRole("staff");
    return true;
  };

  // =====================================================
  // Menu management (staff only, enforced by Firestore rules too)
  // UI updates only AFTER the database write succeeds.
  // =====================================================
  const addMenuItem = async (newItemData) => {
    if (userRole !== "staff") {
      alert("Only verified kitchen staff can add menu items.");
      return null;
    }

    const newItem = {
      id: Date.now(),
      name: newItemData.name || "New Item",
      description: newItemData.description || "",
      price: Number(newItemData.price || 0),
      originalPrice: Number(newItemData.originalPrice || newItemData.price || 0),
      category: newItemData.category || "Meals",
      image: newItemData.image || "/menu/cholebhature.jpg",
      isVeg: true,
      prepTime: newItemData.prepTime || "10 mins",
      rating: 4.8,
      badge: newItemData.badge || "New",
      station: newItemData.station || "thali",
      isAvailable: true,
      stockCount: Number(newItemData.stockCount || 20),
    };

    try {
      await saveMenuItemInFirebase(newItem);
      setMenuItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      alert("Could not save the menu item: " + err.message);
      return null;
    }
  };

  const toggleStock = async (itemId) => {
    if (userRole !== "staff") {
      alert("Only verified kitchen staff can manage menu stock.");
      return;
    }

    const targetItem = menuItems.find((item) => item.id === itemId);
    if (!targetItem) return;
    const newStatus = !targetItem.isAvailable;

    try {
      await updateMenuItemStockInFirebase(itemId, newStatus);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isAvailable: newStatus } : item))
      );
    } catch (err) {
      alert("Could not update stock: " + err.message);
    }
  };

  // =====================================================
  // Cart
  // =====================================================
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) =>
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
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

  const cartSubtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const discountAmount = coupon.applied && cartSubtotal > 20 ? coupon.discount : 0;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const gstAmount = taxableAmount > 0 ? 4 : 0;
  const cartTotal = taxableAmount + gstAmount;

  // =====================================================
  // Place order: pay with Razorpay, create the order as UNPAID,
  // then the server verifies the payment and marks it "paid".
  // =====================================================
  const placeOrderWithRazorpay = async (guestDetails = {}) => {
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Please add items to checkout.");
    }
    if (!currentUser) {
      setIsAuthModalOpen(true);
      throw new Error("Please log in to place an order.");
    }

    const studentName =
      currentUser.displayName || (guestDetails.guestName && guestDetails.guestName.trim()) || "";
    if (!studentName) throw new Error("Student name is required to place an order.");

    const studentRoll =
      currentUser.email ||
      (guestDetails.guestRoll && guestDetails.guestRoll.trim()) ||
      currentUser.uid;

    const studentPhone = guestDetails.guestPhone && guestDetails.guestPhone.trim();
    if (!studentPhone) throw new Error("Please enter your phone number.");

    // 1. Razorpay payment
    const paymentResult = await initiateRazorpayPayment({
      amount: cartTotal,
      studentName,
      studentRoll,
      phone: studentPhone,
      email: currentUser.email || "",
      notes: { itemCount: cart.length, kitchenNotes: kitchenNotes || "" },
    });

    // 2. No successful payment, no order
    if (!paymentResult || !paymentResult.success) {
      return {
        success: false,
        cancelled: Boolean(paymentResult?.cancelled),
        error:
          paymentResult?.error ||
          paymentResult?.message ||
          "Payment not completed. Order was not created.",
      };
    }

    // 3. Create the order as "pending" payment (the browser cannot mark it paid)
    const createdOrder = await createOrderInFirebase({
      userName: studentName,
      studentRoll,
      phone: studentPhone,
      items: cart.map((ci) => ({
        name: ci.item.name,
        quantity: ci.quantity,
        price: ci.item.price, // unit price
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      gst: gstAmount,
      total: cartTotal,
      paymentMethod: "Razorpay (UPI / Card)",
      razorpayOrderId: paymentResult.razorpayOrderId || "",
      kitchenNotes: kitchenNotes || "Standard prep",
    });

    // 4. Server verifies the Razorpay signature and sets paymentStatus: "paid"
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrder.orderId,
        razorpay_order_id: paymentResult.razorpayOrderId,
        razorpay_payment_id: paymentResult.paymentId,
        razorpay_signature: paymentResult.signature,
      }),
    });
    if (!res.ok) {
      throw new Error(
        "Payment could not be verified. Please contact the canteen with your payment ID."
      );
    }

    // The orders listener refreshes the list automatically
    setActiveTrackingToken(createdOrder.orderNumber);
    clearCart();
    setCurrentView("tracking");

    return { success: true, order: createdOrder };
  };

  const placeOrder = placeOrderWithRazorpay;

  // =====================================================
  // Order status (staff only; the database rules enforce it as well)
  // =====================================================
  const updateOrderStatus = async (tokenOrId, newStatus) => {
    if (userRole !== "staff") {
      alert("Permission Denied: Only verified kitchen staff can change order states.");
      return;
    }

    const target = orders.find(
      (o) =>
        o.id === tokenOrId ||
        o.orderId === tokenOrId ||
        o.token === tokenOrId ||
        o.orderNumber === tokenOrId
    );

    try {
      await updateOrderStatusInFirebase(target?.id || tokenOrId, newStatus);
    } catch (err) {
      alert("Could not update the order: " + err.message);
    }
  };

  // =====================================================
  // Navigation guard
  // =====================================================
  const safeSetCurrentView = (view) => {
    if (view === "admin" && (!currentUser || userRole !== "staff")) {
      alert(
        "Access Denied: The Kitchen Staff Admin portal is restricted to verified staff members only."
      );
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
        claimStaffAccess,
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
        addMenuItem,
        rushMode,
        setRushMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}