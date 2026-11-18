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
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AccountsSummary,
  AttendanceRow,
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

const NAV_ITEMS: NavTab[] = [
  "Dashboard",
  "Members",
  "Attendance",
  "Payments",
  "Packages",
  "Follow-ups",
  "Reports & analytics",
  "Staff & roles",
];

const HEADER_META: Record<NavTab, { crumb: string; title: string; subtitle: string }> = {
  Dashboard: {
    crumb: "OVERVIEW / DASHBOARD",
    title: "Good morning, Priyanshu 👋",
    subtitle: "Here's what's happening at your gym today.",
  },
  Members: {
    crumb: "MEMBERS / DIRECTORY",
    title: "Member management",
    subtitle: "Manage registrations, profiles, memberships and member status.",
  },
  Attendance: {
    crumb: "OPERATIONS / ATTENDANCE",
    title: "Attendance & access",
    subtitle: "Track real-time check-ins, workout streaks and daily gym occupancy.",
  },
  Payments: {
    crumb: "FINANCE / PAYMENTS",
    title: "Payments & GST billing",
    subtitle: "Collect dues, issue 18% GST invoices and process n8n renewals.",
  },
  Packages: {
    crumb: "CONFIGURATION / PACKAGES",
    title: "Membership packages",
    subtitle: "Create plans, configure validity, pricing and renewal rules.",
  },
  "Follow-ups": {
    crumb: "RETENTION / FOLLOW-UPS",
    title: "Automated email follow-ups",
    subtitle: "Dispatch expiry alerts, pending fee reminders and win-back campaigns via GM-02.",
  },
  "Reports & analytics": {
    crumb: "FINANCE / REPORTS",
    title: "CFO accounts, GST & expenses",
    subtitle: "Gross collections, CGST/SGST liabilities, P&L profit and receivables aging.",
  },
  "Staff & roles": {
    crumb: "AUTOMATION / CONTROL PLANE",
    title: "n8n pipelines & Google Sheets",
    subtitle: "Trigger GM-01..GM-05 workflows, schedule cron runs and sync Google Sheets.",
  },
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount || 0));
}

