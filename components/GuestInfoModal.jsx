"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function GuestInfoModal({ isOpen, onClose, onProceed }) {
  const { loginWithGoogleAuth, currentUser } = useApp();

  const [guestName, setGuestName] = useState("");
  const [guestRoll, setGuestRoll] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setValidationError("");
    try {
      const user = await loginWithGoogleAuth();
      if (user) {
        onProceed({
          guestName: user.displayName || "CSJMU Student",
          guestRoll: user.email || "Google Account",
          guestPhone: "+91 98765 43210"
        });
      }
    } catch (err) {
      setValidationError(err.message || "Google Sign-in failed. Please enter your name below.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim() || guestName.trim().length < 2) {
      setValidationError("Please enter your name (at least 2 letters) to place order.");
      return;
    }

    onProceed({
      guestName: guestName.trim(),
      guestRoll: guestRoll.trim() || "Campus Student",
      guestPhone: guestPhone.trim() || "+91 98765 43210"
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#f5ddd7] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f5ddd7]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#ffe9e3] text-[#a20513] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline text-xl text-[#251915] uppercase tracking-wide leading-none">
                Student Details
              </h3>
              <p className="font-body text-[11px] text-[#5b403d]">
                Required for canteen pickup token
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ffe9e3] hover:bg-[#fbe3dc] text-[#5b403d] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-3 p-3 bg-[#fff1ed] rounded-2xl border border-[#f5ddd7] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#a20513] text-[18px] shrink-0 mt-0.5">
            info
          </span>
          <p className="font-body text-xs text-[#5b403d] leading-relaxed">
            Only logged-in students or identified customers can place orders. Sign in with Google or enter your name below so the counter can announce your order queue token.
          </p>
        </div>

        {validationError && (
          <div className="mt-2.5 p-2.5 bg-[#ffdad6] text-[#93000a] rounded-xl font-body text-xs font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Option 1: Quick Google Login */}
        <div className="pt-3">
          <button
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#fff1ed] text-[#251915] font-body text-xs font-bold flex items-center justify-center gap-2.5 border border-[#8f706c]/40 shadow-xs transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? "Signing in..." : "Fast Sign-in with Google"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-[#f5ddd7]"></div>
          <span className="font-body text-[11px] font-bold text-[#8f706c] uppercase">
            Or Continue As Guest
          </span>
          <div className="flex-1 h-px bg-[#f5ddd7]"></div>
        </div>

        {/* Option 2: Guest Details Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="font-body text-xs font-bold text-[#251915] flex items-center justify-between">
              <span>Your Full Name</span>
              <span className="text-[#a20513] text-[11px] font-bold">* Required</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Aditya Sharma"
              className="w-full mt-1 px-3.5 py-2.5 bg-[#fff1ed] rounded-xl font-body text-xs text-[#251915] placeholder:text-[#5b403d]/60 outline-none border border-[#f5ddd7] focus:border-[#a20513] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-body text-xs font-bold text-[#251915]">
                Roll No / Course <span className="text-[#5b403d] font-normal text-[10px]">(Opt)</span>
              </label>
              <input
                type="text"
                value={guestRoll}
                onChange={(e) => setGuestRoll(e.target.value)}
                placeholder="e.g. 210459 / BCA"
                className="w-full mt-1 px-3 py-2 bg-[#fff1ed] rounded-xl font-body text-xs text-[#251915] placeholder:text-[#5b403d]/60 outline-none border border-[#f5ddd7] focus:border-[#a20513] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-body text-xs font-bold text-[#251915]">
                Phone No <span className="text-[#5b403d] font-normal text-[10px]">(For UPI)</span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full mt-1 px-3 py-2 bg-[#fff1ed] rounded-xl font-body text-xs text-[#251915] placeholder:text-[#5b403d]/60 outline-none border border-[#f5ddd7] focus:border-[#a20513] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#fbe3dc] hover:bg-[#ffe9e3] text-[#5b403d] font-body text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#a20513] hover:bg-[#c62828] text-white font-body text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Pay</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
