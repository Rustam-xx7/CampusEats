"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import HomeView from "@/components/views/HomeView";
import MenuView from "@/components/views/MenuView";
import CartCheckoutView from "@/components/views/CartCheckoutView";
import LiveTrackingView from "@/components/views/LiveTrackingView";
import MyOrdersView from "@/components/views/MyOrdersView";
import AdminPanel from "@/components/views/AdminPanel";

function MainContent() {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case "menu":
        return <MenuView />;
      case "cart":
        return <CartCheckoutView />;
      case "tracking":
        return <LiveTrackingView />;
      case "orders":
        return <MyOrdersView />;
      case "admin":
        return <AdminPanel />;
      case "home":
      default:
        return <HomeView />;
    }
  };

  return (
    <main className="flex-1 w-full relative pt-16">
      {renderView()}
    </main>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#fff8f6] font-body text-[#251915]">
        <Header />
        <MainContent />
        <BottomNav />
      </div>
    </AppProvider>
  );
}
