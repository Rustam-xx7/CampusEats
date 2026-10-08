"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const { currentView, setCurrentView, cart } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getTitle = () => {
    switch (currentView) {
      case "menu":
        return "- Menu";
      case "cart":
        return "- Cart";
      case "orders":
        return "- Orders";
      case "tracking":
        return "- Live Tracking";
      case "admin":
        return "- Admin Terminal";
      default:
        return "- Home";
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fff8f6]/95 backdrop-blur-xl pt-safe shadow-[0_4px_16px_rgba(138,98,77,0.08)] border-b border-[#f5ddd7]/60">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & View Title */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView("home")}>
          <img
            alt="CSJMU Logo"
            className="h-9 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Ue2iK4qEgYI5XQE6GNTZ4-tX9MvmKGqzC5uiR1PD-xWmeWWlnhqL1QL1BOFpe9wgiaXefHWMDb4V30p7m84TlaRr5gZGJ2XMPsgW5CmjD7e8dBIds4X8Yw8IvSwAPr-7AjinK9lguPJ2qc_8z6Bey6rTIDQZVfSiWNzr8l3mSLRBHK2NosHX1jFFkf6YYA6UlpSqtE8RuolF-A_pucXzRNnQKfocmJWFAp7411oYcJnoR7aqGPHCs8"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-xl uppercase text-[#a20513] leading-none tracking-wide">
                CSJMU CAFE
              </span>
              <span className="font-body text-xs font-semibold text-[#251915] leading-none hidden sm:inline">
                {getTitle()}
              </span>
            </div>
            <span className="font-body text-[11px] text-[#5b403d] leading-none">
              Campus Canteen
            </span>
          </div>
        </div>

        {/* Right: Switch Mode & Actions */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher Pill */}
          <button
            onClick={() => setCurrentView(currentView === "admin" ? "home" : "admin")}
            className={`px-3 py-1.5 rounded-full font-body text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
              currentView === "admin"
                ? "bg-[#c62828] text-white border-[#a20513] hover:bg-[#a20513]"
                : "bg-[#ffe9e3] text-[#a20513] border-[#f5ddd7] hover:bg-[#fbe3dc]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {currentView === "admin" ? "smartphone" : "admin_panel_settings"}
            </span>
            <span>{currentView === "admin" ? "Mobile Student View" : "Staff Admin Panel"}</span>
          </button>

          {/* Cart Icon Quick Link */}
          {currentView !== "admin" && (
            <button
              onClick={() => setCurrentView("cart")}
              aria-label="Cart"
              className="w-10 h-10 rounded-full bg-[#ffe9e3] flex items-center justify-center text-[#251915] relative hover:bg-[#fbe3dc] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#a20513]">
                shopping_bag
              </span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-[#feae2c] text-[#291800] font-body text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#a20513] flex items-center justify-center shadow-[0_2px_8px_rgba(162,5,19,0.25)] shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
