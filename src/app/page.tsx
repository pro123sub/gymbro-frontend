"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  QrCode,
  Check,
  Mail,
  Send,
  Sparkles,
  FileText,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  BarChart3,
  Workflow,
  Flame,
  TrendingUp,
  IndianRupee,
  Clock,
  Activity,
  Bot,
  Database,
  Play,
  Code2,
  Award,
} from "lucide-react";
import {
  AccountsSummary,
  AttendanceRow,
  AutomationSimulationResult,
  CopilotStatus,
  DashboardAnalytics,
  ExpenseRecord,
  FollowUpItem,
  GstInvoice,
  MemberRecord,
  MembershipPlan,
  PaymentRecord,
  ReceivableItem,
  ScheduledJob,
  WorkflowItem,
  gymApi,
} from "@/lib/api";
import PromptCommandBar from "@/components/PromptCommandBar";
import AutomationControlTab from "@/components/AutomationControlTab";
import { AddMemberModal, GstInvoiceModal, Member360Drawer, PlanModal } from "@/components/Modals";

type NavTab =
  | "Dashboard"
  | "Members"
  | "Attendance"
  | "Payments"
  | "Packages"
  | "Follow-ups"
  | "Reports & analytics"
  | "Staff & roles";

const NAV_META: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Members", label: "Members", icon: Users },
  { id: "Attendance", label: "Attendance", icon: QrCode },
  { id: "Payments", label: "Payments", icon: CreditCard },
  { id: "Packages", label: "Packages", icon: Layers },
  { id: "Follow-ups", label: "Follow-ups", icon: Mail },
  { id: "Reports & analytics", label: "Reports & analytics", icon: BarChart3 },
  { id: "Staff & roles", label: "Staff & roles", icon: Workflow },
];

