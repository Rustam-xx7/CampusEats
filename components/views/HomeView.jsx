"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { categoriesList } from "@/data/menuData";

export default function HomeView() {
  const { menuItems, addToCart, updateQuantity, cart, setCurrentView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getItemQuantityInCart = (id) => {
    const found = cart.find((ci) => ci.item.id === id);
    return found ? found.quantity : 0;
  };

  const filteredItems = selectedCategory === "all"
    ? menuItems.slice(0, 5)
    : menuItems.filter((i) => i.category === selectedCategory);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 pt-3 space-y-5">
      {/* Pickup & Search Location Pill */}
      <section className="px-4">
        <div
          onClick={() => setCurrentView("menu")}
          className="h-[52px] bg-white rounded-full shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex items-center justify-between px-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border border-[#f5ddd7]"
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span
              className="material-symbols-outlined text-[#a20513] text-[20px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider leading-tight">
                Pickup Location
              </span>
              <div className="flex items-center space-x-1">
                <span className="font-body text-sm font-semibold text-[#251915] truncate leading-tight">
                  Main Canteen, CSJMU Campus
                </span>
                <span className="material-symbols-outlined text-[#251915] text-[18px] shrink-0">
                  expand_more
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#ffe9e3] flex items-center justify-center text-[#251915] hover:text-[#a20513] transition-colors shrink-0">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
        </div>
      </section>

      {/* Hero Promo Carousel Card */}
      <section className="px-4">
        <div className="relative bg-[#c62828] text-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(198,40,40,0.30)] p-5 flex flex-col justify-between min-h-[195px]">
          <div className="absolute -right-6 -bottom-8 w-44 h-44 rounded-full overflow-hidden pointer-events-none opacity-90 shadow-2xl">
            <img
              alt="Deluxe Veg Thali promo"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WQePUuSY_i--f0h3avUwhLDLsqlYtbh8tHgf6JMlNd0Wdvj6xGMX5Gj5HGT4UqhOHgY9STtXbnkQIfT3jhvcHsFfebpuYwi4m0Oy9gSR_SiU5W-hcUQXjhjoikXPHjq17psA9OhrGs1AOykqbH1MdtG_L9Jjw-cX16PSsSGiHA83JdBoPkpRpg9pnENb7T9rF_i-TXSy7GUdIrXtP2AhvDmA-s_93XKsoO0DBeDA"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#c62828] via-[#c62828]/85 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-[65%] space-y-1.5">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#feae2c] text-[#291800] text-[10px] font-body font-bold uppercase tracking-wider shadow-xs">
              Daily Campus Special
            </div>
            <h2 className="font-headline text-3xl uppercase leading-none tracking-wide text-white">
              FRESH. HOT. READY IN MINUTES.
            </h2>
            <p className="font-body text-xs text-[#ffe0dd] leading-tight">
              Skip the long queue. Order straight from your seat.
            </p>
          </div>

          <div className="relative z-10 pt-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentView("menu")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#a20513] font-body text-xs font-bold shadow-md active:scale-95 transition-transform"
            >
              <span>Order Now</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            {/* Indicator dots */}
            <div className="flex items-center space-x-1.5 pr-2">
              <span className="w-4 h-1.5 rounded-full bg-white transition-all"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Snap Carousel */}
      <section className="space-y-2">
        <div className="px-4 flex items-center justify-between">
          <span className="font-body text-sm font-bold text-[#251915] uppercase tracking-wide">
            Explore Categories
          </span>
          <button
            onClick={() => setCurrentView("menu")}
            className="font-body text-xs font-bold text-[#a20513] hover:underline"
          >
            {categoriesList.length} Categories
          </button>
        </div>

        <div className="flex space-x-3 overflow-x-auto px-4 scrollbar-none py-1">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex flex-col items-center justify-center w-[74px] h-[82px] rounded-[20px] transition-transform active:scale-95 ${
                  isActive
                    ? "bg-[#a20513] text-white shadow-[0_6px_16px_rgba(162,5,19,0.25)]"
                    : "bg-white text-[#251915] shadow-[0_4px_16px_rgba(138,98,77,0.06)] hover:bg-[#fff1ed]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? "bg-white/20" : "bg-[#ffe9e3] text-[#a20513]"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {cat.icon}
                  </span>
                </div>
                <span className="font-body text-xs font-semibold tracking-tight mt-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Picks Section */}
      <section className="px-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-headline text-2xl text-[#251915] uppercase tracking-wide">
              Popular Picks
            </h3>
            <span className="w-2 h-2 rounded-full bg-[#a20513] animate-pulse"></span>
          </div>
          <button
            onClick={() => setCurrentView("menu")}
            className="font-body text-xs font-bold text-[#a20513] hover:underline flex items-center gap-0.5"
          >
            View All <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qty = getItemQuantityInCart(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex items-center gap-3.5 relative overflow-hidden transition-all border border-[#f5ddd7]/40"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#ffe9e3] relative shadow-inner">
                  <img
                    alt={item.name}
                    className={`w-full h-full object-cover ${!item.isAvailable ? "grayscale opacity-60" : ""}`}
                    src={item.image}
                  />
                  {/* Veg Tag */}
                  <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-sm bg-white shadow-sm flex items-center justify-center">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? "bg-emerald-600" : "bg-amber-600"
                      }`}
                    ></span>
                  </span>
                  {/* Rating */}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-body font-bold text-[#835500] flex items-center gap-0.5 shadow-sm">
                    ★ {item.rating}
                  </span>
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0 pr-1">
                  <div>
                    <h4 className="font-body text-sm font-bold text-[#251915] truncate">
                      {item.name}
                    </h4>
                    <p className="font-body text-xs text-[#5b403d] line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-baseline space-x-1">
                      <span className="font-body text-base font-extrabold text-[#a20513]">
                        ₹{item.price}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="font-body text-[11px] text-[#5b403d] line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    {!item.isAvailable ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] font-body text-[10px] font-bold">
                        Sold Out
                      </span>
                    ) : qty > 0 ? (
                      <div className="h-8 px-2 rounded-full bg-[#ffe9e3] flex items-center space-x-2 text-[#251915] shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[#5b403d] hover:text-[#251915] active:scale-90 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="font-body text-xs font-bold text-[#251915] min-w-[12px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[#a20513] hover:text-[#c62828] active:scale-90 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-[#c62828] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(198,40,40,0.30)] active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student Rewards Banner Card */}
      <section className="px-4 pt-1">
        <div className="bg-[#ffe9e3] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(138,98,77,0.06)] border border-[#f5ddd7]">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#feae2c] text-[#291800] flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-body text-xs font-bold text-[#251915] uppercase tracking-wide">
                  Campus Perks
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#ffb955] text-[#291800] font-body text-[10px] font-extrabold">
                  10 pts/₹100
                </span>
              </div>
              <span className="font-body text-xs text-[#5b403d] leading-tight truncate">
                Flash student ID card at counter for free dessert!
              </span>
            </div>
          </div>
          <button
            onClick={() => setCurrentView("menu")}
            className="shrink-0 px-3.5 py-2 rounded-full bg-[#a20513] text-white font-body text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Join Perks
          </button>
        </div>
      </section>
    </div>
  );
}
