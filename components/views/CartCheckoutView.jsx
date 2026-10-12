"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import GuestInfoModal from "@/components/GuestInfoModal";

export default function CartCheckoutView() {
  const {
    cart,
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
    placeOrder,
    currentUser,
    setCurrentView
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState("razorpay"); // 'razorpay' | 'smartcard'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAppendInstruction = (text) => {
    if (kitchenNotes.trim().length > 0) {
      setKitchenNotes(kitchenNotes + ", " + text);
    } else {
      setKitchenNotes(text);
    }
  };

  // Trigger payment flow
  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    setPaymentNotice("");

    // If student is NOT logged in, require student name before payment!
    if (!currentUser) {
      setIsGuestModalOpen(true);
      return;
    }

    // Otherwise, student is logged in, proceed directly with Razorpay!
    executePaymentAndOrder({});
  };

  // Executes Razorpay checkout and only creates order upon payment success
  const executePaymentAndOrder = async (guestDetails = {}) => {
    setIsProcessing(true);
    setPaymentNotice("");

    try {
      const result = await placeOrder(guestDetails);

      if (!result || !result.success) {
        setIsProcessing(false);
        if (result?.cancelled) {
          setPaymentNotice("Payment was cancelled. Your items remain in the cart and NO order was placed.");
        } else {
          setPaymentNotice(result?.error || "Payment could not be verified. Order was not created.");
        }
      }
    } catch (err) {
      setIsProcessing(false);
      setPaymentNotice(err.message || "Payment encountered an error. Order was not placed.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 text-center space-y-4 pt-12">
        <div className="w-20 h-20 rounded-full bg-[#ffe9e3] text-[#a20513] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[40px]">
            shopping_bag
          </span>
        </div>
        <h2 className="font-headline text-3xl uppercase text-[#251915]">
          Your Cart is Empty
        </h2>
        <p className="font-body text-xs text-[#5b403d] max-w-xs">
          Explore delicious canteen thalis, hot samosas, rolls and kulhad chai from the cafeteria menu!
        </p>
        <button
          onClick={() => setCurrentView("menu")}
          className="px-6 py-3 rounded-full bg-[#c62828] text-white font-body text-xs font-bold shadow-[0_4px_16px_rgba(198,40,40,0.30)] active:scale-95 transition-transform"
        >
          Explore Cafeteria Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-36 pt-3 px-4 space-y-4">
      {/* Top Cart Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="font-headline text-2xl uppercase text-[#251915] tracking-wide">
            My Cart
          </span>
          <span className="bg-[#f5ddd7] text-[#5b403d] font-body text-xs font-bold px-2.5 py-0.5 rounded-full">
            {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1 text-[#5b403d] hover:text-[#a20513] transition-colors py-1 px-2.5 rounded-full hover:bg-[#ffe9e3]"
        >
          <span className="material-symbols-outlined text-[18px]">
            delete_sweep
          </span>
          <span className="font-body text-xs font-bold">Clear</span>
        </button>
      </div>

      {/* Pickup Counter Badge */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex items-start gap-3 border border-[#f5ddd7]">
        <div className="w-10 h-10 rounded-full bg-[#ffddb4] flex items-center justify-center shrink-0 text-[#291800]">
          <span className="material-symbols-outlined text-[20px]">
            storefront
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-body text-xs font-bold uppercase tracking-wider text-[#835500]">
              Pickup Location
            </span>
            <span className="bg-[#fff1ed] text-[#5b403d] font-body text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#835500]"></span>
              ~10 mins
            </span>
          </div>
          <p className="font-body text-sm font-bold text-[#251915] mt-0.5">
            Main Canteen Counter #2
          </p>
          <p className="font-body text-xs text-[#5b403d]">
            CSJMU Campus • North Block Food Court
          </p>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {cart.map(({ item, quantity }) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex items-center gap-3 border border-[#f5ddd7]"
          >
            <img
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs bg-[#ffe9e3]"
              src={item.image}
            />
            <div className="flex flex-col justify-between flex-1 min-w-0 h-20 py-0.5">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3 className="font-body text-xs font-bold text-[#251915] truncate">
                    {item.name}
                  </h3>
                  <p className="font-body text-[11px] text-[#5b403d] truncate">
                    {item.description}
                  </p>
                </div>
                <span className="font-body text-sm font-extrabold text-[#a20513] shrink-0">
                  ₹{item.price * quantity}
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="font-body text-[11px] text-[#5b403d]">
                  ₹{item.price} / portion
                </span>
                {/* Stepper counter */}
                <div className="bg-[#fbe3dc] rounded-full flex items-center px-1.5 py-1 gap-2 border border-[#f5ddd7]">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full bg-white text-[#251915] flex items-center justify-center hover:bg-[#ffe9e3] active:scale-95 transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      remove
                    </span>
                  </button>
                  <span className="font-body text-xs font-bold text-[#251915] min-w-[14px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full bg-[#a20513] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      add
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Instructions Section */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex flex-col gap-2 border border-[#f5ddd7]">
        <div className="flex items-center justify-between">
          <label
            htmlFor="kitchen-notes"
            className="font-body text-xs font-bold text-[#251915] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[#a20513] text-[18px]">
              restaurant_menu
            </span>
            Kitchen Instructions
          </label>
          <span className="font-body text-[11px] text-[#5b403d]">Optional</span>
        </div>
        <textarea
          id="kitchen-notes"
          value={kitchenNotes}
          onChange={(e) => setKitchenNotes(e.target.value)}
          placeholder="e.g. Less spicy dal, pack extra green chutney, serve rotis piping hot"
          rows={2}
          className="w-full bg-[#fff1ed] rounded-xl p-3 font-body text-xs text-[#251915] placeholder:text-[#8f706c] focus:outline-none focus:bg-[#ffe9e3] transition-colors resize-none border border-[#f5ddd7]"
        />
        <div className="flex gap-1.5 flex-wrap pt-0.5">
          {["🌶️ Extra spicy", "🌱 Jain prep", "🍴 Extra spoons"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAppendInstruction(preset)}
              className="bg-[#fbe3dc] hover:bg-[#ffe9e3] text-[#251915] font-body text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors active:scale-95 border border-[#f5ddd7]"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Student Subsidy Coupon Section */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex flex-col gap-2 border border-[#f5ddd7]">
        <span className="font-body text-xs font-bold text-[#251915] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#835500] text-[20px]">
            local_activity
          </span>
          Campus Coupon & Subsidy
        </span>
        <div className="bg-[#fff1ed] rounded-xl p-2.5 flex items-center justify-between border border-[#f5ddd7]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#feae2c] text-[#6b4500] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-lg text-[#251915] tracking-wider">
                  {coupon.code}
                </span>
                <span className="bg-[#a20513] text-white font-body text-[9px] font-bold px-1.5 py-0.2 rounded">
                  APPLIED
                </span>
              </div>
              <p className="font-body text-[11px] text-[#835500] truncate">
                ₹{coupon.discount} Student Canteen Subsidy
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setCoupon((prev) => ({ ...prev, applied: !prev.applied }))
            }
            className="font-body text-xs font-bold text-[#a20513] hover:underline px-2 py-1"
          >
            {coupon.applied ? "Remove" : "Apply"}
          </button>
        </div>
      </div>

      {/* Bill Breakdown Card */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex flex-col gap-2 border border-[#f5ddd7]">
        <span className="font-body text-xs font-bold text-[#251915] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#5b403d] text-[20px]">
            receipt_long
          </span>
          Bill Details
        </span>
        <div className="flex justify-between items-center font-body text-xs text-[#5b403d]">
          <span>Items Subtotal</span>
          <span className="text-[#251915] font-semibold">₹{cartSubtotal}</span>
        </div>
        <div className="flex justify-between items-center font-body text-xs text-[#835500]">
          <span className="flex items-center gap-1">
            <span>Student Cafeteria Subsidy</span>
            <span className="material-symbols-outlined text-[14px]">info</span>
          </span>
          <span className="font-bold">-₹{discountAmount}</span>
        </div>
        <div className="flex justify-between items-center font-body text-xs text-[#5b403d]">
          <span>Campus Dining GST (5%)</span>
          <span className="text-[#251915] font-semibold">+₹{gstAmount}</span>
        </div>
        <div className="w-full h-px bg-[#fbe3dc] my-1"></div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-body text-sm font-bold text-[#251915]">To Pay</span>
            <p className="font-body text-[10px] text-[#5b403d]">
              Inclusive of all institutional levies
            </p>
          </div>
          <span className="font-headline text-2xl text-[#a20513]">
            ₹{cartTotal}
          </span>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(138,98,77,0.08)] flex flex-col gap-2.5 border border-[#f5ddd7]">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs font-bold text-[#251915] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#a20513] text-[20px]">
              payments
            </span>
            Payment Gateway
          </span>
          <span className="font-body text-[10px] font-bold text-[#835500] bg-[#ffddb4]/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">security</span>
            100% Encrypted & Safe
          </span>
        </div>

        {/* Payment Option 1: Razorpay Gateway (Primary) */}
        <div
          onClick={() => setSelectedMethod("razorpay")}
          className={`p-3.5 rounded-xl flex flex-col gap-2.5 cursor-pointer transition-all border ${
            selectedMethod === "razorpay"
              ? "bg-[#fff1ed] border-[#c62828] shadow-xs"
              : "bg-white border-[#f5ddd7]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#a20513] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  lock
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-body text-xs font-bold text-[#251915]">
                    Razorpay Online Gateway
                  </p>
                  <span className="bg-[#feae2c] text-[#291800] font-body text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                    OFFICIAL
                  </span>
                </div>
                <p className="font-body text-[11px] text-[#5b403d]">
                  UPI, GPay, PhonePe, Cards, NetBanking
                </p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedMethod === "razorpay"
                  ? "bg-[#a20513] text-white"
                  : "bg-[#fbe3dc] text-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-1.5 pl-11 overflow-x-auto text-[10px] font-bold">
            <span className="px-2 py-0.5 bg-white text-[#251915] rounded-full shadow-xs border border-[#f5ddd7]">
              <span className="text-[#a20513]">G</span>Pay
            </span>
            <span className="px-2 py-0.5 bg-white text-[#251915] rounded-full shadow-xs border border-[#f5ddd7]">
              PhonePe
            </span>
            <span className="px-2 py-0.5 bg-white text-[#251915] rounded-full shadow-xs border border-[#f5ddd7]">
              Paytm
            </span>
            <span className="px-2 py-0.5 bg-white text-[#251915] rounded-full shadow-xs border border-[#f5ddd7]">
              RuPay / Visa
            </span>
          </div>

          <p className="text-[10px] text-[#835500] font-semibold pl-11 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">info</span>
            <span>Prepaid Policy: Order queue ticket will generate ONLY upon successful payment.</span>
          </p>
        </div>

        {/* Payment Option 2: CSJMU Smart Card */}
        <div
          onClick={() => setSelectedMethod("smartcard")}
          className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
            selectedMethod === "smartcard"
              ? "bg-[#fff1ed] border-[#c62828]"
              : "bg-white border-[#f5ddd7]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ffe9e3] flex items-center justify-center text-[#251915] shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                credit_card
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-body text-xs font-bold text-[#251915]">
                  CSJMU Smart Card
                </p>
                <span className="bg-[#f5ddd7] text-[#5b403d] font-body text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  Wallet
                </span>
              </div>
              <p className="font-body text-[11px] text-[#835500] font-semibold">
                Available Balance: ₹450
              </p>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              selectedMethod === "smartcard"
                ? "bg-[#a20513] text-white"
                : "bg-[#fbe3dc] text-transparent"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f6]/95 backdrop-blur-xl p-4 pb-safe border-t border-[#f5ddd7]">
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          {/* Payment Notice / Warning Banner */}
          {paymentNotice && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-2xl font-body text-xs font-semibold flex items-center gap-2 shadow-xs border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-[18px] shrink-0">
                warning
              </span>
              <span>{paymentNotice}</span>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[#5b403d]">
              <span className="material-symbols-outlined text-[15px] text-[#835500]">
                verified_user
              </span>
              <span className="font-body text-[11px] font-semibold">
                Razorpay PCI-DSS Level 1 Gateway
              </span>
            </div>
            <span className="font-body text-xs font-extrabold text-[#a20513]">
              Total: ₹{cartTotal}
            </span>
          </div>

          <button
            disabled={isProcessing}
            onClick={handleInitiateCheckout}
            className="w-full bg-[#a20513] hover:bg-[#c62828] text-white py-3.5 px-6 rounded-full font-headline text-xl uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,40,40,0.28)] active:scale-[0.98] transition-all disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  sync
                </span>
                <span>Connecting Razorpay...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{cartTotal} to Place Order</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guest Identification Gate Modal */}
      <GuestInfoModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onProceed={(guestData) => {
          setIsGuestModalOpen(false);
          executePaymentAndOrder(guestData);
        }}
      />
    </div>
  );
}
