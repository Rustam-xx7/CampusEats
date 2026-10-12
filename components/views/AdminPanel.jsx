"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminPanel() {
  const {
    orders,
    updateOrderStatus,
    menuItems,
    toggleStock,
    addMenuItem,
    rushMode,
    setRushMode,
    setCurrentView,
    isStaff,
    openAuthModal
  } = useApp();

  // Access barrier: Only verified staff can access the terminal
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#fff8f6] font-body text-[#251915] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#f5ddd7] shadow-xl text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#ffdad6] text-[#93000a] mx-auto flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[40px]">
              admin_panel_settings
            </span>
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-body text-[10px] font-extrabold uppercase">
              Restricted Area
            </span>
            <h2 className="font-headline text-3xl uppercase text-[#251915] mt-2">
              Kitchen Staff Terminal
            </h2>
            <p className="font-body text-xs text-[#5b403d] mt-2 leading-relaxed">
              This terminal is reserved exclusively for cafeteria staff members. Only verified staff with an approved Staff ID number can change order states and manage kitchen tickets.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={openAuthModal}
              className="w-full py-3.5 rounded-full bg-[#a20513] hover:bg-[#c62828] text-white font-body text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                badge
              </span>
              <span>Verify Staff ID Number</span>
            </button>
            <button
              onClick={() => setCurrentView("menu")}
              className="w-full py-3 rounded-full bg-[#ffe9e3] hover:bg-[#fbe3dc] text-[#5b403d] font-body text-xs font-bold transition-all"
            >
              Back to Cafeteria Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'kanban'
  const [activeCallingToken, setActiveCallingToken] = useState("CSJ-142");

  // Drawer inspection state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState("");

  // Add new menu item form state
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "Meals",
    prepTime: "10 mins",
    badge: "New",
    station: "thali",
    stockCount: "20",
    image: ""
  });
  const [addingItem, setAddingItem] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      activeStatusFilter === "all" || ord.status === activeStatusFilter;
    const matchesStation =
      stationFilter === "all" || (ord.station && ord.station.includes(stationFilter));
    const matchesQuery =
      searchQuery === "" ||
      ord.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.studentRoll.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesStation && matchesQuery;
  });

  // Calculate metrics
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const cookingCount = orders.filter((o) => o.status === "cooking").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  const handleOpenDrawer = (ord) => {
    setInspectedOrder(ord);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setInspectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] font-body text-[#251915] pb-12">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3b2d29] text-[#ffede8] px-5 py-3 rounded-2xl shadow-2xl font-body text-xs font-bold flex items-center gap-2 animate-bounce border border-[#ffe9e3]">
          <span className="material-symbols-outlined text-[#feae2c] text-[20px]">
            notifications_active
          </span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white shadow-[0_4px_20px_rgba(138,98,77,0.08)] z-40 flex-col justify-between border-r border-[#f5ddd7]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-4 flex items-center gap-2.5 bg-[#fff1ed] border-b border-[#f5ddd7]">
            <img
              alt="CSJMU Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Ue2iK4qEgYI5XQE6GNTZ4-tX9MvmKGqzC5uiR1PD-xWmeWWlnhqL1QL1BOFpe9wgiaXefHWMDb4V30p7m84TlaRr5gZGJ2XMPsgW5CmjD7e8dBIds4X8Yw8IvSwAPr-7AjinK9lguPJ2qc_8z6Bey6rTIDQZVfSiWNzr8l3mSLRBHK2NosHX1jFFkf6YYA6UlpSqtE8RuolF-A_pucXzRNnQKfocmJWFAp7411oYcJnoR7aqGPHCs8"
            />
            <div className="flex flex-col">
              <span className="font-headline text-lg text-[#a20513] tracking-wide leading-none">
                CSJMU CAFE
              </span>
              <span className="font-body text-[10px] text-[#5b403d] uppercase tracking-wider font-bold">
                Kitchen Operations
              </span>
            </div>
          </div>

          {/* Station Feed Info */}
          <div className="mx-3 my-3 p-3 bg-[#fff1ed] rounded-xl flex flex-col gap-1 border border-[#f5ddd7]">
            <div className="flex items-center justify-between">
              <span className="font-body text-[10px] font-bold text-[#5b403d] uppercase">
                Station Feed
              </span>
              <span className="inline-flex items-center gap-1 font-body text-[10px] text-[#251915] bg-[#ffe9e3] px-2 py-0.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-[#feae2c] animate-pulse"></span>
                Online
              </span>
            </div>
            <span className="font-body text-xs font-bold text-[#251915] truncate">
              Counter #2 Main Canteen
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[#a20513] text-[16px]">
                chef_hat
              </span>
              <span className="font-body text-[11px] text-[#5b403d] font-semibold">
                Chef Ramesh K.
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 flex flex-col gap-1 space-y-1">
            <button
              onClick={() => setActiveStatusFilter("all")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#c62828] text-white font-body text-xs font-bold shadow-[0_4px_12px_rgba(198,40,40,0.25)]"
            >
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span>Live Orders</span>
              </span>
              <span className="bg-[#feae2c] text-[#291800] font-body text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {orders.length} Active
              </span>
            </button>

            <button
              onClick={() => setViewMode("kanban")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#5b403d] hover:bg-[#ffe9e3] hover:text-[#251915] font-body text-xs font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
              <span>Kitchen Kanban</span>
            </button>

            <button
              onClick={() => setCurrentView("home")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#5b403d] hover:bg-[#ffe9e3] hover:text-[#251915] font-body text-xs font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">smartphone</span>
              <span>Student Mobile View</span>
            </button>
          </nav>
        </div>

        {/* Bottom Rush Buffer Toggle */}
        <div className="p-3 bg-[#fff1ed] border-t border-[#f5ddd7]">
          <div className="p-3 bg-white rounded-xl shadow-xs flex items-center justify-between border border-[#f5ddd7]">
            <div>
              <div className="font-body text-xs font-bold text-[#251915]">
                Rush Hour Buffer
              </div>
              <div className="font-body text-[10px] text-[#5b403d]">
                {rushMode ? "+5 mins active" : "Normal prep"}
              </div>
            </div>
            <button
              onClick={() => setRushMode(!rushMode)}
              className={`p-1 rounded-full transition-colors ${
                rushMode ? "text-[#a20513]" : "text-[#5b403d]"
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {rushMode ? "toggle_on" : "toggle_off"}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Operational Header Bar */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md shadow-xs z-30 flex items-center justify-between px-4 lg:px-8 h-16 border-b border-[#f5ddd7] gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fff1ed] rounded-full border border-[#f5ddd7]">
              <span className="material-symbols-outlined text-[#a20513] text-[16px]">
                storefront
              </span>
              <span className="font-body text-xs font-bold text-[#251915] truncate">
                Ground Floor Express Window
              </span>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5b403d] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token #, roll no, student..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#fff1ed] text-[#251915] rounded-full font-body text-xs outline-none placeholder:text-[#5b403d]/70 border border-[#f5ddd7]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerToast("🔔 Chime sounded: Ding-Dong!")}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#ffe9e3] hover:bg-[#fbe3dc] rounded-full text-[#251915] transition-colors font-body text-xs font-bold border border-[#f5ddd7]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#a20513]">
                notifications_active
              </span>
              <span className="hidden sm:inline">Chime PA</span>
            </button>

            <button
              onClick={() => triggerToast("KOT reprinted for active tickets!")}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#ffe9e3] hover:bg-[#fbe3dc] rounded-full text-[#251915] transition-colors font-body text-xs font-bold border border-[#f5ddd7]"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">Reprint KOT</span>
            </button>

            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#a20513] text-white rounded-full hover:bg-[#c62828] font-body text-xs font-bold shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                smartphone
              </span>
              <span>Student View</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body Container */}
        <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Top Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#a20513]/10 text-[#a20513] font-body text-[11px] uppercase tracking-wider font-bold">
                  Kitchen Production Hub
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8f706c]"></span>
                <span className="font-body text-xs text-[#5b403d] font-medium">
                  Kalyanpur Campus • Central Kitchen #2
                </span>
              </div>
              <h1 className="font-headline text-4xl text-[#251915] tracking-wide uppercase mt-0.5">
                Live Kitchen Terminal
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  triggerToast("📢 Voice announcement broadcasted across counter screens!")
                }
                className="flex items-center gap-1.5 px-4 py-2 bg-[#c62828] text-white rounded-full hover:bg-[#a20513] font-body text-xs font-bold shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  volume_up
                </span>
                <span>Broadcast Tokens</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: Top KPI Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Metric 1 */}
            <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-col justify-between border border-[#f5ddd7]">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[#5b403d] uppercase font-bold">
                  Today Orders
                </span>
                <span className="material-symbols-outlined text-[#a20513] text-[20px]">
                  restaurant
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-headline text-3xl text-[#251915]">
                  164
                </span>
                <span className="font-body text-[10px] text-[#835500] font-bold bg-[#ffddb4]/50 px-2 py-0.5 rounded-full">
                  +14% today
                </span>
              </div>
              <span className="font-body text-[11px] text-[#5b403d] mt-1">
                Gross: <strong className="text-[#a20513]">₹18,450</strong>
              </span>
            </div>

            {/* Metric 2: Pending */}
            <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-col justify-between border border-[#ffdad6] relative">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[#ba1a1a] uppercase font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                  Pending
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-body text-[9px] font-extrabold">
                  ACTION
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-headline text-3xl text-[#ba1a1a]">
                  {pendingCount}
                </span>
                <span className="font-body text-[10px] text-[#5b403d]">
                  Unaccepted
                </span>
              </div>
              <span className="font-body text-[11px] text-[#ba1a1a] font-bold mt-1">
                Auto-accept in 00:45s
              </span>
            </div>

            {/* Metric 3: Cooking */}
            <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-col justify-between border border-[#f5ddd7]">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[#835500] uppercase font-bold">
                  In Cooking
                </span>
                <span className="material-symbols-outlined text-[#835500] text-[20px]">
                  skillet
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-headline text-3xl text-[#835500]">
                  {cookingCount}
                </span>
                <span className="font-body text-[10px] text-[#5b403d] font-bold bg-[#ffe9e3] px-2 py-0.5 rounded-full">
                  Avg: 6m
                </span>
              </div>
              <span className="font-body text-[11px] text-[#5b403d] mt-1">
                Tawa (4) • Fryer (4)
              </span>
            </div>

            {/* Metric 4: Ready */}
            <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-col justify-between border border-[#f5ddd7]">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[#251915] uppercase font-bold">
                  Ready Shelf
                </span>
                <span className="material-symbols-outlined text-[#251915] text-[20px]">
                  room_service
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-headline text-3xl text-[#251915]">
                  {readyCount}
                </span>
                <span className="font-body text-[10px] text-[#a20513] font-bold bg-[#ffdad6] px-2 py-0.5 rounded-full">
                  PA Active
                </span>
              </div>
              <span className="font-body text-[11px] text-[#5b403d] mt-1">
                Window #2 Ready
              </span>
            </div>

            {/* Metric 5: Completed */}
            <div className="bg-white p-4 rounded-2xl shadow-xs flex flex-col justify-between border border-[#f5ddd7]">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[#5b403d] uppercase font-bold">
                  Delivered
                </span>
                <span className="material-symbols-outlined text-[#5b403d] text-[20px]">
                  check_circle
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-headline text-3xl text-[#251915]">
                  {completedCount}
                </span>
                <span className="font-body text-[10px] text-[#6b4500] font-bold bg-[#feae2c]/20 px-2 py-0.5 rounded-full">
                  98.2% SLA
                </span>
              </div>
              <span className="font-body text-[11px] text-[#5b403d] mt-1">
                Ratings: ★ 4.8
              </span>
            </div>
          </div>

          {/* MAIN TWO-COLUMN DASHBOARD GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER: MAIN OPERATIONAL LIST & TICKET CARDS (8 COLS) */}
            <section className="xl:col-span-8 space-y-4">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Status filter pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: "all", label: "All Orders", count: orders.length },
                      { id: "pending", label: "Pending", count: pendingCount },
                      { id: "cooking", label: "Cooking", count: cookingCount },
                      { id: "ready", label: "Ready", count: readyCount },
                      { id: "completed", label: "Completed", count: completedCount }
                    ].map((st) => {
                      const isActive = activeStatusFilter === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setActiveStatusFilter(st.id)}
                          className={`px-3 py-1 rounded-full font-body text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                            isActive
                              ? "bg-[#a20513] text-white shadow-xs"
                              : "bg-[#fff1ed] text-[#5b403d] hover:bg-[#ffe9e3]"
                          }`}
                        >
                          <span>{st.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              isActive ? "bg-white/20 text-white" : "bg-[#f5ddd7] text-[#251915]"
                            }`}
                          >
                            {st.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* View Mode & Station Filter */}
                  <div className="flex items-center gap-2">
                    <select
                      value={stationFilter}
                      onChange={(e) => setStationFilter(e.target.value)}
                      className="bg-[#fff1ed] text-[#251915] py-1 px-3 rounded-full font-body text-xs font-bold outline-none border border-[#f5ddd7]"
                    >
                      <option value="all">All Stations</option>
                      <option value="thali">Hot Kitchen Range</option>
                      <option value="fryer">Snack Fryer Vat</option>
                      <option value="beverage">Beverage Chai Bar</option>
                      <option value="rolls">Roll & Kathi Counter</option>
                    </select>

                    <div className="bg-[#fff1ed] p-0.5 rounded-full flex items-center border border-[#f5ddd7]">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`px-3 py-1 rounded-full font-body text-xs font-bold transition-all ${
                          viewMode === "list"
                            ? "bg-white text-[#a20513] shadow-xs"
                            : "text-[#5b403d]"
                        }`}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setViewMode("kanban")}
                        className={`px-3 py-1 rounded-full font-body text-xs font-bold transition-all ${
                          viewMode === "kanban"
                            ? "bg-white text-[#a20513] shadow-xs"
                            : "text-[#5b403d]"
                        }`}
                      >
                        Kanban
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Cards List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-[#f5ddd7]">
                    <p className="font-body text-xs text-[#5b403d]">
                      No orders matching current filter criteria.
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.token}
                      className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3 hover:shadow-md transition-shadow"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-3 py-1 rounded-xl font-headline text-2xl tracking-wider ${
                              ord.status === "pending"
                                ? "bg-[#ffdad6] text-[#93000a]"
                                : ord.status === "cooking"
                                ? "bg-[#feae2c] text-[#291800]"
                                : "bg-[#ffe9e3] text-[#251915]"
                            }`}
                          >
                            #{ord.token}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-body text-sm font-bold text-[#251915]">
                                {ord.studentName}
                              </span>
                              <span className="font-body text-xs text-[#5b403d]">
                                {ord.studentRoll}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-body text-[11px] text-[#5b403d] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">
                                  schedule
                                </span>{" "}
                                {ord.timestamp}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#8f706c]"></span>
                              <span className="font-body text-[11px] text-[#835500] font-bold">
                                {ord.paymentMethod}
                              </span>
                              {ord.queuePosition && (
                                <span className="bg-[#ffddb4] text-[#835500] font-body text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Queue #{ord.queuePosition}
                                </span>
                              )}
                              {ord.paymentId && (
                                <span className="bg-[#e8f5e9] text-[#1b5e20] font-body text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">verified</span>
                                  Paid
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full font-body text-xs font-bold capitalize ${
                              ord.status === "pending"
                                ? "bg-[#ffdad6] text-[#93000a]"
                                : ord.status === "cooking"
                                ? "bg-[#ffddb4] text-[#291800]"
                                : ord.status === "ready"
                                ? "bg-[#ffe9e3] text-[#a20513]"
                                : "bg-[#f5ddd7] text-[#5b403d]"
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span className="font-body text-base font-extrabold text-[#a20513]">
                            ₹{ord.total}
                          </span>
                        </div>
                      </div>

                      {/* Items breakdown */}
                      <div className="bg-[#fff1ed] p-3 rounded-xl space-y-1.5 border border-[#f5ddd7]">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between font-body text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-[#c62828] text-white flex items-center justify-center font-bold text-[10px]">
                                {it.qty}
                              </span>
                              <span className="font-bold text-[#251915]">
                                {it.name}
                              </span>
                            </div>
                            <span className="font-bold text-[#a20513]">
                              ₹{it.price}
                            </span>
                          </div>
                        ))}

                        {ord.kitchenNotes && (
                          <div className="mt-1 flex items-start gap-1.5 text-[#ba1a1a] bg-[#ffe9e3] px-2.5 py-1.5 rounded-lg border border-[#f5ddd7]">
                            <span className="material-symbols-outlined text-[16px] mt-0.5">
                              warning
                            </span>
                            <span className="font-body text-xs font-semibold">
                              Special Note: {ord.kitchenNotes}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(ord)}
                            className="text-[#5b403d] hover:text-[#251915] font-body text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#ffe9e3]"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              visibility
                            </span>
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() =>
                              triggerToast(`KOT Printed for Token #${ord.token}`)
                            }
                            className="text-[#5b403d] hover:text-[#251915] font-body text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#ffe9e3]"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              print
                            </span>
                            <span>KOT Slip</span>
                          </button>
                        </div>

                        {/* Status Transition Button */}
                        <div className="flex items-center gap-2">
                          {ord.status === "pending" && (
                            <button
                              onClick={() => {
                                updateOrderStatus(ord.token, "cooking");
                                triggerToast(`Order #${ord.token} moved to Cooking!`);
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#c62828] text-white hover:bg-[#a20513] font-body text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <span>Accept & Start Prep →</span>
                            </button>
                          )}

                          {ord.status === "cooking" && (
                            <button
                              onClick={() => {
                                updateOrderStatus(ord.token, "ready");
                                setActiveCallingToken(ord.token);
                                triggerToast(`Order #${ord.token} is READY for pickup!`);
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#feae2c] text-[#291800] hover:bg-[#ffb955] font-body text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                check
                              </span>
                              <span>Mark Ready for Pickup ✓</span>
                            </button>
                          )}

                          {ord.status === "ready" && (
                            <button
                              onClick={() => {
                                updateOrderStatus(ord.token, "completed");
                                triggerToast(`Order #${ord.token} handed over!`);
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#251915] text-white hover:bg-black font-body text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                done_all
                              </span>
                              <span>Mark Handed Over ✓✓</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: KITCHEN SIDEBAR WIDGETS (4 COLS) */}
            <aside className="xl:col-span-4 space-y-4">
              {/* WIDGET 1: OVERHEAD TOKEN PA CALL */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a20513] text-[20px]">
                      campaign
                    </span>
                    <span className="font-headline text-xl text-[#251915] uppercase">
                      Overhead Token Announcer
                    </span>
                  </div>
                  <span className="font-body text-[10px] font-bold text-[#835500] bg-[#ffddb4] px-2 py-0.5 rounded-full">
                    PA Active
                  </span>
                </div>

                <div className="bg-[#fff1ed] p-4 rounded-xl flex flex-col items-center text-center border border-[#f5ddd7]">
                  <span className="font-body text-[10px] uppercase font-bold text-[#5b403d]">
                    Now Calling Token
                  </span>
                  <span className="font-headline text-4xl text-[#a20513] my-0.5">
                    #{activeCallingToken}
                  </span>
                  <span className="font-body text-xs text-[#251915] font-semibold">
                    Main Canteen Window #2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerToast("🔔 Chime sounded on PA Speaker!")}
                    className="py-2 px-3 bg-[#ffe9e3] hover:bg-[#fbe3dc] text-[#251915] rounded-xl font-body text-xs font-bold flex items-center justify-center gap-1 border border-[#f5ddd7]"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#a20513]">
                      notifications
                    </span>
                    <span>Ding Chime</span>
                  </button>
                  <button
                    onClick={() =>
                      triggerToast(`📢 Voice: "Token ${activeCallingToken}, collect at Counter 2"`)
                    }
                    className="py-2 px-3 bg-[#c62828] text-white hover:bg-[#a20513] rounded-xl font-body text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      record_voice_over
                    </span>
                    <span>Voice Call</span>
                  </button>
                </div>
              </div>

              {/* WIDGET 2: FAST MENU STOCK "86" TOGGLES */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a20513] text-[20px]">
                      inventory_2
                    </span>
                    <span className="font-headline text-xl text-[#251915] uppercase">
                      Fast Menu Stock Toggles
                    </span>
                  </div>
                  <span className="font-body text-[10px] font-bold text-[#5b403d]">
                    Immediate 86
                  </span>
                </div>
                <p className="font-body text-xs text-[#5b403d]">
                  Toggle off to instantly disable items on student mobile app.
                </p>

                <div className="space-y-2">
                  {menuItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-[#fff1ed] rounded-xl border border-[#f5ddd7]"
                    >
                      <div className="flex flex-col">
                        <span className="font-body text-xs font-bold text-[#251915]">
                          {item.name}
                        </span>
                        <span className="font-body text-[10px] text-[#5b403d]">
                          ₹{item.price} • {item.isAvailable ? "In Stock" : "Sold Out"}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          toggleStock(item.id);
                          triggerToast(
                            item.isAvailable
                              ? `🚫 ${item.name} marked as SOLD OUT on app`
                              : `✅ ${item.name} restored to active menu!`
                          );
                        }}
                        className={`px-3 py-1 rounded-full font-body text-[11px] font-bold flex items-center gap-1 transition-all ${
                          item.isAvailable
                            ? "bg-[#feae2c] text-[#291800]"
                            : "bg-[#f5ddd7] text-[#5b403d]"
                        }`}
                      >
                        <span>{item.isAvailable ? "In Stock" : "Disabled"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WIDGET 3: ADD NEW MENU ITEM */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#a20513] text-[20px]">
                      add_circle
                    </span>
                    <span className="font-headline text-xl text-[#251915] uppercase">
                      Add New Menu Item
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddItemForm(!showAddItemForm)}
                    className={`px-3 py-1 rounded-full font-body text-xs font-bold transition-all ${
                      showAddItemForm
                        ? "bg-[#ffdad6] text-[#93000a]"
                        : "bg-[#a20513] text-white hover:bg-[#c62828]"
                    }`}
                  >
                    {showAddItemForm ? "Cancel" : "+ Add Item"}
                  </button>
                </div>

                {showAddItemForm && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newItemForm.name.trim() || !newItemForm.price) {
                        triggerToast("⚠️ Item name and price are required!");
                        return;
                      }
                      setAddingItem(true);
                      try {
                        const added = await addMenuItem(newItemForm);
                        if (added) {
                          triggerToast(`✅ "${added.name}" added to menu!`);
                          setShowAddItemForm(false);
                          setNewItemForm({
                            name: "",
                            description: "",
                            price: "",
                            originalPrice: "",
                            category: "Meals",
                            prepTime: "10 mins",
                            badge: "New",
                            station: "thali",
                            stockCount: "20",
                            image: ""
                          });
                        }
                      } catch (err) {
                        triggerToast(`❌ Error: ${err.message}`);
                      } finally {
                        setAddingItem(false);
                      }
                    }}
                    className="space-y-2.5"
                  >
                    {/* Name */}
                    <div>
                      <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Item Name *</label>
                      <input
                        required
                        type="text"
                        value={newItemForm.name}
                        onChange={(e) => setNewItemForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Aloo Poori"
                        className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Description</label>
                      <input
                        type="text"
                        value={newItemForm.description}
                        onChange={(e) => setNewItemForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Short description..."
                        className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                      />
                    </div>

                    {/* Price row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Price (₹) *</label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={newItemForm.price}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="40"
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">MRP (₹)</label>
                        <input
                          type="number"
                          min="1"
                          value={newItemForm.originalPrice}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, originalPrice: e.target.value }))}
                          placeholder="50"
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        />
                      </div>
                    </div>

                    {/* Category & Station */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Category</label>
                        <select
                          value={newItemForm.category}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, category: e.target.value }))}
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        >
                          <option value="Meals">Meals</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Rolls">Rolls</option>
                          <option value="Drinks">Drinks</option>
                          <option value="Desserts">Desserts</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Prep Time</label>
                        <input
                          type="text"
                          value={newItemForm.prepTime}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, prepTime: e.target.value }))}
                          placeholder="10 mins"
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        />
                      </div>
                    </div>

                    {/* Badge & Stock */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Badge Label</label>
                        <input
                          type="text"
                          value={newItemForm.badge}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, badge: e.target.value }))}
                          placeholder="e.g. New, Trending"
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] font-bold text-[#5b403d] uppercase tracking-wider">Stock Count</label>
                        <input
                          type="number"
                          min="0"
                          value={newItemForm.stockCount}
                          onChange={(e) => setNewItemForm((p) => ({ ...p, stockCount: e.target.value }))}
                          placeholder="20"
                          className="mt-0.5 w-full bg-[#fff1ed] border border-[#f5ddd7] rounded-lg px-3 py-1.5 font-body text-xs text-[#251915] outline-none focus:border-[#a20513]"
                        />
                      </div>
                    </div>

                    {/* Veg only notice */}
                    <div className="flex items-center gap-2 p-2 bg-[#e8f5e9] rounded-lg border border-[#a5d6a7]">
                      <span className="w-3 h-3 rounded-full border-2 border-[#2e7d32] flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span>
                      </span>
                      <span className="font-body text-[11px] font-semibold text-[#1b5e20]">
                        All items are Pure Veg — no egg items allowed.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={addingItem}
                      className="w-full py-2.5 rounded-xl bg-[#a20513] hover:bg-[#c62828] text-white font-body text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xs"
                    >
                      {addingItem ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                          <span>Adding to Menu...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          <span>Add to Cafeteria Menu</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* WIDGET 4: KITCHEN STATION LOADS */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#f5ddd7] space-y-3">
                <span className="font-headline text-xl text-[#251915] uppercase">
                  Kitchen Station Capacity
                </span>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between font-body text-xs">
                      <span className="font-bold text-[#251915]">
                        Main Tawa Range
                      </span>
                      <span className="text-[#a20513] font-bold">88% Peak</span>
                    </div>
                    <div className="w-full bg-[#fff1ed] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#a20513] h-full rounded-full"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-body text-xs">
                      <span className="font-bold text-[#251915]">
                        Snack Fryer Vat
                      </span>
                      <span className="text-[#835500] font-bold">75% High</span>
                    </div>
                    <div className="w-full bg-[#fff1ed] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#feae2c] h-full rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-body text-xs">
                      <span className="font-bold text-[#251915]">
                        Beverage Chai Bar
                      </span>
                      <span className="text-[#5b403d] font-bold">30% Normal</span>
                    </div>
                    <div className="w-full bg-[#fff1ed] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#8f706c] h-full rounded-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Drawer Inspector Modal */}
      {drawerOpen && inspectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          ></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[#f5ddd7] z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f5ddd7]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#a20513] text-white font-headline text-2xl px-3 py-1 rounded-xl">
                    #{inspectedOrder.token}
                  </span>
                  <div>
                    <h3 className="font-body text-sm font-bold text-[#251915]">
                      {inspectedOrder.studentName}
                    </h3>
                    <p className="font-body text-xs text-[#5b403d]">
                      {inspectedOrder.studentRoll}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-full hover:bg-[#ffe9e3] text-[#5b403d]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              {/* Order items */}
              <div className="bg-[#fff1ed] p-4 rounded-xl space-y-2 border border-[#f5ddd7]">
                <span className="font-body text-xs font-bold uppercase text-[#5b403d]">
                  Items & Specifications
                </span>
                {inspectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between font-body text-xs text-[#251915]"
                  >
                    <span>
                      {it.qty}x {it.name}
                    </span>
                    <span className="font-bold text-[#a20513]">₹{it.price}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#f5ddd7] flex justify-between font-body text-xs font-bold text-[#251915]">
                  <span>Total Bill</span>
                  <span className="text-[#a20513]">₹{inspectedOrder.total}</span>
                </div>
              </div>

              {/* Special Note */}
              {inspectedOrder.kitchenNotes && (
                <div className="p-3 bg-[#ffe9e3] rounded-xl font-body text-xs text-[#ba1a1a] border border-[#f5ddd7]">
                  <strong>Student Note:</strong> {inspectedOrder.kitchenNotes}
                </div>
              )}
            </div>

            <button
              onClick={handleCloseDrawer}
              className="w-full py-3 rounded-full bg-[#a20513] text-white font-body text-xs font-bold shadow-md mt-6"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
