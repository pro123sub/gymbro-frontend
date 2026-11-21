"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Layers,
  Trophy,
  Shield,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  MessageCircle,
  Clock,
  ChevronDown,
  Lock,
  ThumbsUp,
  MessageSquare,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";

import {
  GymProfile,
  UserAccount,
  GymPackage,
  MemberProfile,
  AttendanceRecord,
  CommunityPost,
  UserRole,
} from "@/lib/types";
import { gymDataManager, DEFAULT_GYMS } from "@/lib/gymData";
import { AddMemberModal, MemberProfileDrawer } from "@/components/MemberModals";
import { PackageModal } from "@/components/PackageModals";
import { AddGymModal, AuthModal } from "@/components/GymAndAuthModals";
import { ShareAchievementModal } from "@/components/CommunityModal";

type NavTab = "Dashboard" | "Members" | "Attendance" | "Analytics" | "Packages" | "Community";

export default function GymManagementApp() {
  // Navigation & Authentication
  const [activeTab, setActiveTab] = useState<NavTab>("Dashboard");
  const [activeGymId, setActiveGymId] = useState<string>("gym-bandra-01");
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: "usr-admin-01",
    gymId: "gym-bandra-01",
    username: "admin@gymflow.com",
    email: "admin@gymflow.com",
    password: "admin123",
    name: "Devendra Patel",
    role: "admin",
  });

  // Data states
  const [gyms, setGyms] = useState<GymProfile[]>([]);
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"ALL" | "member" | "trainer">("ALL");
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>("ALL");
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState<string>("ALL");

  // Modals state
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GymPackage | null>(null);
  const [addGymOpen, setAddGymOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shareAchievementOpen, setShareAchievementOpen] = useState(false);

  // Quick Attendance Form state
  const [quickCheckinMemberId, setQuickCheckinMemberId] = useState("");
  const [quickWorkoutType, setQuickWorkoutType] = useState("Gym Floor & Weights");

  // Community new comment inputs
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Reload all data for active gym
  const reloadData = useCallback(() => {
    const loadedGyms = gymDataManager.getGyms();
    setGyms(loadedGyms);

    const activeUser = gymDataManager.getActiveUser();
    setCurrentUser(activeUser);

    const activeGId = gymDataManager.getActiveGymId();
    setActiveGymId(activeGId);

    const loadedPackages = gymDataManager.getPackages(activeGId);
    setPackages(loadedPackages);

    const loadedMembers = gymDataManager.getMembers(activeGId);
    setMembers(loadedMembers);

    const loadedAttendance = gymDataManager.getTodayAttendance(activeGId);
    setAttendance(loadedAttendance);

    const loadedCommunity = gymDataManager.getCommunityPosts(activeGId);
    setCommunityPosts(loadedCommunity);
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, [reloadData]);

  // When active gym changes
  const handleGymSwitch = (newGymId: string) => {
    gymDataManager.setActiveGymId(newGymId);
    setActiveGymId(newGymId);
    reloadData();
    showToast(`Switched gym to ${gyms.find((g) => g.id === newGymId)?.name || "selected gym"}.`);
  };

  const activeGym = useMemo(() => {
    return gyms.find((g) => g.id === activeGymId) || gyms[0] || DEFAULT_GYMS[0];
  }, [gyms, activeGymId]);

  // Dashboard Stats
  const dashStats = useMemo(() => {
    return gymDataManager.getDashboardStats(activeGymId);
  }, [activeGymId, members, attendance]);

  // Admin Analytics Stats
  const adminStats = useMemo(() => {
    return gymDataManager.getAdminAnalyticsStats(activeGymId);
  }, [activeGymId, members, packages]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      if (memberRoleFilter !== "ALL" && m.role !== memberRoleFilter) return false;
      if (memberStatusFilter !== "ALL" && m.member_status !== memberStatusFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.member_id.toLowerCase().includes(q) ||
        (m.plan_name && m.plan_name.toLowerCase().includes(q))
      );
    });
  }, [members, searchQuery, memberRoleFilter, memberStatusFilter]);

  // Filtered Community Posts
  const filteredPosts = useMemo(() => {
    if (communityCategoryFilter === "ALL") return communityPosts;
    return communityPosts.filter((p) => p.category === communityCategoryFilter);
  }, [communityPosts, communityCategoryFilter]);

  // Handle Quick Attendance Check-in
  const handleRecordCheckin = (memberId: string) => {
    if (!memberId) return;
    try {
      const res = gymDataManager.recordCheckin(activeGymId, memberId, quickWorkoutType);
      reloadData();
      showToast(
        `Checked in ${res.member.name}! Current consistency streak: ${res.member.current_streak} days.`
      );
      setQuickCheckinMemberId("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Check-in failed", true);
    }
  };

  // 1-Click Role Switcher for quick test of Admin vs Normal User perspectives
  const handleToggleRole = () => {
    const nextRole: UserRole = currentUser.role === "admin" ? "normal_user" : "admin";
    const updatedUser: UserAccount = {
      ...currentUser,
      role: nextRole,
      name: nextRole === "admin" ? "Devendra Patel (Admin)" : "Riya Mukherjee (Member)",
    };
    gymDataManager.setActiveUser(updatedUser);
    setCurrentUser(updatedUser);

    // If switching to normal user and currently on Analytics, move to Dashboard
    if (nextRole === "normal_user" && activeTab === "Analytics") {
      setActiveTab("Dashboard");
    }

    showToast(
      nextRole === "admin"
        ? "Switched to ADMIN profile (Full access to Analytics, Packages edit & Gym management)."
        : "Switched to NORMAL USER profile (Analytics hidden, Packages view-only)."
    );
  };

  // Handle adding a comment to a community post
  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    gymDataManager.addCommentToPost(activeGymId, postId, {
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_role: currentUser.role,
      text,
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    reloadData();
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-700">Loading GymBro OS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 lg:flex-row">
      {/* =========================================================================
          LEFT SIDEBAR (OBSIDIAN & MODERN EMERALD)
          ========================================================================= */}
      <aside className="flex w-full shrink-0 flex-col justify-between bg-[#0A120E] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 border-r border-[#15241C]">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-base font-extrabold tracking-wide text-white leading-none">GYMBRO</p>
                <p className="mt-1 text-[10px] font-bold tracking-widest text-emerald-400">FITNESS OS</p>
              </div>
            </div>

            {/* Role indicator pill */}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                currentUser.role === "admin"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              }`}
            >
              {currentUser.role === "admin" ? "Admin" : "User"}
            </span>
          </div>

          {/* Gym Profile Selector */}
          <div className="mt-3 px-1">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400">ACTIVE GYM PROFILE</span>
              {currentUser.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setAddGymOpen(true)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
                  title="Add New Gym Profile"
                >
                  <Plus className="h-3 w-3" /> New Gym
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={activeGymId}
                onChange={(e) => handleGymSwitch(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id} className="text-slate-900 bg-white">
                    {g.name} ({g.branch.split(",")[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="mt-6">
            <p className="mb-2 px-2 text-[10px] font-bold tracking-wider text-slate-400">NAVIGATION</p>
            <nav className="space-y-1">
              {/* 1. Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("Dashboard")}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                  activeTab === "Dashboard"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              {/* 2. Members */}
              <button
                type="button"
                onClick={() => setActiveTab("Members")}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                  activeTab === "Members"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <span>Members</span>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                  {members.length}
                </span>
              </button>

              {/* 3. Attendance */}
              <button
                type="button"
                onClick={() => setActiveTab("Attendance")}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                  activeTab === "Attendance"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="h-4 w-4" />
                  <span>Attendance</span>
                </div>
                {attendance.length > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {attendance.length} today
                  </span>
                )}
              </button>

              {/* 4. Analytics (VISIBLE ONLY TO ADMIN PROFILE!) */}
              {currentUser.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("Analytics")}
                  className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                    activeTab === "Analytics"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-300">
                    Admin
                  </span>
                </button>
              )}

              {/* 5. Packages */}
              <button
                type="button"
                onClick={() => setActiveTab("Packages")}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                  activeTab === "Packages"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4" />
                  <span>Packages</span>
                </div>
                {currentUser.role !== "admin" && (
                  <span className="text-[10px] text-slate-400">View only</span>
                )}
              </button>

              {/* 6. Community */}
              <button
                type="button"
                onClick={() => setActiveTab("Community")}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                  activeTab === "Community"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4" />
                  <span>Community</span>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {communityPosts.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Card & Switch Account */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-300">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-white truncate text-xs">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === "admin" ? "Admin Profile" : "Normal User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-click Role Toggle Button */}
            <button
              type="button"
              onClick={handleToggleRole}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-white/15 transition"
            >
              <RefreshCw className="h-3 w-3" />
              Toggle to {currentUser.role === "admin" ? "Normal User" : "Admin"}
            </button>

            {/* Detailed Auth / Login Modal trigger */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-1.5 flex w-full items-center justify-center gap-1 text-[10px] font-medium text-slate-400 hover:text-white transition"
            >
              <Lock className="h-3 w-3" /> Sign in / Switch Account
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION WORKSPACE
          ========================================================================= */}
      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 text-xs font-semibold shadow-sm transition ${
              toast.isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.isError ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="font-bold text-slate-500 hover:text-slate-800 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>{activeGym.name}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{activeGym.branch}</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {activeTab === "Dashboard" && "General Dashboard"}
              {activeTab === "Members" && "Member & Trainer Management"}
              {activeTab === "Attendance" && "Daily Attendance Check-In"}
              {activeTab === "Analytics" && "Executive Studio Analytics"}
              {activeTab === "Packages" && "Membership Packages & Perks"}
              {activeTab === "Community" && "Gym Member Community Feed"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member, phone, ID..."
                className="w-48 sm:w-60 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Quick Action: Add Member */}
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Member / Trainer
            </button>
          </div>
        </header>

        {/* =========================================================================
            VIEW 1: DASHBOARD (GENERAL ANALYTICS OF THE WHOLE WEBSITE)
            ========================================================================= */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            {/* 4 Primary Bento Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card-subtle rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Members</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{dashStats.totalMembers}</p>
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {dashStats.activeMembers} active · {dashStats.expiredCount} expired
                </p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Trainers</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <Flame className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{dashStats.activeTrainers}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Coaches &amp; Floor Staff on duty</p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Today&apos;s Check-Ins</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Activity className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{dashStats.todayCheckins}</p>
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {dashStats.capacityUtilizationPct}% floor capacity
                </p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Pending Dues</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{dashStats.pendingDuesCount}</p>
                <p className="mt-1 text-xs font-medium text-amber-700">Reminders ready to send</p>
              </div>
            </div>

            {/* Quick Floor Check-In Widget & Announcements */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Quick Attendance Widget */}
              <div className="lg:col-span-2 card-subtle rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Fast Floor Check-In Terminal</h3>
                    <p className="text-xs text-slate-500">Record member arrival in one click to maintain streaks.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Attendance")}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View All Attendance -&gt;
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={quickCheckinMemberId}
                    onChange={(e) => setQuickCheckinMemberId(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="">Select Member or Trainer to check in...</option>
                    {members.map((m) => {
                      const alreadyIn = attendance.some((a) => a.member_id === m.member_id);
                      return (
                        <option key={m.member_id} value={m.member_id} disabled={alreadyIn}>
                          {m.name} ({m.role.toUpperCase()}) {alreadyIn ? "• Already Checked In" : `• ${m.member_id}`}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={quickWorkoutType}
                    onChange={(e) => setQuickWorkoutType(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Gym Floor & Weights">Gym Floor &amp; Weights</option>
                    <option value="Cardio & Conditioning">Cardio &amp; Conditioning</option>
                    <option value="HIIT Studio">HIIT Studio</option>
                    <option value="Personal Training Session">Personal Training Session</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRecordCheckin(quickCheckinMemberId)}
                    disabled={!quickCheckinMemberId}
                    className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Check In Now
                  </button>
                </div>

                {/* Checked in today preview pills */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Recently Checked In Today ({attendance.length})
                  </p>
                  {attendance.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No check-ins recorded yet today.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {attendance.slice(0, 6).map((att) => (
                        <span
                          key={att.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {att.member_name} ({att.checkin_time.slice(0, 5)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gym Announcements & Community Activity */}
              <div className="card-subtle rounded-3xl p-6">
                <h3 className="text-base font-bold text-slate-900 mb-1">Gym Notices &amp; News</h3>
                <p className="text-xs text-slate-500 mb-4">Latest updates for {activeGym.name}.</p>

                <div className="space-y-3">
                  {dashStats.announcements.map((ann) => (
                    <div key={ann.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {ann.tag}
                        </span>
                        <span className="text-[11px] text-slate-400">{ann.date}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{ann.title}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("Community")}
                  className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                >
                  <Trophy className="h-3.5 w-3.5" /> Open Member Community -&gt;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: MEMBERS (DIRECTORY, EDITABLE PROFILES, WHATSAPP REMINDERS)
            ========================================================================= */}
        {activeTab === "Members" && (
          <div className="card-subtle rounded-3xl p-6 space-y-5">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              {/* Role filter */}
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1">
                {(["ALL", "member", "trainer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMemberRoleFilter(r)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition capitalize ${
                      memberRoleFilter === r
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {r === "ALL" ? "All Profiles" : r === "member" ? "Members Only" : "Trainers Only"}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400">Status:</span>
                {(["ALL", "Active", "Expired", "Pending"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMemberStatusFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      memberStatusFilter === s
                        ? "bg-emerald-600 text-white font-bold"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Member &amp; ID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Package / Subscription</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Streak</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No members found matching your search or filters. Click &ldquo;Add Member / Trainer&rdquo; above!
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const waUrl = gymDataManager.generateWhatsAppReminderUrl(m, activeGym.name);
                      return (
                        <tr
                          key={m.member_id}
                          onClick={() => setSelectedMember(m)}
                          className="hover:bg-emerald-50/30 cursor-pointer transition"
                        >
                          {/* Member ID and Name */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                                <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                                  <Lock className="h-2.5 w-2.5" />
                                  {m.member_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                m.role === "trainer"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {m.role}
                            </span>
                          </td>

                          {/* Package */}
                          <td className="px-4 py-3.5">
                            {m.has_subscription ? (
                              <div>
                                <p className="font-semibold text-slate-800">{m.plan_name || "Custom Plan"}</p>
                                <p className="text-[11px] text-slate-400">₹{m.fee?.toLocaleString("en-IN") || 0}</p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No Subscription (Staff)</span>
                            )}
                          </td>

                          {/* Expiry */}
                          <td className="px-4 py-3.5">
                            {m.has_subscription && m.expiry_date ? (
                              <div>
                                <p className="font-medium text-slate-700">{m.expiry_date}</p>
                                {m.member_status === "Expired" && (
                                  <p className="text-[10px] font-bold text-red-600">Expired</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                m.member_status === "Active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : m.member_status === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : m.member_status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {m.member_status}
                            </span>
                          </td>

                          {/* Streak */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                              <Flame className="h-3.5 w-3.5" />
                              {m.current_streak}d
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-3.5 text-right space-x-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* WhatsApp Reminder Button */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Send reminder through WhatsApp"
                              className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:brightness-105 transition"
                            >
                              <MessageCircle className="h-3 w-3 fill-current" />
                              WhatsApp
                            </a>

                            {/* Check in */}
                            <button
                              type="button"
                              onClick={() => handleRecordCheckin(m.member_id)}
                              className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                            >
                              Check-In
                            </button>

                            {/* Edit Profile */}
                            <button
                              type="button"
                              onClick={() => setSelectedMember(m)}
                              className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                            >
                              Edit Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: ATTENDANCE (SIMPLE & CLEAN, NOT TOO COMPLEX)
            ========================================================================= */}
        {activeTab === "Attendance" && (
          <div className="space-y-6">
            {/* Top Simple Check-In Bar */}
            <div className="card-subtle rounded-3xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Today&apos;s Attendance Check-In</h3>
              <p className="text-xs text-slate-500 mb-4">
                Simple 1-click check-in terminal for all gym members and trainers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={quickCheckinMemberId}
                  onChange={(e) => setQuickCheckinMemberId(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">Select Member or Trainer to mark present...</option>
                  {members.map((m) => {
                    const alreadyChecked = attendance.some((a) => a.member_id === m.member_id);
                    return (
                      <option key={m.member_id} value={m.member_id} disabled={alreadyChecked}>
                        {m.name} [{m.role.toUpperCase()}] • {m.member_id}{" "}
                        {alreadyChecked ? "(Already Present)" : ""}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={quickWorkoutType}
                  onChange={(e) => setQuickWorkoutType(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Gym Floor & Weights">Gym Floor &amp; Weights</option>
                  <option value="Cardio Zone">Cardio Zone</option>
                  <option value="Crossfit / HIIT">Crossfit / HIIT</option>
                  <option value="Personal Training">Personal Training</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRecordCheckin(quickCheckinMemberId)}
                  disabled={!quickCheckinMemberId}
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  Mark Attendance
                </button>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="card-subtle rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Floor Attendance Log ({attendance.length} Present Today)
                  </h4>
                  <p className="text-xs text-slate-400">Timestamped records for today.</p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Member / Trainer</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Time Checked In</th>
                      <th className="px-4 py-2.5">Workout Category</th>
                      <th className="px-4 py-2.5">Consistency Streak</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          No attendance logged yet today. Select a member above to record check-in!
                        </td>
                      </tr>
                    ) : (
                      attendance.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {att.member_name}{" "}
                            <span className="font-mono text-[11px] font-normal text-slate-400">
                              ({att.member_id})
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                att.role === "trainer"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {att.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{att.checkin_time}</td>
                          <td className="px-4 py-3 text-slate-600">{att.workout_type}</td>
                          <td className="px-4 py-3 font-bold text-orange-600">
                            <span className="inline-flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {att.streak_after_checkin} Days
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                gymDataManager.removeCheckin(activeGymId, att.id);
                                reloadData();
                                showToast(`Removed check-in record for ${att.member_name}.`);
                              }}
                              className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition"
                            >
                              Undo Check-In
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: ANALYTICS (VISIBLE ONLY TO THE ADMIN PROFILE)
            ========================================================================= */}
        {activeTab === "Analytics" && currentUser.role === "admin" && (
          <div className="space-y-6">
            {/* Admin Security Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Admin Executive Analytics &amp; Revenue Metrics
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    This section is restricted to the Admin profile. Normal users cannot access financial data.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                Admin Verified
              </span>
            </div>

            {/* Revenue & Growth KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card-subtle rounded-3xl p-5">
                <p className="text-xs font-semibold text-slate-500">Gross Collections</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  ₹{adminStats.grossRevenue.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                  Net Ex-GST: ₹{adminStats.netRevenue.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <p className="text-xs font-semibold text-slate-500">Pending Receivables</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">
                  ₹{adminStats.pendingReceivables.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Uncollected fees pending follow-up</p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <p className="text-xs font-semibold text-slate-500">Avg Revenue Per Member</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  ₹{adminStats.avgRevenuePerMember.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">+{adminStats.monthlyGrowthPct}% vs last quarter</p>
              </div>

              <div className="card-subtle rounded-3xl p-5">
                <p className="text-xs font-semibold text-slate-500">Member Retention Rate</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {adminStats.retentionRatePct}%
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Annual retention score</p>
              </div>
            </div>

            {/* Churn Radar & Expirations */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card-subtle rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Expiration &amp; Renewal Radar</h3>
                    <p className="text-xs text-slate-500">Members nearing plan expiry requiring WhatsApp reminder.</p>
                  </div>
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                    Critical Retention
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
                    <p className="text-xs font-semibold text-red-700">Expiring in ≤ 3 Days</p>
                    <p className="mt-1 text-2xl font-extrabold text-red-900">
                      {adminStats.expiringIn3Days}
                    </p>
                    <p className="mt-1 text-[11px] text-red-600">Immediate WhatsApp nudge</p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <p className="text-xs font-semibold text-amber-700">Expiring in 4–7 Days</p>
                    <p className="mt-1 text-2xl font-extrabold text-amber-900">
                      {adminStats.expiringIn7Days}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-600">Renewal offer eligible</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-600">
                    Peak Floor Rush: <strong className="text-slate-900">{adminStats.attendancePeakHour}</strong>
                  </p>
                </div>
              </div>

              {/* Package Revenue Share */}
              <div className="card-subtle rounded-3xl p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Package Distribution &amp; Share</h3>
                <p className="text-xs text-slate-500 mb-4">Popularity breakdown across membership tiers.</p>

                <div className="space-y-3">
                  {adminStats.planBreakdown.map((plan) => (
                    <div key={plan.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-800">{plan.name}</span>
                        <span className="text-slate-500">
                          {plan.count} members ({plan.sharePct}%) • ₹{plan.revenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(plan.sharePct, 5)}%` }}
                          className="h-full rounded-full bg-emerald-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trainer Supervised Metrics */}
            <div className="card-subtle rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Trainer Floor Performance</h3>
              <p className="text-xs text-slate-500 mb-4">Active clients assigned and assistance records.</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {adminStats.trainerPerformance.map((t) => (
                  <div key={t.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.activeClients} Active Assigned Clients</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700">★ {t.rating}</p>
                      <p className="text-[11px] text-slate-400">{t.checkinsAssisted} check-ins</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 5: PACKAGES (EDITABLE BY ADMIN, VIEW ONLY BY NORMAL USERS)
            ========================================================================= */}
        {activeTab === "Packages" && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gym Membership Packages</h3>
                <p className="text-xs text-slate-500">
                  {currentUser.role === "admin"
                    ? "Admin Controls: You can create, edit, or remove membership tiers."
                    : "Member View: You can explore available plans and inclusions (read-only)."}
                </p>
              </div>

              {currentUser.role === "admin" ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackage(null);
                    setPackageModalOpen(true);
                  }}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  + Add New Package
                </button>
              ) : (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                  Read-Only Mode
                </span>
              )}
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`card-subtle flex flex-col justify-between rounded-3xl p-6 transition ${
                    pkg.popular ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">{pkg.name}</span>
                      {pkg.popular && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <p className="text-3xl font-extrabold text-slate-900">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pkg.durationDays} Days Duration (~₹{Math.round(pkg.price / pkg.durationDays)}/day)
                    </p>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Features:</p>
                      {(pkg.features || []).map((feat, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </p>
                      ))}
                      {pkg.maxFreezeDays > 0 && (
                        <p className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Up to {pkg.maxFreezeDays} freeze days included</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions depending on role */}
                  <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between">
                    {currentUser.role === "admin" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPackage(pkg);
                            setPackageModalOpen(true);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Edit Package -&gt;
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete package "${pkg.name}"?`)) {
                              gymDataManager.deletePackage(activeGymId, pkg.id);
                              reloadData();
                              showToast(`Deleted package ${pkg.name}.`);
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        Inquire at front desk to enroll
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 6: COMMUNITY (COMMON COMMUNITY FEED FOR MEMBER ACHIEVEMENTS)
            ========================================================================= */}
        {activeTab === "Community" && (
          <div className="space-y-6">
            {/* Header & Post Creator Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 card-subtle rounded-3xl p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    GYM COMMUNITY
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Member Achievement Feed</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Share workout milestones, personal bests, and cheer on fellow gym bros &amp; trainers!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShareAchievementOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Trophy className="h-4 w-4" /> + Share Achievement
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Posts" },
                { id: "Personal Record", label: "Personal Record 🏋️" },
                { id: "Streak Milestone", label: "Streak Milestones 🔥" },
                { id: "Weight Goal", label: "Weight Goal 🎯" },
                { id: "Transformation", label: "Transformations 💫" },
                { id: "Community Event", label: "Gym Events 📅" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCommunityCategoryFilter(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    communityCategoryFilter === cat.id
                      ? "bg-slate-900 text-white font-bold shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Community Feed Posts */}
            <div className="space-y-5">
              {filteredPosts.length === 0 ? (
                <div className="card-subtle rounded-3xl p-10 text-center text-slate-400">
                  <p className="text-sm font-semibold">No community posts in this category yet.</p>
                  <p className="text-xs mt-1">Be the first to share your workout milestone!</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="card-subtle rounded-3xl p-6">
                    {/* Post Author Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-800">
                          {post.author_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{post.author_name}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                post.author_role === "trainer"
                                  ? "bg-purple-100 text-purple-800"
                                  : post.author_role === "admin"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {post.author_role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{post.created_at}</p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Content */}
                    <h4 className="text-base font-extrabold text-slate-900 mt-2">{post.title}</h4>
                    {post.metric_badge && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-900">
                          <Flame className="h-3.5 w-3.5 text-emerald-600" />
                          {post.metric_badge}
                        </span>
                      </div>
                    )}
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Likes & Comments Count */}
                    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          gymDataManager.toggleLikePost(activeGymId, post.id);
                          reloadData();
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          post.liked_by_me
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{post.likes} Cheers</span>
                      </button>

                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.comments.length} Comments</span>
                      </span>
                    </div>

                    {/* Comment Thread */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 space-y-2.5 border-t border-slate-100/70 pt-3 bg-slate-50/50 rounded-2xl p-3">
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-xs">
                            <span className="font-bold text-slate-900">{c.author_name}: </span>
                            <span className="text-slate-700">{c.text}</span>
                            <span className="ml-2 text-[10px] text-slate-400">{c.created_at}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="mt-3 flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Cheer on this achievement or add a tip..."
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          APPLICATION MODALS & DRAWERS
          ========================================================================= */}
      {/* 1. Add Member Modal */}
      <AddMemberModal
        open={addMemberOpen}
        gymId={activeGymId}
        packages={packages}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={(newMem) => {
          reloadData();
          showToast(`Registered ${newMem.name} (${newMem.member_id}) successfully.`);
        }}
      />

      {/* 2. Member Profile Drawer (All fields editable except member_id) */}
      <MemberProfileDrawer
        member={selectedMember}
        gymName={activeGym.name}
        packages={packages}
        onClose={() => setSelectedMember(null)}
        onUpdated={(upd) => {
          setSelectedMember(upd);
          reloadData();
          showToast(`Updated profile for ${upd.name}.`);
        }}
        onDeleted={(mid) => {
          setSelectedMember(null);
          reloadData();
          showToast(`Member removed.`);
        }}
        onCheckin={(mid) => {
          handleRecordCheckin(mid);
        }}
      />

      {/* 3. Package Add / Edit Modal (Admin only) */}
      <PackageModal
        open={packageModalOpen}
        gymId={activeGymId}
        pkg={editingPackage}
        onClose={() => setPackageModalOpen(false)}
        onSuccess={(saved) => {
          reloadData();
          showToast(`Package "${saved.name}" saved successfully.`);
        }}
      />

      {/* 4. Add New Gym Profile Modal (Admin only) */}
      <AddGymModal
        open={addGymOpen}
        onClose={() => setAddGymOpen(false)}
        onSuccess={(newGym) => {
          gymDataManager.setActiveGymId(newGym.id);
          reloadData();
          showToast(`Created new gym profile "${newGym.name}"! Switched to new gym.`);
        }}
      />

      {/* 5. User Auth & Role Switcher Modal */}
      <AuthModal
        open={authModalOpen}
        currentGymId={activeGymId}
        currentUser={currentUser}
        gyms={gyms}
        users={gymDataManager.getUsers()}
        onClose={() => setAuthModalOpen(false)}
        onUserSelected={(user, targetGymId) => {
          gymDataManager.setActiveUser(user);
          setCurrentUser(user);
          if (targetGymId) {
            gymDataManager.setActiveGymId(targetGymId);
            setActiveGymId(targetGymId);
          }
          reloadData();
          showToast(`Logged in as ${user.name} (${user.role.toUpperCase()}).`);
        }}
      />

      {/* 6. Share Achievement Modal */}
      <ShareAchievementModal
        open={shareAchievementOpen}
        authorName={currentUser.name}
        authorRole={currentUser.role === "admin" ? "admin" : "member"}
        onClose={() => setShareAchievementOpen(false)}
        onSubmit={(postData) => {
          gymDataManager.addCommunityPost(activeGymId, {
            ...postData,
            author_id: currentUser.id,
            author_name: currentUser.name,
            author_role: currentUser.role === "admin" ? "admin" : "member",
          });
          reloadData();
          showToast("Achievement posted to gym community!");
        }}
      />
    </div>
  );
}