export default function GymFlowAdminPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("Dashboard");
  const [workspaceName, setWorkspaceName] = useState("Downtown Fitness Club");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromptBar, setShowPromptBar] = useState(true);

  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Core data state
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
    }, 5000);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await gymApi.getHealth();
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
      showToast(
        err instanceof Error ? `Backend unreachable (${err.message}). Verify FastAPI server is running.` : "Backend unreachable.",
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

  async function handleSeedDemoMembers() {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const samples = [
      { name: "Aarav Sharma", phone: "9876543210", email: "aarav.sharma@example.com", plan: "Quarterly", fee: 4000, payment_status: "Paid" },
      { name: "Riya Mukherjee", phone: "9831022145", email: "riya.m@example.com", plan: "Yearly", fee: 13500, payment_status: "Paid" },
      { name: "Sayan Das", phone: "9903011882", email: "sayan.das@example.com", plan: "Monthly", fee: 1500, payment_status: "Pending" },
      { name: "Priya Kapoor", phone: "9874055421", email: "priya.kapoor@example.com", plan: "Half-Yearly", fee: 7500, payment_status: "Paid" },
    ];
    for (const s of samples) {
      await gymApi.createMember({ ...s, start_date: today, sync_to_n8n: false });
    }
    showToast("Seeded 4 sample studio members into Google Sheets workbook!");
    await refreshAll();
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
    const base = [
      { month: "May", value: 185000, peak: false },
      { month: "Jun", value: 215000, peak: false },
      { month: "Jul", value: 168000, peak: false },
      { month: "Aug", value: 245000, peak: false },
      { month: "Sep", value: 298000, peak: true },
      { month: "Oct", value: 262000, peak: false },
      {
        month: "Now",
        value: Math.max(accounts?.gross_collections || 0, 240000),
        peak: (accounts?.gross_collections || 0) > 298000,
      },
    ];
    const maxVal = Math.max(...base.map((b) => b.value), 1);
    return base.map((b) => ({ ...b, pct: Math.max(22, Math.round((b.value / maxVal) * 100)) }));
  }, [accounts]);

  return (
    <div className="flex min-h-screen bg-canvas text-slate-900">
      {/* Left Fixed Dark Forest Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between bg-forest px-4 py-5 text-white">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-lime-neon shadow-sm" />
            <div>
              <p className="text-base font-extrabold tracking-wide text-white leading-none">GYMFLOW</p>
              <p className="mt-1 text-[10px] font-semibold tracking-widest text-emerald-200/60">MANAGEMENT</p>
            </div>
          </div>

          {/* Workspace Selector */}
          <div className="mt-6 px-1">
            <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-emerald-200/50">WORKSPACE</p>
            <div className="relative">
              <div className="flex items-center justify-between rounded-xl bg-forest-pill/70 px-3 py-2 text-xs font-medium text-white border border-white/5">
                <span className="flex items-center gap-2 truncate">
                  <span className="h-2 w-2 rounded-full bg-lime-neon" />
                  <select
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Downtown Fitness Club" className="text-slate-900">Downtown Fitness Club</option>
                    <option value="Crush Lifestyle Studio" className="text-slate-900">Crush Lifestyle Studio</option>
                    <option value="Indiranagar Branch" className="text-slate-900">Indiranagar Branch</option>
                  </select>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-emerald-200/70 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Overview Nav */}
          <div className="mt-6">
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-emerald-200/50">OVERVIEW</p>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveTab(item)}
                    className={`flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-[13px] transition ${
                      isActive
                        ? "bg-forest-pill font-semibold text-white"
                        : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isActive ? "bg-lime-neon" : "border border-emerald-200/40"
                      }`}
                    />
                    <span className="truncate">{item}</span>
                    {item === "Follow-ups" && (dueFollowUps.length > 0) && (
                      <span className="ml-auto rounded-full bg-lime-neon px-1.5 py-0.5 text-[10px] font-bold text-forest">
                        {dueFollowUps.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Super Admin Block */}
        <div className="border-t border-white/10 pt-4 px-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wide text-white">PRIYANSHU ROUTH</p>
              <p className="text-[11px] text-emerald-200/60">Super admin</p>
            </div>
            <span
              title={apiOnline ? "FastAPI Backend Connected" : "Backend Offline"}
              className={`h-2.5 w-2.5 rounded-full ${apiOnline ? "bg-lime-neon" : "bg-red-400"}`}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden px-6 py-6 lg:px-8">
        {/* Toast Banner */}
        {toast && (
          <div
            className={`mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 text-xs font-medium shadow-sm ${
              toast.isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-[#eef7e6] text-forest"
            }`}
          >
            <span className="flex items-center gap-2">
              {toast.isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-forest-accent" />}
              {toast.text}
            </span>
            <button type="button" onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-800">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">{header.crumb}</p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">{header.title}</h1>
            <p className="mt-0.5 text-xs text-slate-500">{header.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-56 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-forest-accent focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPromptBar((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                showPromptBar
                  ? "border-forest bg-forest text-lime-neon"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Prompt
            </button>

            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-4 py-2 text-xs font-bold text-forest shadow-sm transition hover:brightness-95"
            >
              <Plus className="h-3.5 w-3.5" /> Add member
            </button>
          </div>
        </header>

        {/* Prompt-First Command Bar */}
        {showPromptBar && <PromptCommandBar onActionCompleted={refreshAll} />}

        {/* Top 4 KPI Stat Cards (Consistent across Screenshots 1-4) */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Active members</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatInr(analytics?.active_members ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              {analytics?.total_members ?? 0} total · {analytics?.frozen_members ?? 0} frozen
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Revenue this month</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{formatInr(accounts?.gross_collections ?? analytics?.total_revenue_collected ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              ₹{formatInr(accounts?.collections_today ?? analytics?.collections_today ?? 0)} collected today
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Pending payments</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{formatInr(accounts?.pending_receivables_amount ?? analytics?.pending_dues_amount ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              {accounts?.pending_receivables_count ?? analytics?.pending_dues_count ?? 0} dues to follow up
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-medium text-slate-500">Today&apos;s attendance</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatInr(analytics?.checkins_today ?? 0)}
            </p>
            <p className="mt-2 text-xs font-semibold text-forest-accent">
              {analytics?.due_followups_count ?? 0} retention follow-ups due
            </p>
          </div>
        </section>

        {/* ----------------------------- VIEW 1: DASHBOARD ----------------------------- */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
              {/* Monthly Collection Bar Chart */}
              <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Monthly collection performance</p>
                  {members.length === 0 && !loading && (
                    <button
                      type="button"
                      onClick={() => void handleSeedDemoMembers()}
                      className="rounded-full bg-[#eef7e6] px-3 py-1 text-xs font-semibold text-forest-accent hover:brightness-95"
                    >
                      + Seed 4 Sample Members
                    </button>
                  )}
                </div>
                <div className="mt-6 flex h-44 items-end justify-around gap-3 px-2">
                  {monthlyCollectionData.map((bar) => (
                    <div key={bar.month} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-36 w-full items-end justify-center">
                        <div
                          title={`₹${formatInr(bar.value)}`}
                          style={{ height: `${bar.pct}%` }}
                          className={`w-6 sm:w-8 rounded-lg transition-all ${
                            bar.peak ? "bg-lime-neon" : "bg-forest-accent"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members by active package */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Members by active package</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {analytics?.total_members ?? 0} total members
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  {["Monthly", "Quarterly", "Half-Yearly", "Yearly"].map((pkg) => {
                    const count = analytics?.plan_breakdown?.[pkg] ?? 0;
                    const total = Math.max(analytics?.total_members || 1, 1);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <li key={pkg} className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-forest-accent" />
                          {pkg === "Yearly" ? "Annual" : pkg}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {count} ({pct}%)
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Bottom 2 Cards: Pipeline Quick Triggers & Recent Logs */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-900">n8n Automation Pipelines</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Staff & roles")}
                    className="text-xs font-semibold text-forest-accent hover:underline"
                  >
                    Open Control Plane →
                  </button>
                </div>
                <div className="space-y-2">
                  {workflows.map((wf) => (
                    <div key={wf.workflow_code} className="flex items-center justify-between rounded-xl bg-[#f8faf9] px-3.5 py-2.5">
                      <div>
                        <span className="rounded bg-forest px-1.5 py-0.5 text-[10px] font-bold text-lime-neon mr-2">
                          {wf.workflow_code}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{wf.name.replace(`${wf.workflow_code} - `, "")}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void gymApi
                            .triggerWorkflow(wf.workflow_code, wf.workflow_code === "GM-05" ? { message: "Run full gym autopilot" } : {})
                            .then(() => {
                              showToast(`Executed ${wf.workflow_code} via API.`);
                              return refreshAll();
                            })
                            .catch((e) => showToast(e.message, true))
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-lime-neon px-3 py-1 text-[11px] font-bold text-forest hover:brightness-95"
                      >
                        <Zap className="h-3 w-3" /> Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <p className="mb-3 text-sm font-bold text-slate-900">Recent AI & Automation Audit Logs</p>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {(analytics?.recent_automation_logs || []).length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">No automation runs yet.</p>
                  ) : (
                    analytics?.recent_automation_logs.map((log) => (
                      <div key={log.log_id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-forest-accent">
                            {log.workflow} · {log.event_type}
                          </span>
                          <span className="text-[11px] text-slate-400">{log.created_at_ist}</span>
                        </div>
                        <p className="mt-0.5 truncate text-slate-600">{log.details || log.status}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 2: MEMBERS (Screenshot 3) ----------------------------- */}
        {activeTab === "Members" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Member directory</h3>
                <p className="text-xs text-slate-500">Click any member to inspect their 360° profile, freeze/unfreeze or 18-col Google Sheet row.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "Active", "Frozen", "Pending", "Expired"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setMemberStatusFilter(status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
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
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Package</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold">Next Billing</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        No matching members found. Click <strong>+ Add member</strong> or use the AI Prompt Bar above!
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
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{m.member_id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">+{m.phone}</td>
                        <td className="px-4 py-3 text-slate-700">{m.plan === "Yearly" ? "Annual" : m.plan}</td>
                        <td className="px-4 py-3 text-slate-600">{m.start_date}</td>
                        <td className="px-4 py-3 text-slate-600">{m.expiry_date}</td>
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
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMemberId(m.member_id);
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-forest-accent hover:bg-emerald-50"
                          >
                            Manage →
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

        {/* ----------------------------- VIEW 3: ATTENDANCE (Screenshot 4) ----------------------------- */}
        {activeTab === "Attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Scan member QR code card */}
              <form onSubmit={(e) => void handleQuickCheckIn(e)} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h3 className="mb-3 text-base font-bold text-slate-900">Scan member QR code</h3>
                <div className="rounded-2xl bg-[#f0f7f3] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-forest-accent/30 bg-white text-forest-accent">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Scan QR code</p>
                  <p className="mb-3 text-xs text-slate-500">Or enter Member ID (MEM-XXXXXXXX) or phone number</p>
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
                      <option value="Strength & Conditioning">Strength & Conditioning</option>
                      <option value="HIIT / Burn">HIIT / Burn</option>
                      <option value="Yoga / Mobility">Yoga / Mobility</option>
                      <option value="Personal Training">Personal Training</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-lime-neon py-2.5 text-xs font-bold text-forest hover:brightness-95"
                >
                  <Check className="h-4 w-4" /> Check in
                </button>
              </form>

              {/* Members currently inside & Streaks */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h3 className="mb-3 text-base font-bold text-slate-900">Members checked in today ({todayCheckins.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Member</th>
                        <th className="px-3 py-2">Check-in IST</th>
                        <th className="px-3 py-2">Workout</th>
                        <th className="px-3 py-2 text-right">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayCheckins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                            No check-ins yet today. Scan a member ID on the left!
                          </td>
                        </tr>
                      ) : (
                        todayCheckins.map((row) => (
                          <tr key={row.attendance_id}>
                            <td className="px-3 py-2.5 font-semibold text-slate-900">{row.name || row.member_id}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.checkin_time_ist}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.workout_type}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-forest-accent">
                              {row.streak_after_checkin}d
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {leaderboard.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Top Consistency Streaks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {leaderboard.slice(0, 5).map((item) => (
                        <span key={String(item.member_id)} className="rounded-full bg-[#eef7e6] px-2.5 py-1 text-[11px] font-semibold text-forest">
                          #{String(item.rank)} {String(item.name)} ({String(item.current_streak)}d)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance log */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <h3 className="mb-3 text-base font-bold text-slate-900">Attendance log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-y border-slate-100 bg-[#f8faf9] text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Member</th>
                      <th className="px-4 py-2.5">Member ID</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Check-in Time</th>
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
                          <td className="px-4 py-2.5 font-semibold text-forest-accent">{row.streak_after_checkin}d</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 4: PAYMENTS & GST INVOICES ----------------------------- */}
        {activeTab === "Payments" && (
          <div className="space-y-6">
            {/* Quick Payment Form */}
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
              className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Member ID</label>
                <input required value={payMemberId} onChange={(e) => setPayMemberId(e.target.value)} placeholder="MEM-XXXXXXXX" className="rounded-xl border border-slate-200 px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Amount (₹)</label>
                <input required type="number" min="1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Payment Mode</label>
                <select value={payMode} onChange={(e) => setPayMode(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <button type="submit" className="rounded-full bg-lime-neon px-5 py-2 text-xs font-bold text-forest">
                + Record Payment & Extend
              </button>
            </form>

            {/* Payments Ledger */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <h3 className="mb-3 text-base font-bold text-slate-900">GST Payment Ledger ({payments.length})</h3>
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

        {/* ----------------------------- VIEW 5: PACKAGES (Screenshot 1) ----------------------------- */}
        {activeTab === "Packages" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => (
                <div key={p.plan_id} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.plan_name === "Yearly" ? "Annual" : p.plan_name}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">₹{formatInr(p.price)}</p>
                    <p className="mt-2 text-xs text-slate-500">{p.duration_days} days</p>
                    <p className="mt-1 text-xs font-medium text-forest-accent">
                      {p.max_freeze_days > 0 ? `${p.max_freeze_days} freeze days included` : "Flexible access"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan(p);
                      setPlanModalOpen(true);
                    }}
                    className="mt-4 text-left text-xs font-bold text-forest-accent hover:underline"
                  >
                    Edit plan →
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">Renewal behaviour and access</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanModalOpen(true);
                  }}
                  className="rounded-full bg-lime-neon px-4 py-2 text-xs font-bold text-forest hover:brightness-95"
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Prioritized Email Retention Queue ({dueFollowUps.length})</h3>
                  <p className="text-xs text-slate-500">
                    Cult.fit-style stages: T0/T3/T7 Expiry, Pending Dues, 5-Day Inactivity Drop-Off & Win-Back.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void gymApi
                        .dispatchFollowUps({ dry_run: true })
                        .then((r) => showToast(`Dry-run ready: ${String((r as { would_dispatch_count?: number }).would_dispatch_count ?? 0)} email(s) queued.`))
                        .catch((e) => showToast(e.message, true))
                    }
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Dry-Run Preview
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void gymApi
                        .dispatchFollowUps({ dry_run: false })
                        .then((r) => {
                          showToast(`Dispatched ${String((r as { dispatched_count?: number }).dispatched_count ?? 0)} follow-up(s) via GM-02.`);
                          return refreshAll();
                        })
                        .catch((e) => showToast(e.message, true))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-4 py-2 text-xs font-bold text-forest hover:brightness-95"
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Email Reminders (GM-02)
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {dueFollowUps.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 py-8 text-center text-xs text-slate-400">
                    Zero overdue follow-ups right now — all members are up to date!
                  </p>
                ) : (
                  dueFollowUps.map((f) => (
                    <div key={`${f.member_id}-${f.followup_type}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#f9fbfa] p-3.5">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-lime-neon">
                            {f.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{f.name} ({f.member_id})</span>
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
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-forest-accent hover:bg-emerald-50"
                      >
                        <Mail className="h-3.5 w-3.5" /> Send Email
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {followUpLogs.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-900">Dispatched Follow-Up History ({followUpLogs.length})</h4>
                <div className="max-h-56 overflow-auto space-y-1.5 text-xs">
                  {followUpLogs.slice(0, 15).map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>
                        <strong>{String(l.member_id)}</strong> · {String(l.followup_type)} ({String(l.channel)})
                      </span>
                      <span className="text-slate-500">{String(l.status)} · {String(l.dispatched_at_ist)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------- VIEW 7: REPORTS & ANALYTICS (CFO ACCOUNTS) ----------------------------- */}
        {activeTab === "Reports & analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Net Revenue (Ex-GST)</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">₹{formatInr(accounts?.net_revenue_ex_gst ?? 0)}</p>
                <p className="mt-1 text-[11px] text-forest-accent">
                  CGST ₹{accounts?.cgst_collected ?? 0} + SGST ₹{accounts?.sgst_collected ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Operating Expenses</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">₹{formatInr(accounts?.total_expenses ?? 0)}</p>
                <p className="mt-1 text-[11px] text-slate-500">₹{formatInr(accounts?.expenses_today ?? 0)} spent today</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Net Studio Profit</p>
                <p className="mt-1 text-2xl font-extrabold text-forest-accent">₹{formatInr(accounts?.net_profit ?? 0)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{accounts?.profit_margin_pct ?? 0}% operating margin</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Receivables Aging</p>
                <p className="mt-1 text-xs text-slate-700">0–7d: ₹{formatInr(accounts?.receivables_aging?.["0_7_days"] ?? 0)}</p>
                <p className="text-xs text-slate-700">8–30d: ₹{formatInr(accounts?.receivables_aging?.["8_30_days"] ?? 0)}</p>
                <p className="text-xs text-red-600 font-semibold">30+d: ₹{formatInr(accounts?.receivables_aging?.["over_30_days"] ?? 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Record Expense */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Operating Expenses ({expenses.length})</h3>
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
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                    <option value="Equipment Maintenance">Equipment Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Software & SaaS">Software & SaaS</option>
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
                      <div key={ex.expense_id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <div>
                          <p className="font-semibold text-slate-900">{ex.category} — ₹{formatInr(ex.amount)}</p>
                          <p className="text-[11px] text-slate-500">{ex.vendor || "Direct"} · {ex.expense_date}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void gymApi.deleteExpense(ex.expense_id).then(refreshAll)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Receivables */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Pending Receivables & Fee Recovery ({receivables.length})</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto text-xs">
                  {receivables.length === 0 ? (
                    <p className="py-8 text-center text-slate-400">All member dues collected!</p>
                  ) : (
                    receivables.map((r) => (
                      <div key={r.member_id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5">
                        <div>
                          <p className="font-semibold text-slate-900">{r.name} · ₹{formatInr(r.amount_due)}</p>
                          <p className="text-[11px] text-slate-500">
                            {r.days_overdue}d overdue ({r.aging_bucket}) · {r.email || r.phone}
                          </p>
                        </div>
                        {r.mailto_reminder_url && (
                          <a
                            href={r.mailto_reminder_url}
                            className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-lime-neon"
                          >
                            <Mail className="h-3 w-3" /> Email Reminder
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- VIEW 8: STAFF & ROLES (AUTOMATIONS + GOOGLE SHEETS) ----------------------------- */}
        {activeTab === "Staff & roles" && (
          <AutomationControlTab
            workflows={workflows}
            schedules={schedules}
            sheetsStatus={sheetsStatus}
            onRefresh={refreshAll}
            onToast={showToast}
          />
        )}

        {loading && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-medium text-white shadow-lg">
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
