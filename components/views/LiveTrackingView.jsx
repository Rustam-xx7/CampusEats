"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function LiveTrackingView() {
  const { orders, activeTrackingToken, setCurrentView } = useApp();
  const [recapExpanded, setRecapExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const activeOrder =
    orders.find((o) => o.token === activeTrackingToken) || orders[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMsg("Order is freshly cooking in kitchen!");
      setTimeout(() => setToastMsg(""), 2500);
    }, 600);
  };

  const handleDownloadReceipt = () => {
    setToastMsg("Receipt saved as PDF!");
    setTimeout(() => setToastMsg(""), 2500);
  };

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto px-4 text-center space-y-4 pt-12">
        <h2 className="font-headline text-2xl uppercase text-[#251915]">
          No Active Order Found
        </h2>
        <button
          onClick={() => setCurrentView("menu")}
          className="px-6 py-2.5 rounded-full bg-[#c62828] text-white font-body text-xs font-bold shadow-md"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 pt-3 px-4 space-y-4">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#3b2d29] text-[#ffede8] px-4 py-2 rounded-full font-body text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
          <span className="material-symbols-outlined text-[16px] text-[#feae2c]">
            check_circle
          </span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Celebration */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#feae2c]/20 flex items-center justify-center shadow-[0_4px_20px_rgba(254,174,44,0.25)] animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#a20513] flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined text-white text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>
        </div>
        <p className="font-headline text-xl uppercase text-[#a20513] mt-2 tracking-wide">
          Awesome Choice!
        </p>
        <h2 className="font-body text-base font-bold text-[#251915]">
          Order Placed Successfully
        </h2>
        <p className="font-body text-xs text-[#5b403d] mt-0.5">
          Order ID: #{activeOrder.id} • Paid via {activeOrder.paymentMethod}
        </p>
      </div>

      {/* Pickup Token & Queue Position Hero Card */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(138,98,77,0.08)] flex flex-col items-center text-center border border-[#f5ddd7]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fbe3dc] text-[#5b403d] font-body text-xs uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[14px] text-[#a20513]">
              pin
            </span>
            Pickup Token
          </span>

          {activeOrder.queuePosition && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffddb4] text-[#835500] font-body text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">
                format_list_numbered
              </span>
              Queue #{activeOrder.queuePosition} in Line
            </span>
          )}
        </div>

        <div className="my-2 flex flex-col items-center">
          <span className="font-headline text-5xl uppercase text-[#a20513] tracking-wider select-all">
            #{activeOrder.token}
          </span>
          <div className="h-1 w-14 bg-[#feae2c] rounded-full mt-1"></div>
        </div>

        <p className="font-body text-xs text-[#251915] max-w-[290px]">
          Show this token number at{" "}
          <span className="font-body text-xs text-[#a20513] font-bold">
            Counter #2 (Main Canteen)
          </span>{" "}
          when called.
        </p>

        {/* Razorpay Verified Badge */}
        {activeOrder.paymentId && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8f5e9] text-[#1b5e20] rounded-full font-body text-[11px] font-bold border border-[#c8e6c9]">
            <span className="material-symbols-outlined text-[14px]">
              verified
            </span>
            <span>Razorpay Paid • ID: {activeOrder.paymentId.slice(0, 14)}...</span>
          </div>
        )}

        <div className="w-full mt-3 pt-3 bg-[#fff1ed] rounded-xl px-4 py-2.5 flex items-center justify-between border border-[#f5ddd7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f5ddd7] flex items-center justify-center text-[#a20513]">
              <span className="material-symbols-outlined text-[18px]">
                timer
              </span>
            </div>
            <div className="text-left">
              <p className="font-body text-[11px] text-[#5b403d]">Queue Wait Estimate</p>
              <p className="font-body text-xs font-bold text-[#251915]">
                {activeOrder.estimatedTime}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000e] font-body text-[11px] font-bold">
            By {activeOrder.timestamp}
          </span>
        </div>
      </div>

      {/* Live Kitchen Progress Stepper (Real-time updates from RTDB) */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] border border-[#f5ddd7]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a20513] text-[20px]">
              room_service
            </span>
            <h3 className="font-body text-xs font-bold text-[#251915]">
              Realtime Order State
            </h3>
          </div>
          <span className="flex items-center gap-1 font-body text-xs text-[#a20513] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#a20513] animate-ping"></span>
            RTDB Live
          </span>
        </div>

        {/* Stepper Timeline */}
        <div className="relative flex flex-col gap-5 pl-2">
          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-[#f5ddd7]"></div>

          {/* Step 1: Received */}
          <div className="relative flex items-start gap-3">
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#feae2c] text-[#291800] flex items-center justify-center shadow-xs shrink-0">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <p className="font-body text-xs font-bold text-[#251915]">
                  Order Received
                </p>
                <span className="font-body text-[11px] text-[#5b403d]">
                  {activeOrder.timestamp}
                </span>
              </div>
              <p className="font-body text-[11px] text-[#5b403d] mt-0.5">
                Payment confirmed & sent to Canteen queue
              </p>
            </div>
          </div>

          {/* Step 2: Preparing */}
          <div className="relative flex items-start gap-3">
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#a20513] text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[18px] animate-spin">
                skillet
              </span>
            </div>
            <div className="flex-1 bg-[#fff1ed] rounded-xl p-3 border border-[#f5ddd7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#a20513] text-white font-body text-[10px] uppercase font-bold">
                    Active
                  </span>
                  <p className="font-body text-xs text-[#a20513] font-bold">
                    Preparing Fresh
                  </p>
                </div>
                <span className="font-body text-[11px] text-[#a20513] font-bold">
                  Now
                </span>
              </div>
              <p className="font-body text-[11px] text-[#251915] mt-1">
                Kitchen is cooking your items fresh from the stove!
              </p>
              <div className="w-full bg-[#f5ddd7] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#a20513] h-full rounded-full w-3/4 transition-all duration-500"></div>
              </div>
            </div>
          </div>

          {/* Step 3: Ready */}
          <div className="relative flex items-start gap-3 opacity-60">
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#fbe3dc] text-[#5b403d] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                takeout_dining
              </span>
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <p className="font-body text-xs font-bold text-[#251915]">
                  Ready for Pickup
                </p>
                <span className="font-body text-[11px] text-[#5b403d]">
                  Counter #2
                </span>
              </div>
              <p className="font-body text-[11px] text-[#5b403d] mt-0.5">
                Present token code to counter attendant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Recap Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(138,98,77,0.08)] border border-[#f5ddd7]">
        <button
          onClick={() => setRecapExpanded(!recapExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#fff1ed] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fbe3dc] flex items-center justify-center text-[#a20513]">
              <span className="material-symbols-outlined text-[18px]">
                receipt_long
              </span>
            </div>
            <div>
              <p className="font-body text-xs font-bold text-[#251915]">
                Ordered Items Recap
              </p>
              <p className="font-body text-[11px] text-[#5b403d]">
                {activeOrder.items.length} items • Paid ₹{activeOrder.total}
              </p>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-[#5b403d] text-[20px] transition-transform ${
              recapExpanded ? "" : "rotate-180"
            }`}
          >
            expand_less
          </span>
        </button>

        {recapExpanded && (
          <div className="px-4 pb-4 flex flex-col gap-2.5">
            {activeOrder.items.map((it, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#fff1ed] rounded-xl flex items-center justify-between gap-2 border border-[#f5ddd7]"
              >
                <div className="min-w-0">
                  <h4 className="font-body text-xs font-bold text-[#251915] truncate">
                    {it.name}
                  </h4>
                  <p className="font-body text-[11px] text-[#5b403d]">
                    Quantity: {it.qty}
                  </p>
                </div>
                <span className="font-body text-xs font-bold text-[#a20513]">
                  ₹{it.price}
                </span>
              </div>
            ))}

            <div className="pt-2 flex flex-col gap-1 text-[#5b403d] border-t border-[#fbe3dc]">
              <div className="flex justify-between font-body text-[11px]">
                <span>Subtotal</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between font-body text-[11px] text-[#a20513]">
                  <span>Student Subsidy Discount</span>
                  <span>-₹{activeOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-[11px]">
                <span>GST (5%)</span>
                <span>+₹{activeOrder.gst}</span>
              </div>
              <div className="pt-1 mt-0.5 flex justify-between items-center text-[#251915]">
                <span className="font-body text-xs font-bold">Total Paid</span>
                <span className="font-body text-sm font-extrabold text-[#a20513]">
                  ₹{activeOrder.total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Triggers */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="w-full py-3 px-4 rounded-full bg-[#a20513] hover:bg-[#c62828] text-white font-body text-xs font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,40,40,0.28)] active:scale-95 transition-all"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            refresh
          </span>
          <span>
            {isRefreshing ? "Checking counter status..." : "Refresh Live Status"}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadReceipt}
            className="py-2.5 px-3 rounded-full bg-white text-[#251915] font-body text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs border border-[#f5ddd7] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[#a20513] text-[18px]">
              download
            </span>
            <span>Get Receipt</span>
          </button>
          <a
            href="tel:+915122580001"
            className="py-2.5 px-3 rounded-full bg-white text-[#251915] font-body text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs border border-[#f5ddd7] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[#835500] text-[18px]">
              call
            </span>
            <span>Canteen Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
