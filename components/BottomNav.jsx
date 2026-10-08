"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
  const { currentView, setCurrentView, cart } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hide bottom nav in admin mode
  if (currentView === "admin") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-2">
        <div className="pointer-events-auto h-16 bg-[#ffffff]/95 backdrop-blur-xl rounded-full shadow-[0_12px_36px_rgba(66,38,26,0.16)] px-2 flex items-center justify-between relative border border-[#f5ddd7]/70">
          {/* Home */}
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

          {/* Menu */}
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

          {/* Center Cart Button */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={() => setCurrentView("cart")}
              aria-label="View Cart"
              className="absolute -top-7 w-14 h-14 rounded-full bg-[#c62828] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(198,40,40,0.32)] hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px]">
                shopping_bag
              </span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#feae2c] text-[#291800] font-body text-xs font-bold flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Orders */}
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

          {/* Staff Admin shortcut */}
          <button
            onClick={() => setCurrentView("admin")}
            className="flex-1 flex flex-col items-center justify-center h-12 text-[#5b403d] hover:text-[#a20513] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">
              admin_panel_settings
            </span>
            <span className="font-body text-[11px] leading-none mt-0.5">Staff</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
