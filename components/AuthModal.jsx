"use client";

import { useApp } from "@/context/AppContext";
import React, { useState, useEffect } from "react";

export default function AuthModal({ isOpen, onClose }) {
  const {
    currentUser,
    userRole,
    staffId,
    loginWithGoogleAuth,
    logoutAuth,
    updateUserRole,
    setCurrentView
  } = useApp();

  const [selectedRole, setSelectedRole] = useState(userRole || "student");
  const [inputStaffId, setInputStaffId] = useState(staffId || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [goAdmin, setGoAdmin] = useState(false);

  // Wait until userRole is "staff" before opening the admin page,
  // otherwise the navigation guard still sees the old role and blocks it
  useEffect(() => {
    if (goAdmin && userRole === "staff") {
      setCurrentView("admin");
      setGoAdmin(false);
    }
  }, [goAdmin, userRole, setCurrentView]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await loginWithGoogleAuth();
      setSuccessMessage("Signed in with Google successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (selectedRole === "staff") {
      if (!inputStaffId.trim() || inputStaffId.trim().length < 3) {
        setErrorMessage("Please enter a valid Staff ID Number (minimum 3 characters, e.g. STAFF-101).");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateUserRole(selectedRole, inputStaffId.trim());
      setSuccessMessage(
        selectedRole === "staff"
          ? "Staff role verified! Admin portal unlocked."
          : "Student role confirmed!"
      );
      if (selectedRole === "staff") setGoAdmin(true);
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || "Could not save role profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#f5ddd7] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f5ddd7]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a20513] text-[24px]">
              account_circle
            </span>
            <div>
              <h3 className="font-headline text-2xl text-[#251915] uppercase tracking-wide leading-none">
                Campus Authentication
              </h3>
              <p className="font-body text-[11px] text-[#5b403d]">
                CSJMU Cafe • project-82773201543
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

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-[#ffdad6] text-[#93000a] rounded-xl font-body text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-3 bg-[#e8f5e9] text-[#1b5e20] rounded-xl font-body text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login State */}
        {!currentUser ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffe9e3] text-[#a20513] mx-auto flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[32px]">
                lock
              </span>
            </div>
            <div>
              <h4 className="font-body text-base font-bold text-[#251915]">
                Sign In to CSJMU Cafe
              </h4>
              <p className="font-body text-xs text-[#5b403d] max-w-xs mx-auto mt-1">
                Use your Google account to track orders in real-time or access kitchen staff controls.
              </p>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-[#fff1ed] text-[#251915] font-body text-xs font-bold flex items-center justify-center gap-3 border border-[#8f706c]/40 shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>{isSubmitting ? "Signing in..." : "Continue with Google"}</span>
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* User Profile Card */}
            <div className="p-3 bg-[#fff1ed] rounded-2xl flex items-center justify-between border border-[#f5ddd7]">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    alt={currentUser.displayName || "User"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#a20513]"
                    src={currentUser.photoURL}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#a20513] text-white flex items-center justify-center font-bold">
                    {(currentUser.displayName || "U")[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-body text-xs font-bold text-[#251915] truncate">
                    {currentUser.displayName || "CSJMU User"}
                  </h4>
                  <p className="font-body text-[11px] text-[#5b403d] truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full font-body text-[10px] font-bold uppercase ${userRole === "staff"
                    ? "bg-[#c62828] text-white"
                    : "bg-[#feae2c] text-[#291800]"
                  }`}
              >
                {userRole === "staff" ? "Kitchen Staff" : "Student"}
              </span>
            </div>

            {/* Role Assignment Form */}
            <form onSubmit={handleSaveRole} className="space-y-4 pt-1">
              <div>
                <label className="font-body text-xs font-bold text-[#251915] block mb-2">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`p-3 rounded-2xl font-body text-xs font-bold flex flex-col items-center gap-1 transition-all border ${selectedRole === "student"
                        ? "bg-[#a20513] text-white border-[#a20513] shadow-xs"
                        : "bg-white text-[#5b403d] border-[#f5ddd7] hover:bg-[#ffe9e3]"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      school
                    </span>
                    <span>Student</span>
                    <span className="text-[10px] opacity-80">No Proof Needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("staff")}
                    className={`p-3 rounded-2xl font-body text-xs font-bold flex flex-col items-center gap-1 transition-all border ${selectedRole === "staff"
                        ? "bg-[#a20513] text-white border-[#a20513] shadow-xs"
                        : "bg-white text-[#5b403d] border-[#f5ddd7] hover:bg-[#ffe9e3]"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      badge
                    </span>
                    <span>Kitchen Staff</span>
                    <span className="text-[10px] opacity-80">Staff ID Required</span>
                  </button>
                </div>
              </div>

              {/* Staff ID Verification Input */}
              {selectedRole === "staff" && userRole !== "staff" && (
                <div className="space-y-1.5 p-3.5 bg-[#ffe9e3] rounded-2xl border border-[#f5ddd7]">
                  <label className="font-body text-xs font-bold text-[#251915] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#a20513] text-[16px]">
                      verified_user
                    </span>
                    <span>Staff Passcode</span>
                    <span className="text-[#a20513]">*</span>
                  </label>
                  <p className="font-body text-[11px] text-[#5b403d]">
                    Ask the canteen manager for the staff passcode.
                  </p>
                  <input
                    type="password"
                    value={inputStaffId}
                    onChange={(e) => setInputStaffId(e.target.value)}
                    placeholder="Enter staff passcode"
                    autoComplete="off"
                    className="w-full mt-1 px-3 py-2 bg-white rounded-xl font-body text-xs text-[#251915] placeholder:text-[#5b403d]/60 outline-none border border-[#f5ddd7] focus:border-[#a20513]"
                  />
                </div>
              )}
              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={logoutAuth}
                  className="flex-1 py-3 rounded-full bg-[#fbe3dc] hover:bg-[#ffe9e3] text-[#5b403d] font-body text-xs font-bold transition-all"
                >
                  Sign Out
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-[#a20513] hover:bg-[#c62828] text-white font-body text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-75"
                >
                  {isSubmitting ? "Verifying..." : "Confirm Role"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
