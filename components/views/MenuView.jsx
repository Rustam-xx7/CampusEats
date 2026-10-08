"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function MenuView() {
  const { menuItems, addToCart, updateQuantity, cart, cartTotal, setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const getItemQuantityInCart = (id) => {
    const found = cart.find((ci) => ci.item.id === id);
    return found ? found.quantity : 0;
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet =
      dietFilter === "all" ||
      (dietFilter === "veg" && item.isVeg) ||
      (dietFilter === "egg" && item.isEgg);
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesDiet && matchesCategory;
  });

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 pt-3 space-y-4 px-4">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-12 bg-white rounded-full shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex items-center px-4 gap-2 border border-[#f5ddd7]">
          <span className="material-symbols-outlined text-[#a20513] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search samosa, chai, thali, rolls..."
            className="w-full bg-transparent border-0 outline-none font-body text-xs text-[#251915] placeholder:text-[#5b403d]/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#5b403d] hover:text-[#251915]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Veg Quick Switch Strip & Prep Time Note */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center bg-[#fbe3dc] rounded-full p-1 shadow-xs border border-[#f5ddd7]">
            <button
              onClick={() => setDietFilter("all")}
              className={`px-3 py-1 rounded-full font-body text-xs font-semibold transition-all flex items-center gap-1.5 ${
                dietFilter === "all"
                  ? "bg-white text-[#251915] shadow-xs font-bold"
                  : "text-[#5b403d] hover:text-[#251915]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#a20513]"></span>
              All
            </button>
            <button
              onClick={() => setDietFilter("veg")}
              className={`px-3 py-1 rounded-full font-body text-xs font-semibold transition-all flex items-center gap-1.5 ${
                dietFilter === "veg"
                  ? "bg-white text-[#251915] shadow-xs font-bold"
                  : "text-[#5b403d] hover:text-[#251915]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Pure Veg
            </button>
            <button
              onClick={() => setDietFilter("egg")}
              className={`px-3 py-1 rounded-full font-body text-xs font-semibold transition-all flex items-center gap-1.5 ${
                dietFilter === "egg"
                  ? "bg-white text-[#251915] shadow-xs font-bold"
                  : "text-[#5b403d] hover:text-[#251915]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Egg
            </button>
          </div>

          <span className="font-body text-xs text-[#5b403d] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#835500]">
              bolt
            </span>
            6 mins avg
          </span>
        </div>

        {/* Category Horizontal Scroll Tray */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4">
          {[
            { id: "all", label: "All Items", icon: "dinner_dining" },
            { id: "Snacks", label: "Quick Snacks", icon: "fastfood" },
            { id: "Meals", label: "Campus Meals", icon: "rice_bowl" },
            { id: "Rolls", label: "Rolls & Wraps", icon: "kebab_dining" },
            { id: "Drinks", label: "Hot Chai & Drinks", icon: "emoji_food_beverage" },
            { id: "Desserts", label: "Sweet Treats", icon: "icecream" }
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full font-body text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-[#a20513] text-white shadow-sm font-bold"
                    : "bg-white text-[#5b403d] shadow-xs border border-[#f5ddd7] hover:text-[#251915]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-baseline gap-1">
          <h2 className="font-headline text-2xl text-[#251915] uppercase tracking-wide">
            Cafeteria Specials
          </h2>
          <span className="font-body text-xs text-[#5b403d]">
            ({filteredItems.length} Options)
          </span>
        </div>
        <span className="font-body text-xs text-[#a20513] font-bold flex items-center gap-1">
          Kitchen Open
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </span>
      </div>

      {/* Food Catalog List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const qty = getItemQuantityInCart(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex gap-3.5 relative overflow-hidden transition-all border border-[#f5ddd7]/50"
            >
              <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative bg-[#ffe9e3]">
                <img
                  alt={item.name}
                  className={`w-full h-full object-cover ${!item.isAvailable ? "grayscale opacity-60" : ""}`}
                  src={item.image}
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.isVeg ? "bg-emerald-600" : "bg-amber-600"
                    }`}
                  ></span>
                  <span className="font-body text-[10px] text-[#251915] font-bold">
                    {item.isVeg ? "Veg" : "Egg"}
                  </span>
                </div>
                {item.badge && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-[#feae2c] text-[#291800] font-body text-[10px] font-bold shadow-xs">
                    {item.badge}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-body text-sm text-[#251915] font-bold truncate leading-tight">
                    {item.name}
                  </h3>
                  <p className="font-body text-xs text-[#5b403d] line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1">
                  <div className="flex flex-col">
                    <span className="font-body text-base text-[#a20513] font-extrabold">
                      ₹{item.price}
                    </span>
                    <span className="font-body text-[11px] text-[#5b403d] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px] text-[#835500]">
                        schedule
                      </span>{" "}
                      {item.prepTime}
                    </span>
                  </div>

                  {!item.isAvailable ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] font-body text-[10px] font-bold">
                      Sold Out
                    </span>
                  ) : qty > 0 ? (
                    <div className="flex items-center bg-[#ffe9e3] rounded-full px-1 py-0.5 shadow-xs border border-[#f5ddd7]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white text-[#251915] flex items-center justify-center hover:bg-[#ffe9e3] active:scale-90 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          remove
                        </span>
                      </button>
                      <span className="font-body text-xs font-bold text-[#251915] px-2">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#a20513] text-white flex items-center justify-center hover:bg-[#c62828] active:scale-90 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-3.5 py-1.5 rounded-full bg-[#c62828] text-white font-body text-xs font-bold flex items-center gap-1 shadow-[0_4px_12px_rgba(198,40,40,0.24)] active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span> Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Lunch Combo Banner */}
      <div className="mt-2 p-3.5 rounded-2xl bg-[#ffe9e3] flex items-center justify-between shadow-xs border border-[#f5ddd7] relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#feae2c] text-[#291800] flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div>
            <h4 className="font-body text-xs font-bold text-[#251915] leading-tight">
              Student Combo Special
            </h4>
            <p className="font-body text-xs text-[#5b403d]">Samosa + Kulhad Chai for ₹22</p>
          </div>
        </div>
        <button
          onClick={() => {
            const samosa = menuItems.find((i) => i.id === 2);
            const chai = menuItems.find((i) => i.id === 4);
            if (samosa) addToCart(samosa);
            if (chai) addToCart(chai);
          }}
          className="relative z-10 px-3.5 py-1.5 rounded-full bg-white text-[#a20513] font-body text-xs font-bold shadow-xs hover:bg-white/90 active:scale-95 transition-all"
        >
          Apply Combo
        </button>
      </div>

      {/* Floating Bottom Cart Summary Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-xl rounded-full px-4 py-2.5 shadow-[0_12px_36px_rgba(66,38,26,0.18)] flex items-center justify-between gap-2 border border-[#f5ddd7]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#c62828] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body text-xs font-bold text-[#251915] leading-none">
                  {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"} in Cart
                </span>
                <span className="font-body text-xs text-[#a20513] font-extrabold leading-tight mt-0.5">
                  ₹{cartTotal} Total
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("cart")}
              className="px-4 py-2 rounded-full bg-[#c62828] text-white font-body text-xs font-bold flex items-center gap-1 shadow-[0_4px_16px_rgba(198,40,40,0.32)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>View Cart</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