const HEADER_META: Record<NavTab, { crumb: string; title: string; subtitle: string }> = {
  Dashboard: {
    crumb: "OVERVIEW / AUTOMATION COMMAND CENTER",
    title: "Good afternoon, Priyanshu",
    subtitle: "Run end-to-end OpenAI, Google Sheets & Railway n8n studio automations from one workspace.",
  },
  Members: {
    crumb: "MEMBERS / DIRECTORY",
    title: "Member management",
    subtitle: "Register members, track streaks, check-in on the fly and inspect 18-column Google Sheets rows.",
  },
  Attendance: {
    crumb: "OPERATIONS / ATTENDANCE",
    title: "Attendance & streaks",
    subtitle: "Scan member IDs or phones in 1 click, monitor floor check-ins and celebrate workout streaks.",
  },
  Payments: {
    crumb: "FINANCE / GST BILLING",
    title: "Payments & 18% GST invoices",
    subtitle: "Collect pending fees, auto-extend validity dates and issue printable CGST + SGST tax invoices.",
  },
  Packages: {
    crumb: "CONFIGURATION / PACKAGES",
    title: "Membership packages",
    subtitle: "Manage Monthly, Quarterly, Half-Yearly & Annual plans, freeze quotas and auto-renewal rules.",
  },
  "Follow-ups": {
    crumb: "RETENTION / GM-02 ENGINE",
    title: "Automated email follow-ups",
    subtitle: "Prioritized T0/T3/T7 expiry, pending dues and 5-day inactivity recovery powered by Gmail + GM-02.",
  },
  "Reports & analytics": {
    crumb: "FINANCE / CFO ANALYTICS",
    title: "CFO accounts, GST & expenses",
    subtitle: "Net revenue ex-GST, CGST/SGST liability, P&L profit margin and overdue fee recovery.",
  },
  "Staff & roles": {
    crumb: "CONTROL PLANE / n8n & SHEETS",
    title: "n8n pipelines & Google Sheets DB",
    subtitle: "Trigger GM-01..GM-05 workflows live, manage IST cron schedules and inspect all Sheets tabs.",
  },
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount || 0));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function GymFlowAdminPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("Dashboard");
  const [workspaceName, setWorkspaceName] = useState("Crush Lifestyle Studio");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromptBar, setShowPromptBar] = useState(true);

  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [copilotStatus, setCopilotStatus] = useState<CopilotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Core backend state
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<AttendanceRow[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<Record<string, unknown>>>([]);
  const [dueFollowUps, setDueFollowUps] = useState<FollowUpItem[]>([]);
  const [followUpLogs, setFollowUpLogs] = useState<Array<Record<string, unknown>>>([]);
  const [accounts, setAccounts] = useState<AccountsSummary | null>(null);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<Record<string, unknown> | null>(null);

  // Interactive Experience Lab & OpenAI Executive Brief state
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<AutomationSimulationResult | null>(null);
  const [showSimRawJson, setShowSimRawJson] = useState(false);
  const [aiBrief, setAiBrief] = useState<{ brief: string; model: string; openai_used: boolean } | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);

  // Filters & interactive modals
  const [memberStatusFilter, setMemberStatusFilter] = useState("ALL");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<GstInvoice | null>(null);

  // Quick Attendance form
  const [qrInput, setQrInput] = useState("");
  const [workoutType, setWorkoutType] = useState("Gym Floor");

  // Quick Expense form
  const [expCategory, setExpCategory] = useState("Electricity & Utilities");
  const [expAmount, setExpAmount] = useState("2500");
  const [expVendor, setExpVendor] = useState("");

  // Quick Payment form
  const [payMemberId, setPayMemberId] = useState("");
  const [payAmount, setPayAmount] = useState("1500");
  const [payMode, setPayMode] = useState("UPI");

  const showToast = useCallback((text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 5500);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [statusInfo] = await Promise.all([gymApi.getCopilotStatus(), gymApi.getHealth()]);
      setCopilotStatus(statusInfo);
      setApiOnline(true);

      const [
        dashRes,
        memRes,
        planRes,
        payRes,
        ciTodayRes,
        ciHistRes,
        lbRes,
        dueRes,
        flwHistRes,
        accRes,
        recvRes,
        expRes,
        wfRes,
        schedRes,
        stRes,
      ] = await Promise.all([
        gymApi.getDashboardAnalytics(),
        gymApi.listMembers(),
        gymApi.listPlans(),
        gymApi.listPayments(),
        gymApi.getTodayAttendance(),
        gymApi.getAttendanceHistory(40),
        gymApi.getStreakLeaderboard(8),
        gymApi.getDueFollowUps(),
        gymApi.getFollowUpHistory(),
        gymApi.getAccountsSummary(),
        gymApi.getPendingReceivables(),
        gymApi.listExpenses(),
        gymApi.listWorkflows(),
        gymApi.listSchedules(),
        gymApi.getSheetsStatus(),
      ]);

      setAnalytics(dashRes);
      setMembers(memRes.members);
      setPlans(planRes.plans);
      setPayments(payRes.payments);
      setTodayCheckins(ciTodayRes.checkins);
      setAttendanceHistory(ciHistRes.checkins);
      setLeaderboard(lbRes.leaderboard);
      setDueFollowUps(dueRes.follow_ups);
      setFollowUpLogs(flwHistRes.logs);
      setAccounts(accRes);
      setReceivables(recvRes.receivables);
      setExpenses(expRes.expenses);
      setWorkflows(wfRes.workflows);
      setSchedules(schedRes.schedules);
      setSheetsStatus(stRes);
    } catch (err) {
      setApiOnline(false);
      gymApi.getCopilotStatus().then(setCopilotStatus).catch(() => null);
      showToast(
        err instanceof Error
          ? `Backend offline (${err.message}). Start FastAPI or configure API URL in Staff & roles.`
          : "Backend unreachable.",
        true
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return members.filter((m) => {
      if (memberStatusFilter !== "ALL") {
        if (memberStatusFilter === "Pending" && m.payment_status !== "Pending") return false;
        if (memberStatusFilter !== "Pending" && m.member_status !== memberStatusFilter) return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.member_id.toLowerCase().includes(q) ||
        m.plan.toLowerCase().includes(q)
      );
    });
  }, [members, memberStatusFilter, searchQuery]);

  async function runLabScenario(key: string, runner: () => Promise<AutomationSimulationResult>) {
    if (runningScenario) return;
    setRunningScenario(key);
    setShowSimRawJson(false);
    try {
      const res = await runner();
      setSimResult(res);
      showToast(`${res.title} completed.`);
      await refreshAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Automation scenario failed.", true);
    } finally {
      setRunningScenario(null);
    }
  }

  async function handleGenerateAiBrief() {
    if (loadingBrief) return;
    setLoadingBrief(true);
    try {
      const snapshot = {
        active_members: analytics?.active_members ?? 0,
        total_members: analytics?.total_members ?? 0,
        frozen_members: analytics?.frozen_members ?? 0,
        expiring_in_7_days: analytics?.expiring_in_7_days ?? 0,
        gross_collections_inr: accounts?.gross_collections ?? 0,
        total_expenses_inr: accounts?.total_expenses ?? 0,
        net_profit_inr: accounts?.net_profit ?? 0,
        pending_receivables_inr: accounts?.pending_receivables_amount ?? 0,
        pending_receivables_count: accounts?.pending_receivables_count ?? 0,
        due_followups_count: dueFollowUps.length,
        checkins_today: analytics?.checkins_today ?? 0,
      };
      const res = await gymApi.getExecutiveBrief(snapshot);
      setAiBrief(res);
      showToast(res.openai_used ? `Generated executive brief via OpenAI (${res.model}).` : "Generated fallback studio brief.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not generate brief.", true);
    } finally {
      setLoadingBrief(false);
    }
  }

  async function handleQuickCheckIn(e: React.FormEvent) {
    e.preventDefault();
    const val = qrInput.trim();
    if (!val) return;
    try {
      const payload = val.toUpperCase().startsWith("MEM-")
        ? { member_id: val.toUpperCase(), workout_type: workoutType }
        : { phone: val, workout_type: workoutType };
      const res = await gymApi.checkInMember(payload);
      showToast(
        res.already_checked_in_today
          ? `${res.member_name} already checked in today (${res.current_streak}d streak).`
          : `Checked in ${res.member_name}! Current streak: ${res.current_streak}d.`
      );
      setQrInput("");
      await refreshAll();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Check-in failed", true);
    }
  }

  const header = HEADER_META[activeTab];
  const monthlyCollectionData = useMemo(() => {
    const liveVal = accounts?.gross_collections ?? analytics?.total_revenue_collected ?? 0;
    const base = [
      { month: "May", value: 185000, peak: false },
      { month: "Jun", value: 215000, peak: false },
      { month: "Jul", value: 168000, peak: false },
      { month: "Aug", value: 245000, peak: false },
      { month: "Sep", value: 298000, peak: liveVal <= 298000 },
      { month: "Oct", value: 262000, peak: false },
      { month: "Now", value: Math.max(liveVal, 25000), peak: liveVal > 298000 },
    ];
    const maxVal = Math.max(...base.map((b) => b.value), 1);
    return base.map((b) => ({ ...b, pct: Math.max(18, Math.round((b.value / maxVal) * 100)) }));
  }, [accounts, analytics]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f2f5f3] text-slate-900 lg:flex-row">
      {/* Left Fixed Obsidian-Forest Sidebar */}
      <aside className="flex w-full shrink-0 flex-col justify-between bg-[#071912] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-neon text-forest shadow-md shadow-lime-neon/25">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-base font-extrabold tracking-wide text-white leading-none">GYMFLOW</p>
                <p className="mt-1 text-[10px] font-semibold tracking-widest text-emerald-200/60">AI + n8n EDITION</p>
              </div>
            </div>
          </div>

          {/* Workspace Selector */}
          <div className="mt-5 px-1">
            <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-emerald-200/50">STUDIO WORKSPACE</p>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white">
              <span className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 rounded-full bg-lime-neon" />
                <select
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="cursor-pointer bg-transparent text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="Crush Lifestyle Studio" className="text-slate-900">Crush Lifestyle Studio</option>
                  <option value="Downtown Fitness Club" className="text-slate-900">Downtown Fitness Club</option>
                  <option value="Indiranagar Branch" className="text-slate-900">Indiranagar Branch</option>
                </select>
              </span>
              <ChevronDown className="pointer-events-none h-3.5 w-3.5 text-emerald-200/70" />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-5">
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-emerald-200/50">NAVIGATION</p>
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1 lg:space-y-1">
              {NAV_META.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[13px] transition ${
                      isActive
                        ? "bg-gradient-to-r from-[#184531] to-[#1f563d] font-semibold text-white shadow-sm ring-1 ring-lime-neon/30"
                        : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-lime-neon" : "text-emerald-200/60"}`} />
                    <span className="truncate">{item.label}</span>
                    {item.id === "Follow-ups" && dueFollowUps.length > 0 && (
                      <span className="ml-auto rounded-full bg-lime-neon px-1.5 py-0.5 text-[10px] font-extrabold text-forest">
                        {dueFollowUps.length}
                      </span>
                    )}
                    {item.id === "Staff & roles" && (
                      <span className="ml-auto hidden rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200/80 lg:inline">
                        {workflows.length || 5}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Live Telemetry & Demo Seed Box */}
        <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-[11px]">
            <p className="mb-2 text-[10px] font-bold tracking-widest text-emerald-200/50">LIVE STACK STATUS</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/80">FastAPI Engine</span>
                <span className={`font-semibold ${apiOnline ? "text-lime-neon" : "text-red-300"}`}>
                  {apiOnline === null ? "Checking..." : apiOnline ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/80">OpenAI Model</span>
                <span className="font-semibold text-lime-neon">
                  {copilotStatus?.openai_configured ? copilotStatus.openai_model : "fallback"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/80">Railway n8n</span>
                <span className="font-semibold text-emerald-200">
                  {workflows.filter((w) => w.is_enabled).length || 5}/5 Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/80">Google Sheets</span>
                <span className="font-semibold text-emerald-200">Synced</span>
              </div>
            </div>
            <button
              type="button"
              disabled={runningScenario !== null}
              onClick={() => {
                setActiveTab("Dashboard");
                void runLabScenario("SEED", gymApi.seedRichDemoScenario);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-lime-neon py-1.5 text-[11px] font-extrabold text-forest transition hover:brightness-95 disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" />
              {runningScenario === "SEED" ? "Seeding Studio..." : "Seed Live Demo Gym"}
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-bold tracking-wide text-white">PRIYANSHU ROUTH</p>
              <p className="text-[11px] text-emerald-200/60">Super admin</p>
            </div>
            <span
              title={apiOnline ? "Connected to FastAPI" : "Offline"}
              className={`h-2.5 w-2.5 rounded-full ${apiOnline ? "bg-lime-neon shadow-[0_0_8px_#b9f44d]" : "bg-red-400"}`}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 text-xs font-medium shadow-md ${
              toast.isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-[#eef7e6] text-forest"
            }`}
          >
            <span className="flex items-center gap-2">
              {toast.isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-accent" />}
              {toast.text}
            </span>
            <button type="button" onClick={() => setToast(null)} className="ml-4 font-semibold text-slate-500 hover:text-slate-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold tracking-wider text-forest-accent">{header.crumb}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  apiOnline ? "bg-emerald-100 text-forest-accent" : "bg-amber-100 text-amber-800"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? "bg-forest-accent" : "bg-amber-600"}`} />
                {apiOnline ? "Live Synced" : "Disconnected"}
              </span>
            </div>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">{header.title}</h1>
            <p className="mt-0.5 text-xs text-slate-500">{header.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members, ID, phone..."
                className="w-48 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-forest-accent focus:outline-none sm:w-56"
              />
            </div>

            <button
              type="button"
              onClick={() => void refreshAll()}
              title="Refresh studio telemetry"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-forest-accent" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowPromptBar((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm transition ${
                showPromptBar
                  ? "border-forest bg-forest text-lime-neon"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Command
            </button>

            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-4 py-2 text-xs font-extrabold text-forest shadow-sm transition hover:brightness-95"
            >
              <Plus className="h-3.5 w-3.5" /> Add member
            </button>
          </div>
        </header>

        {/* AI Command Deck */}
        {showPromptBar && <PromptCommandBar onActionCompleted={refreshAll} copilotStatus={copilotStatus} />}

        {/* Top 4 KPI Bento Cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Active members</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7e6] text-forest-accent">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="tabular-nums mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatInr(analytics?.active_members ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              {analytics?.total_members ?? 0} total · {analytics?.frozen_members ?? 0} frozen · {analytics?.expiring_in_7_days ?? 0} exp ≤7d
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Gross collections</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7e6] text-forest-accent">
                <IndianRupee className="h-4 w-4" />
              </span>
            </div>
            <p className="tabular-nums mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{formatInr(accounts?.gross_collections ?? analytics?.total_revenue_collected ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              ₹{formatInr(accounts?.collections_today ?? analytics?.collections_today ?? 0)} today · {accounts?.profit_margin_pct ?? 0}% net margin
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Pending receivables</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="tabular-nums mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{formatInr(accounts?.pending_receivables_amount ?? analytics?.pending_dues_amount ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-700">
              {accounts?.pending_receivables_count ?? analytics?.pending_dues_count ?? 0} unpaid fee(s) ready for GM-02
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Today&apos;s attendance</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7e6] text-forest-accent">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <p className="tabular-nums mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatInr(analytics?.checkins_today ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              {dueFollowUps.length} email follow-up(s) queued today
            </p>
          </div>
        </section>

        {/* ----------------------------- VIEW 1: DASHBOARD ----------------------------- */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            {/* Interactive Live Automation Experience Lab */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-forest px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-lime-neon">
                      INTERACTIVE LAB
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Experience End-to-End Studio Automations (1 Click)
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Click any card below to execute live FastAPI logic, sync Google Sheets rows, run OpenAI GPT-4o-mini, and fire Railway n8n webhooks.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingBrief}
                  onClick={() => void handleGenerateAiBrief()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-[#eef7e6] px-4 py-2 text-xs font-bold text-forest transition hover:bg-lime-neon"
                >
                  <Bot className={`h-4 w-4 ${loadingBrief ? "animate-pulse" : ""}`} />
                  {loadingBrief ? "Thinking..." : "OpenAI CEO Brief"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[
                  {
                    key: "SEED",
                    badge: "SETUP",
                    title: "Seed Demo Gym",
                    desc: "Create 6 members (Active, T-3, Pending, Frozen) + check-ins + expenses",
                    action: gymApi.seedRichDemoScenario,
                  },
                  {
                    key: "GM-01",
                    badge: "GM-01",
                    title: "Smart Register",
                    desc: "Walk-in signup -> MEM-ID -> 18-Col Sheet -> 18% GST -> n8n",
                    action: gymApi.simulateGm01Registration,
                  },
                  {
                    key: "GM-02",
                    badge: "GM-02",
                    title: "Email Cadence",
                    desc: "Scan T0/T3/Pending dues & send Gmail follow-ups via n8n",
                    action: gymApi.simulateGm02EmailSweep,
                  },
                  {
                    key: "GM-03",
                    badge: "GM-03",
                    title: "Pay & Renew",
                    desc: "Settle due fee -> Issue CGST/SGST Invoice -> Extend expiry",
                    action: gymApi.simulateGm03PaymentRenewal,
                  },
                  {
                    key: "GM-04",
                    badge: "GM-04",
                    title: "9PM Digest",
                    desc: "Status transitions + churn radar + CFO P&L digest",
                    action: gymApi.simulateGm04OwnerDigest,
                  },
                  {
                    key: "GM-05",
                    badge: "GM-05",
                    title: "OpenAI Autopilot",
                    desc: "Full autonomous cycle via OpenAI GPT-4o-mini + n8n",
                    action: () => gymApi.simulateGm05AiAutopilot(),
                  },
                ].map((card) => {
                  const isBusy = runningScenario === card.key;
                  const isLast = simResult?.workflow_code === card.key;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      disabled={runningScenario !== null}
                      onClick={() => void runLabScenario(card.key, card.action)}
                      className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                        isLast
                          ? "border-forest bg-[#eef7e6]/70 ring-1 ring-forest/20"
                          : "border-slate-200 bg-[#f9fbfa] hover:border-forest-accent/50 hover:bg-white hover:shadow-md"
                      } disabled:opacity-60`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-forest px-2 py-0.5 font-mono text-[10px] font-bold text-lime-neon">
                            {card.badge}
                          </span>
                          {isBusy ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-forest-accent" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-forest-accent" />
                          )}
                        </div>
                        <p className="mt-2.5 text-xs font-extrabold text-slate-900">{card.title}</p>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">{card.desc}</p>
                      </div>
                      <span className="mt-3 text-[11px] font-bold text-forest-accent">
                        {isBusy ? "Running pipeline..." : "Run now ->"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* OpenAI Executive Brief Drawer */}
              {aiBrief && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-[#f0f7f3] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-forest-accent" />
                      <span className="text-xs font-bold text-forest">
                        OpenAI Executive Studio Strategy ({aiBrief.model})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiBrief(null)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700">{aiBrief.brief}</div>
                </div>
              )}

              {/* Live Stepper Result Card */}
              {simResult && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-lime-neon px-2.5 py-0.5 text-[10px] font-extrabold text-forest">
                        {simResult.workflow_code}
                      </span>
                      <span className="text-xs font-bold text-white">{simResult.title}</span>
                      <span className="text-[11px] text-emerald-200/70">{simResult.timestamp_ist}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSimRawJson((s) => !s)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-lime-neon hover:bg-white/10"
                    >
                      <Code2 className="h-3 w-3" />
                      {showSimRawJson ? "Hide Payload" : "Inspect JSON"}
                      {showSimRawJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-emerald-50">{simResult.summary}</p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {simResult.steps.map((step) => (
                      <div key={step.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-lime-neon">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{step.label}</span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-emerald-100/80" title={step.detail}>
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {showSimRawJson && (
                    <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/50 p-3 text-[11px] text-emerald-200">
                      {JSON.stringify(simResult.raw_result, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Monthly Collection Chart & Package Distribution */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
              <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Monthly collection performance</p>
                    <p className="text-xs text-slate-500">Live INR revenue trajectory with peak month highlight</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7e6] px-2.5 py-1 text-[11px] font-bold text-forest-accent">
                    <TrendingUp className="h-3.5 w-3.5" /> ₹{formatInr(accounts?.gross_collections ?? 0)} live
                  </span>
                </div>
                <div className="mt-6 flex h-48 items-end justify-around gap-3 px-2">
                  {monthlyCollectionData.map((bar) => (
                    <div key={bar.month} className="group flex flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 opacity-0 transition group-hover:opacity-100">
                        ₹{formatInr(bar.value)}
                      </span>
                      <div className="flex h-36 w-full items-end justify-center">
                        <div
                          title={`₹${formatInr(bar.value)}`}
                          style={{ height: `${bar.pct}%` }}
                          className={`w-7 sm:w-9 rounded-xl transition-all duration-300 ${
                            bar.peak
                              ? "bg-gradient-to-t from-[#96df22] to-lime-neon shadow-md shadow-lime-neon/30"
                              : "bg-gradient-to-t from-forest to-forest-accent group-hover:brightness-110"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-900">Members by active package</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {analytics?.total_members ?? 0} total members
                </p>
                <div className="mt-5 space-y-3.5 text-xs">
                  {["Monthly", "Quarterly", "Half-Yearly", "Yearly"].map((pkg) => {
                    const count = analytics?.plan_breakdown?.[pkg] ?? 0;
                    const total = Math.max(analytics?.total_members || 1, 1);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={pkg}>
                        <div className="mb-1 flex items-center justify-between text-slate-600">
                          <span className="font-semibold text-slate-800">{pkg === "Yearly" ? "Annual" : pkg}</span>
                          <span className="font-bold text-slate-900">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                            className={`h-full rounded-full ${pkg === "Yearly" ? "bg-lime-neon" : "bg-forest-accent"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards: Pipeline Registry & Recent Audit Timeline */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-forest-accent" />
                    <p className="text-sm font-bold text-slate-900">Connected n8n Pipelines</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Staff & roles")}
                    className="text-xs font-bold text-forest-accent hover:underline"
                  >
                    Control Plane -&gt;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {workflows.map((wf) => (
                    <div
                      key={wf.workflow_code}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#f8fbf9] px-3.5 py-2.5"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-lime-neon">
                            {wf.workflow_code}
                          </span>
                          <span className="truncate text-xs font-bold text-slate-800">
                            {wf.name.replace(`${wf.workflow_code} - `, "")}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          Runs: {wf.total_runs} · {wf.webhook_ready ? "Live webhook bound" : "Local pipeline"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void gymApi
                            .triggerWorkflow(wf.workflow_code, wf.workflow_code === "GM-05" ? { message: "Run full gym autopilot" } : {})
                            .then(() => {
                              showToast(`Triggered ${wf.workflow_code} pipeline.`);
                              return refreshAll();
                            })
                            .catch((e) => showToast(e.message, true))
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime-neon px-3 py-1.5 text-[11px] font-extrabold text-forest hover:brightness-95"
                      >
                        <Zap className="h-3 w-3" /> Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-forest-accent" />
                    <p className="text-sm font-bold text-slate-900">Recent AI &amp; Automation Audit Logs</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Staff & roles")}
                    className="text-xs font-bold text-forest-accent hover:underline"
                  >
                    View Sheets Tabs -&gt;
                  </button>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {(analytics?.recent_automation_logs || []).length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 py-10 text-center text-xs text-slate-400">
                      No automation runs logged yet. Click &ldquo;Seed Demo Gym&rdquo; or run a workflow above!
                    </p>
                  ) : (
                    analytics?.recent_automation_logs.map((log) => (
                      <div key={log.log_id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-forest-accent">
                            {log.workflow} · {log.event_type}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200/70">
                            {log.status}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-slate-600">{log.details || log.created_at_ist}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 2: MEMBERS ----------------------------- */}
        {activeTab === "Members" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Member directory ({filteredMembers.length})</h3>
                <p className="text-xs text-slate-500">
                  Run inline 1-click Check-in or Fee Settlement, or click any row for full 360° profile &amp; freeze controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "Active", "Frozen", "Pending", "Expired"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setMemberStatusFilter(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      memberStatusFilter === status
                        ? "bg-forest text-lime-neon"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Package</th>
                    <th className="px-4 py-3 font-semibold">Validity</th>
                    <th className="px-4 py-3 font-semibold">Streak</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No members match yet. Click <strong>Seed Live Demo Gym</strong> in the sidebar or{" "}
                        <strong>+ Add member</strong> above!
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr
                        key={m.member_id}
                        onClick={() => setSelectedMemberId(m.member_id)}
                        className="cursor-pointer transition hover:bg-[#f4f9f6]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-lime-neon">
                              {getInitials(m.name)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{m.name}</p>
                              <p className="font-mono text-[11px] text-slate-400">{m.member_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">+{m.phone}</p>
                          <p className="text-[11px] text-slate-400">{m.email || "No email"}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {m.plan === "Yearly" ? "Annual" : m.plan} · ₹{formatInr(m.fee)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700">{m.expiry_date}</p>
                          <p className="text-[11px] text-slate-400">
                            {m.days_remaining >= 0 ? `${m.days_remaining}d left` : `${Math.abs(m.days_remaining)}d expired`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
                            <Flame className="h-3 w-3" /> {m.current_streak}d
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              m.payment_status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : m.member_status === "Frozen"
                                  ? "bg-sky-100 text-sky-800"
                                  : m.member_status === "Expired" || m.member_status === "Cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-forest-accent"
                            }`}
                          >
                            {m.payment_status === "Pending" ? "Pending" : m.member_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() =>
                              void gymApi
                                .checkInMember({ member_id: m.member_id, workout_type: "Gym Floor" })
                                .then((r) => {
                                  showToast(`Checked in ${r.member_name} (${r.current_streak}d streak).`);
                                  return refreshAll();
                                })
                                .catch((err) => showToast(err.message, true))
                            }
                            className="rounded-full bg-[#eef7e6] px-2.5 py-1 text-[11px] font-semibold text-forest-accent hover:bg-lime-neon hover:text-forest"
                          >
                            Check-in
                          </button>
                          {m.payment_status === "Pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                void gymApi
                                  .recordPayment({ member_id: m.member_id, amount_paid: m.fee, payment_mode: "UPI", extend_membership: true })
                                  .then((r) => {
                                    showToast(`Collected ₹${r.payment.amount_paid} (${r.payment.invoice_number}).`);
                                    return refreshAll();
                                  })
                                  .catch((err) => showToast(err.message, true))
                              }
                              className="rounded-full bg-lime-neon px-2.5 py-1 text-[11px] font-bold text-forest hover:brightness-95"
                            >
                              Collect Fee
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedMemberId(m.member_id)}
                            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            360°
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 3: ATTENDANCE ----------------------------- */}
        {activeTab === "Attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <form onSubmit={(e) => void handleQuickCheckIn(e)} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-base font-extrabold text-slate-900">Member Check-In &amp; QR Terminal</h3>
                <div className="rounded-2xl bg-[#eef7e6]/70 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-lime-neon">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Scan QR / Enter Member ID or Phone</p>
                  <p className="mb-3 text-xs text-slate-500">Auto-updates workout streaks &amp; milestone achievements</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="MEM-XXXXXXXX or 9876543210"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-forest-accent focus:outline-none"
                    />
                    <select
                      value={workoutType}
                      onChange={(e) => setWorkoutType(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-forest-accent focus:outline-none"
                    >
                      <option value="Gym Floor">Gym Floor</option>
                      <option value="Strength & Conditioning">Strength &amp; Conditioning</option>
                      <option value="HIIT / Burn">HIIT / Burn</option>
                      <option value="Yoga / Mobility">Yoga / Mobility</option>
                      <option value="Personal Training">Personal Training</option>
                    </select>
                  </div>
                  {members.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Quick Pick:</span>
                      {members.slice(0, 4).map((m) => (
                        <button
                          key={m.member_id}
                          type="button"
                          onClick={() => setQrInput(m.member_id)}
                          className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-forest-accent hover:bg-lime-neon hover:text-forest"
                        >
                          {m.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-lime-neon py-2.5 text-xs font-extrabold text-forest shadow-sm hover:brightness-95"
                >
                  <Check className="h-4 w-4" /> Record Check-In
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-base font-extrabold text-slate-900">Checked in today ({todayCheckins.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Member</th>
                        <th className="px-3 py-2">Time IST</th>
                        <th className="px-3 py-2">Workout</th>
                        <th className="px-3 py-2 text-right">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayCheckins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                            No check-ins yet today. Use Quick Pick on the left!
                          </td>
                        </tr>
                      ) : (
                        todayCheckins.map((row) => (
                          <tr key={row.attendance_id}>
                            <td className="px-3 py-2.5 font-semibold text-slate-900">{row.name || row.member_id}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.checkin_time_ist}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.workout_type}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-forest-accent">{row.streak_after_checkin}d</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {leaderboard.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Award className="h-3.5 w-3.5 text-amber-500" /> Top Consistency Streaks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {leaderboard.slice(0, 6).map((item) => (
                        <span key={String(item.member_id)} className="rounded-full bg-[#eef7e6] px-3 py-1 text-[11px] font-bold text-forest">
                          #{String(item.rank)} {String(item.name)} · {String(item.current_streak)}d
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-base font-extrabold text-slate-900">Attendance History Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Member</th>
                      <th className="px-4 py-2.5">Member ID</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Check-in IST</th>
                      <th className="px-4 py-2.5">Workout</th>
                      <th className="px-4 py-2.5">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No attendance logs yet.</td>
                      </tr>
                    ) : (
                      attendanceHistory.map((row) => (
                        <tr key={row.attendance_id}>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{row.name || row.member_id}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{row.member_id}</td>
                          <td className="px-4 py-2.5 text-slate-600">{row.checkin_date}</td>
                          <td className="px-4 py-2.5 text-slate-600">{row.checkin_time_ist}</td>
                          <td className="px-4 py-2.5 text-slate-600">{row.workout_type}</td>
                          <td className="px-4 py-2.5 font-bold text-forest-accent">{row.streak_after_checkin}d</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 4: PAYMENTS ----------------------------- */}
        {activeTab === "Payments" && (
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void gymApi
                  .recordPayment({
                    member_id: payMemberId,
                    amount_paid: Number(payAmount),
                    payment_mode: payMode,
                    extend_membership: true,
                  })
                  .then((res) => {
                    showToast(`Payment confirmed (${res.payment.invoice_number}). New expiry: ${res.member.expiry_date}`);
                    setPayMemberId("");
                    return refreshAll();
                  })
                  .catch((err) => showToast(err instanceof Error ? err.message : "Payment failed", true));
              }}
              className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
            >
              {members.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Select Member</label>
                  <select
                    value={payMemberId}
                    onChange={(e) => {
                      const mid = e.target.value;
                      setPayMemberId(mid);
                      const m = members.find((item) => item.member_id === mid);
                      if (m) setPayAmount(String(m.fee || 1500));
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="">Choose member...</option>
                    {members.map((m) => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.name} ({m.payment_status}) - ₹{m.fee}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Member ID</label>
                <input
                  required
                  value={payMemberId}
                  onChange={(e) => setPayMemberId(e.target.value)}
                  placeholder="MEM-XXXXXXXX"
                  className="rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Payment Mode</label>
                <select value={payMode} onChange={(e) => setPayMode(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <button type="submit" className="rounded-full bg-lime-neon px-5 py-2.5 text-xs font-extrabold text-forest shadow-sm hover:brightness-95">
                + Record Payment &amp; Extend (GM-03)
              </button>
            </form>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-base font-extrabold text-slate-900">18% GST Payment Ledger ({payments.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Invoice #</th>
                      <th className="px-4 py-2.5">Member</th>
                      <th className="px-4 py-2.5">Plan</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">18% GST</th>
                      <th className="px-4 py-2.5">Mode</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">No payments recorded yet.</td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.payment_id}>
                          <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">{p.invoice_number}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{p.member_name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{p.plan}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-900">₹{formatInr(p.amount_paid)}</td>
                          <td className="px-4 py-2.5 text-slate-500">₹{p.gst_amount}</td>
                          <td className="px-4 py-2.5 text-slate-600">{p.payment_mode}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                p.status === "Refunded" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-forest-accent"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                void gymApi.getGstInvoice(p.payment_id).then(setActiveInvoice).catch((e) => showToast(e.message, true))
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-[#eef7e6] px-2.5 py-1 text-[11px] font-semibold text-forest-accent"
                            >
                              <FileText className="h-3 w-3" /> GST Invoice
                            </button>
                            {p.status !== "Refunded" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void gymApi
                                    .refundPayment(p.payment_id, "Refunded via Admin Console")
                                    .then(() => {
                                      showToast(`Marked ${p.invoice_number} refunded.`);
                                      return refreshAll();
                                    })
                                    .catch((e) => showToast(e.message, true))
                                }
                                className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-600"
                              >
                                Refund
                              </button>
                            )}
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

        {/* ----------------------------- VIEW 5: PACKAGES ----------------------------- */}
        {activeTab === "Packages" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => {
                const isAnnual = p.plan_name === "Yearly";
                const perDay = Math.round(p.price / Math.max(p.duration_days, 1));
                return (
                  <div
                    key={p.plan_id}
                    className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition ${
                      isAnnual
                        ? "border-forest bg-gradient-to-br from-[#071912] to-[#143a29] text-white"
                        : "border-slate-200/80 bg-white text-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{isAnnual ? "Annual" : p.plan_name}</p>
                        {isAnnual && (
                          <span className="rounded-full bg-lime-neon px-2 py-0.5 text-[10px] font-extrabold text-forest">
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <p className="tabular-nums mt-3 text-3xl font-extrabold">₹{formatInr(p.price)}</p>
                      <p className={`mt-1 text-xs ${isAnnual ? "text-emerald-200/80" : "text-slate-500"}`}>
                        {p.duration_days} days · ~₹{perDay}/day
                      </p>
                      <p className={`mt-2 text-xs font-semibold ${isAnnual ? "text-lime-neon" : "text-forest-accent"}`}>
                        {p.max_freeze_days > 0 ? `${p.max_freeze_days} freeze days included` : "Flexible access"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanModalOpen(true);
                      }}
                      className={`mt-5 text-left text-xs font-bold hover:underline ${
                        isAnnual ? "text-lime-neon" : "text-forest-accent"
                      }`}
                    >
                      Edit plan -&gt;
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-slate-900">Renewal behaviour and access rules</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanModalOpen(true);
                  }}
                  className="rounded-full bg-lime-neon px-4 py-2 text-xs font-extrabold text-forest hover:brightness-95"
                >
                  + Create new package
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-3">
                <p>Auto-renewal · <strong className="text-slate-900">Enabled (GM-03)</strong></p>
                <p>Reminder cadence · <strong className="text-slate-900">Email T-7 / T-3 / T-0 (GM-02)</strong></p>
                <p>Membership freeze · <strong className="text-slate-900">Enabled with Expiry Extension</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 6: FOLLOW-UPS ----------------------------- */}
        {activeTab === "Follow-ups" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Prioritized Email Retention Queue ({dueFollowUps.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    T0/T3/T7 Expiry, Pending Dues, 5-Day Inactivity Drop-Off &amp; Win-Back via Gmail + GM-02.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void gymApi
                        .dispatchFollowUps({ dry_run: true })
                        .then((r) =>
                          showToast(`Dry-run ready: ${String((r as { would_dispatch_count?: number }).would_dispatch_count ?? 0)} email(s) queued.`)
                        )
                        .catch((e) => showToast(e.message, true))
                    }
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dry-Run Preview
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void gymApi
                        .dispatchFollowUps({ dry_run: false })
                        .then((r) => {
                          showToast(`Dispatched ${String((r as { dispatched_count?: number }).dispatched_count ?? 0)} email follow-up(s) via GM-02.`);
                          return refreshAll();
                        })
                        .catch((e) => showToast(e.message, true))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-4 py-2 text-xs font-extrabold text-forest shadow-sm hover:brightness-95"
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Email Reminders (GM-02)
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {dueFollowUps.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 py-8 text-center text-xs text-slate-400">
                    Zero overdue follow-ups right now — seed demo members or all members are already up to date!
                  </p>
                ) : (
                  dueFollowUps.map((f) => (
                    <div
                      key={`${f.member_id}-${f.followup_type}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#f9fbfa] p-4"
                    >
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-lime-neon">
                            {f.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {f.name} ({f.member_id})
                          </span>
                          <span className="text-[11px] font-semibold text-forest-accent">{f.followup_type}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{f.message_text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void gymApi
                            .dispatchFollowUps({ member_ids: [f.member_id], dry_run: false })
                            .then(() => {
                              showToast(`Sent ${f.followup_type} email reminder for ${f.name}.`);
                              return refreshAll();
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-forest-accent hover:bg-emerald-50"
                      >
                        <Mail className="h-3.5 w-3.5" /> Send Email
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {followUpLogs.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h4 className="mb-3 text-sm font-extrabold text-slate-900">Dispatched Follow-Up History ({followUpLogs.length})</h4>
                <div className="max-h-56 space-y-1.5 overflow-auto text-xs">
                  {followUpLogs.slice(0, 15).map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>
                        <strong>{String(l.member_id)}</strong> · {String(l.followup_type)} ({String(l.channel)})
                      </span>
                      <span className="text-slate-500">
                        {String(l.status)} · {String(l.dispatched_at_ist)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------- VIEW 7: REPORTS & ANALYTICS ----------------------------- */}
        {activeTab === "Reports & analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Net Revenue (Ex-GST)</p>
                <p className="tabular-nums mt-1.5 text-2xl font-extrabold text-slate-900">
                  ₹{formatInr(accounts?.net_revenue_ex_gst ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-forest-accent">
                  CGST ₹{accounts?.cgst_collected ?? 0} + SGST ₹{accounts?.sgst_collected ?? 0}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Operating Expenses</p>
                <p className="tabular-nums mt-1.5 text-2xl font-extrabold text-slate-900">
                  ₹{formatInr(accounts?.total_expenses ?? 0)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">₹{formatInr(accounts?.expenses_today ?? 0)} logged today</p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Net Studio Profit</p>
                <p className="tabular-nums mt-1.5 text-2xl font-extrabold text-forest-accent">
                  ₹{formatInr(accounts?.net_profit ?? 0)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{accounts?.profit_margin_pct ?? 0}% operating margin</p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Receivables Aging</p>
                <p className="mt-1.5 text-xs text-slate-700">0–7d: ₹{formatInr(accounts?.receivables_aging?.["0_7_days"] ?? 0)}</p>
                <p className="text-xs text-slate-700">8–30d: ₹{formatInr(accounts?.receivables_aging?.["8_30_days"] ?? 0)}</p>
                <p className="text-xs font-semibold text-red-600">30+d: ₹{formatInr(accounts?.receivables_aging?.["over_30_days"] ?? 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-extrabold text-slate-900">Operating Expenses ({expenses.length})</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void gymApi
                      .recordExpense({ category: expCategory, amount: Number(expAmount), vendor: expVendor, payment_mode: "UPI" })
                      .then(() => {
                        showToast("Recorded studio expense.");
                        setExpVendor("");
                        return refreshAll();
                      })
                      .catch((err) => showToast(err.message, true));
                  }}
                  className="mb-4 flex flex-wrap gap-2"
                >
                  <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs">
                    <option value="Rent">Rent</option>
                    <option value="Trainer Salaries">Trainer Salaries</option>
                    <option value="Electricity & Utilities">Electricity &amp; Utilities</option>
                    <option value="Equipment Maintenance">Equipment Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Software & SaaS">Software &amp; SaaS</option>
                    <option value="Other">Other</option>
                  </select>
                  <input required type="number" min="1" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="w-24 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs" />
                  <input value={expVendor} onChange={(e) => setExpVendor(e.target.value)} placeholder="Vendor" className="flex-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs" />
                  <button type="submit" className="rounded-full bg-lime-neon px-4 py-1.5 text-xs font-bold text-forest">
                    + Add Expense
                  </button>
                </form>

                <div className="max-h-56 space-y-2 overflow-y-auto text-xs">
                  {expenses.length === 0 ? (
                    <p className="py-6 text-center text-slate-400">No expenses logged yet.</p>
                  ) : (
                    expenses.map((ex) => (
                      <div key={ex.expense_id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {ex.category} — ₹{formatInr(ex.amount)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {ex.vendor || "Direct"} · {ex.expense_date}
                          </p>
                        </div>
                        <button type="button" onClick={() => void gymApi.deleteExpense(ex.expense_id).then(refreshAll)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-extrabold text-slate-900">Pending Receivables &amp; Fee Recovery ({receivables.length})</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto text-xs">
                  {receivables.length === 0 ? (
                    <p className="py-8 text-center text-slate-400">All member dues collected!</p>
                  ) : (
                    receivables.map((r) => (
                      <div key={r.member_id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {r.name} · ₹{formatInr(r.amount_due)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {r.days_overdue}d overdue ({r.aging_bucket}) · {r.email || r.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              void gymApi
                                .recordPayment({ member_id: r.member_id, amount_paid: r.amount_due, payment_mode: "UPI", extend_membership: true })
                                .then((res) => {
                                  showToast(`Collected ₹${res.payment.amount_paid} (${res.payment.invoice_number}).`);
                                  return refreshAll();
                                })
                            }
                            className="rounded-full bg-lime-neon px-3 py-1 text-[11px] font-bold text-forest hover:brightness-95"
                          >
                            Collect Fee
                          </button>
                          {r.mailto_reminder_url && (
                            <a
                              href={r.mailto_reminder_url}
                              className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-lime-neon"
                            >
                              <Mail className="h-3 w-3" /> Email
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 8: STAFF & ROLES ----------------------------- */}
        {activeTab === "Staff & roles" && (
          <AutomationControlTab
            workflows={workflows}
            schedules={schedules}
            sheetsStatus={sheetsStatus}
            n8nBaseUrl={copilotStatus?.n8n_base_url}
            onRefresh={refreshAll}
            onToast={showToast}
          />
        )}

        {loading && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white shadow-lg">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-lime-neon" /> Syncing Studio Data...
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <AddMemberModal
        open={addMemberOpen}
        plans={plans}
        onClose={() => setAddMemberOpen(false)}
        onCreated={async (msg) => {
          showToast(msg);
          await refreshAll();
        }}
      />

      <Member360Drawer
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onUpdated={async (msg) => {
          showToast(msg);
          await refreshAll();
        }}
      />

      <PlanModal
        open={planModalOpen}
        editingPlan={editingPlan}
        onClose={() => setPlanModalOpen(false)}
        onSaved={async (msg) => {
          showToast(msg);
          await refreshAll();
        }}
      />

      <GstInvoiceModal invoice={activeInvoice} onClose={() => setActiveInvoice(null)} />
    </div>
  );
}
