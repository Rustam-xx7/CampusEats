"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
  const { currentView, setCurrentView, cart, currentUser, isStaff, openAuthModal } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hide bottom nav in admin mode
  if (currentView === "admin") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-2">
        <div className="pointer-events-auto h-16 bg-[#ffffff]/95 backdrop-blur-xl rounded-full shadow-[0_12px_36px_rgba(66,38,26,0.16)] px-2 flex items-center justify-between relative border border-[#f5ddd7]/70">
          {/* 1. Home */}
          <button
            onClick={() => setCurrentView("home")}
            className={`flex-1 flex flex-col items-center justify-center h-12 transition-colors ${
              currentView === "home"
                ? "text-[#a20513] font-bold"
                : "text-[#5b403d] hover:text-[#a20513]"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentView === "home" ? "'FILL' 1" : "'FILL' 0" }}
            >
              home
            </span>
            <span className="font-body text-[11px] leading-none mt-0.5">Home</span>
          </button>

          {/* 2. Menu */}
          <button
            onClick={() => setCurrentView("menu")}
            className={`flex-1 flex flex-col items-center justify-center h-12 transition-colors ${
              currentView === "menu"
                ? "text-[#a20513] font-bold"
                : "text-[#5b403d] hover:text-[#a20513]"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentView === "menu" ? "'FILL' 1" : "'FILL' 0" }}
            >
              restaurant_menu
            </span>
            <span className="font-body text-[11px] leading-none mt-0.5">Menu</span>
          </button>

          {/* 3. Center Cart Button (Exact Middle) */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={() => setCurrentView("cart")}
              aria-label="View Cart"
              className={`rounded-full bg-[#c62828] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(198,40,40,0.32)] hover:scale-105 active:scale-95 transition-all ${
                currentView === "cart"
                  ? "w-11 h-11 ring-2 ring-[#feae2c] shadow-[0_0_12px_rgba(254,174,44,0.35)]"
                  : "absolute -top-7 w-14 h-14"
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  currentView === "cart" ? "text-[20px]" : "text-[24px]"
                }`}
              >
                shopping_bag
              </span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#feae2c] text-[#291800] font-body text-xs font-bold flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* 4. Orders */}
          <button
            onClick={() => setCurrentView("orders")}
            className={`flex-1 flex flex-col items-center justify-center h-12 transition-colors ${
              currentView === "orders" || currentView === "tracking"
                ? "text-[#a20513] font-bold"
                : "text-[#5b403d] hover:text-[#a20513]"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings:
                  currentView === "orders" || currentView === "tracking" ? "'FILL' 1" : "'FILL' 0"
              }}
            >
              receipt_long
            </span>
            <span className="font-body text-[11px] leading-none mt-0.5">Orders</span>
          </button>

          {/* 5. User Profile Option (Always present on right side for both students & staff) */}
          <button
            onClick={openAuthModal}
            aria-label="User Profile"
            className="flex-1 flex flex-col items-center justify-center h-12 transition-colors text-[#5b403d] hover:text-[#a20513]"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || "User"}
                className="w-5 h-5 rounded-full object-cover border border-[#a20513] shadow-xs"
              />
            ) : (
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: currentUser ? "'FILL' 1" : "'FILL' 0"
                }}
              >
                {currentUser ? "account_circle" : "person"}
              </span>
            )}
            <span className="font-body text-[11px] leading-none mt-0.5 truncate max-w-[48px]">
              {currentUser ? (isStaff ? "Staff" : "Profile") : "Profile"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
