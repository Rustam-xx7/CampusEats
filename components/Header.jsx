"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const {
    currentView,
    setCurrentView,
    cart,
    currentUser,
    userRole,
    isStaff,
    openAuthModal
  } = useApp();

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
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("home")}
        >
          <img
            alt="CSJMU Logo"
            className="h-9 w-auto object-contain"
            src="/csjm-university-logo.png"
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

        {/* Right: Actions, Role Badges & Switch Mode */}
        <div className="flex items-center gap-2">
          {/* Staff-Only Mode Switcher (Visible ONLY for verified kitchen staff on top navbar) */}
          {isStaff && (
            <button
              onClick={() =>
                setCurrentView(currentView === "admin" ? "home" : "admin")
              }
              className={`px-3.5 py-1.5 rounded-full font-body text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
                currentView === "admin"
                  ? "bg-[#c62828] text-white border-[#a20513] hover:bg-[#a20513]"
                  : "bg-[#a20513] text-white border-[#87000d] hover:bg-[#c62828] shadow-[0_2px_8px_rgba(162,5,19,0.25)]"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {currentView === "admin" ? "storefront" : "dashboard"}
              </span>
              <span>
                {currentView === "admin" ? "Student View" : "Staff Dashboard"}
              </span>
            </button>
          )}

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

          {/* User Profile Avatar / Sign In Trigger */}
          {currentUser ? (
            <button
              onClick={openAuthModal}
              title={`${currentUser.displayName || "User"} (${isStaff ? "Kitchen Staff" : "Student"})`}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#ffe9e3] transition-colors"
            >
              {currentUser.photoURL ? (
                <img
                  alt={currentUser.displayName || "User"}
                  src={currentUser.photoURL}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#a20513] shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#a20513] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {(currentUser.displayName || "U")[0]}
                </div>
              )}
              <span
                className={`hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isStaff ? "bg-[#c62828] text-white" : "bg-[#ffe9e3] text-[#a20513]"
                }`}
              >
                {isStaff ? "Staff" : "Student"}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3 py-1.5 rounded-full bg-[#a20513] text-white font-body text-xs font-bold hover:bg-[#c62828] flex items-center gap-1 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">
                login
              </span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
