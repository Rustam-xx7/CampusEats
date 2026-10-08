"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function MyOrdersView() {
  const { orders, setActiveTrackingToken, setCurrentView, addToCart, menuItems } = useApp();
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'history'
  const [userRatings, setUserRatings] = useState({});

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "cooking" || o.status === "ready"
  );
  const pastOrders = orders.filter((o) => o.status === "completed");

  const handleStarRating = (orderId, stars) => {
    setUserRatings((prev) => ({ ...prev, [orderId]: stars }));
  };

  const handleReorder = (order) => {
    order.items.forEach((itemObj) => {
      const match = menuItems.find(
        (mi) => mi.name.toLowerCase() === itemObj.name.toLowerCase()
      );
      if (match) {
        addToCart(match);
      }
    });
    setCurrentView("cart");
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 pt-3 px-4 space-y-4">
      {/* Segmented Tab Switcher */}
      <div className="bg-[#fbe3dc] p-1 rounded-full flex items-center justify-between shadow-xs border border-[#f5ddd7]">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 px-4 rounded-full font-body text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "active"
              ? "bg-[#a20513] text-white shadow-xs"
              : "text-[#5b403d] hover:text-[#251915]"
          }`}
        >
          <span>Active</span>
          <span className="w-5 h-5 rounded-full bg-[#feae2c] text-[#291800] font-body text-[10px] font-extrabold flex items-center justify-center">
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 rounded-full font-body text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[#a20513] text-white shadow-xs"
              : "text-[#5b403d] hover:text-[#251915]"
          }`}
        >
          <span>Past Orders</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f5ddd7] text-[#5b403d] font-body text-[10px]">
            {pastOrders.length > 0 ? pastOrders.length : 3}
          </span>
        </button>
      </div>

      {/* Active Orders Tab */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-headline text-2xl uppercase text-[#251915] tracking-wide">
              Live Campus Order
            </span>
            <span className="font-body text-xs text-[#a20513] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#a20513] animate-ping"></span>
              Live Tracker
            </span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-[#f5ddd7] space-y-2">
              <p className="font-body text-xs text-[#5b403d]">No active orders right now.</p>
              <button
                onClick={() => setCurrentView("menu")}
                className="px-4 py-2 rounded-full bg-[#a20513] text-white font-body text-xs font-bold"
              >
                Order Snacks Now
              </button>
            </div>
          ) : (
            activeOrders.map((ord) => (
              <div
                key={ord.token}
                className="relative bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(138,98,77,0.12)] border border-[#f5ddd7] overflow-hidden space-y-3"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#feae2c] via-[#c62828] to-[#a20513]"></div>

                {/* Token Header */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex flex-col">
                    <span className="font-body text-[10px] uppercase font-bold text-[#5b403d]">
                      Pickup Token
                    </span>
                    <span className="font-headline text-3xl text-[#a20513] leading-none mt-0.5">
                      #{ord.token}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffddb4] text-[#291800] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#835500] animate-pulse"></span>
                    <span className="font-body text-xs font-bold capitalize">
                      {ord.status === "cooking" ? "Preparing Fresh" : ord.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="bg-[#fff1ed] rounded-xl p-3 border border-[#f5ddd7]">
                  <div className="flex items-center justify-between text-[#5b403d] mb-1.5">
                    <span className="font-body text-xs font-bold text-[#a20513]">
                      In Kitchen
                    </span>
                    <span className="font-body text-xs font-bold text-[#835500]">
                      {ord.estimatedTime}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-2 w-full">
                    <div className="h-full rounded-full bg-[#a20513]"></div>
                    <div
                      className={`h-full rounded-full ${
                        ord.status === "cooking" || ord.status === "ready"
                          ? "bg-[#feae2c]"
                          : "bg-[#f5ddd7]"
                      }`}
                    ></div>
                    <div
                      className={`h-full rounded-full ${
                        ord.status === "ready" ? "bg-[#a20513]" : "bg-[#f5ddd7]"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#fbe3dc] flex items-center justify-center text-[#a20513] shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      storefront
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body text-xs font-bold text-[#251915] truncate">
                      {ord.pickupLocation}
                    </span>
                    <span className="font-body text-[11px] text-[#5b403d]">
                      Counter #2 • Express Window
                    </span>
                  </div>
                </div>

                {/* Food Items list */}
                <div className="bg-[#fff1ed] rounded-xl p-3 space-y-1.5 border border-[#f5ddd7]">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#ffdad6] text-[#410003] font-body text-[10px] font-bold flex items-center justify-center">
                          {it.qty}
                        </span>
                        <span className="font-body text-xs text-[#251915] font-semibold">
                          {it.name}
                        </span>
                      </div>
                      <span className="font-body text-xs font-bold text-[#251915]">
                        ₹{it.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Track Button */}
                <button
                  onClick={() => {
                    setActiveTrackingToken(ord.token);
                    setCurrentView("tracking");
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[#a20513] text-white font-body text-xs font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,40,40,0.28)] active:scale-95 transition-transform"
                >
                  <span>Track Live Order</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Past Orders Tab */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-headline text-2xl uppercase text-[#251915] tracking-wide">
              Previous Cravings
            </span>
            <span className="font-body text-xs text-[#5b403d]">Last 30 days</span>
          </div>

          {[
            {
              id: "CSJ-098",
              date: "Yesterday • 2:15 PM",
              items: "1x Paneer Kathi Roll, 1x Kulhad Chai",
              price: 70,
              location: "North Wing Cafeteria",
              rawOrder: {
                items: [
                  { name: "Paneer Tikka Roll", qty: 1, price: 60 },
                  { name: "Kulhad Masala Chai", qty: 1, price: 10 }
                ]
              }
            },
            {
              id: "CSJ-041",
              date: "14 Oct • 1:10 PM",
              items: "2x Chole Bhature, 1x Cold Coffee",
              price: 140,
              location: "Central Food Court",
              rawOrder: {
                items: [
                  { name: "Chole Bhature (2 pcs)", qty: 2, price: 100 },
                  { name: "Cold Coffee with Ice Cream", qty: 1, price: 40 }
                ]
              }
            },
            {
              id: "CSJ-012",
              date: "10 Oct • 11:30 AM",
              items: "1x Samosa Pair, 1x Masala Chai",
              price: 25,
              location: "Library Snack Bar",
              rawOrder: {
                items: [
                  { name: "Hot Punjabi Samosa (Pair)", qty: 1, price: 15 },
                  { name: "Kulhad Masala Chai", qty: 1, price: 10 }
                ]
              }
            }
          ].map((pastOrd) => {
            const currentRating = userRatings[pastOrd.id] || 5;

            return (
              <div
                key={pastOrd.id}
                className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex flex-col gap-3 border border-[#f5ddd7]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#fbe3dc] flex items-center justify-center text-[#a20513] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        lunch_dining
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-xs font-bold text-[#251915]">
                        #{pastOrd.id}
                      </span>
                      <span className="font-body text-[11px] text-[#5b403d]">
                        {pastOrd.date}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fbe3dc] text-[#835500] font-body text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px]">
                      check_circle
                    </span>
                    Collected
                  </span>
                </div>

                {/* Details */}
                <div className="bg-[#fff1ed] rounded-xl p-2.5 flex flex-col gap-0.5 border border-[#f5ddd7]">
                  <div className="flex items-center justify-between text-[#251915]">
                    <span className="font-body text-xs font-bold">
                      {pastOrd.items}
                    </span>
                    <span className="font-body text-xs font-extrabold text-[#a20513]">
                      ₹{pastOrd.price}
                    </span>
                  </div>
                  <span className="font-body text-[10px] text-[#5b403d]">
                    {pastOrd.location}
                  </span>
                </div>

                {/* Rating & Reorder */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-0.5 text-[#feae2c]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarRating(pastOrd.id, star)}
                        className="hover:scale-125 transition-transform"
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{
                            fontVariationSettings:
                              star <= currentRating ? "'FILL' 1" : "'FILL' 0"
                          }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleReorder(pastOrd.rawOrder)}
                    className="px-3.5 py-1.5 rounded-full bg-[#fbe3dc] text-[#a20513] hover:bg-[#a20513] hover:text-white font-body text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      replay
                    </span>
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
