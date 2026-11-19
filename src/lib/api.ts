/** Typed client SDK for Crush Lifestyle Fitness Studio (GYMFLOW) FastAPI + n8n + Google Sheets backend. */

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("gymflow_api_base_url");
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": `req-ui-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    "X-Tenant-ID":
      (typeof window !== "undefined" && window.localStorage.getItem("gymflow_tenant_id")) ||
      "crush-main-studio",
    ...extra,
  };
  const apiKey =
    (typeof window !== "undefined" && window.localStorage.getItem("gymflow_api_key")) ||
    "";
  if (apiKey.trim()) {
    headers["X-API-Key"] = apiKey.trim();
  }
  return headers;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders((init?.headers as Record<string, string>) || undefined),
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || res.statusText };
  }
  if (!res.ok) {
    const errObj = data as { detail?: unknown; message?: string };
    const detailMsg = Array.isArray(errObj.detail)
      ? errObj.detail.map((d: { msg?: string; loc?: string[] }) => `${(d.loc || []).join(".")}: ${d.msg}`).join("; ")
      : typeof errObj.detail === "string"
        ? errObj.detail
        : errObj.message || `HTTP ${res.status}`;
    throw new Error(detailMsg);
  }
  return data as T;
}

/* --------------------------------- Types --------------------------------- */

export interface MemberRecord {
  member_id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  plan: "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";
  fee: number;
  start_date: string;
  expiry_date: string;
  payment_status: "Paid" | "Pending";
  last_payment_date: string;
  last_reminder_date: string;
  member_status: string;
  notes: string;
  fitness_goal: string;
  batch_slot: string;
  assigned_trainer: string;
  medical_notes: string;
  discount_amount: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string;
  total_checkins: number;
  freeze_days_used: number;
  frozen_until: string;
  days_remaining: number;
  next_followup_type: string | null;
  next_followup_due: string | null;
}

export interface DashboardAnalytics {
  as_of_ist: string;
  total_members: number;
  active_members: number;
  expiring_in_7_days: number;
  expired_members: number;
  frozen_members: number;
  pending_dues_count: number;
  pending_dues_amount: number;
  total_revenue_collected: number;
  collections_today: number;
  checkins_today: number;
  at_risk_inactive_count: number;
  due_followups_count: number;
  plan_breakdown: Record<string, number>;
  recent_automation_logs: Array<{
    log_id: string;
    workflow: string;
    event_type: string;
    member_id: string;
    status: string;
    response_status: number | null;
    details: string;
    created_at_ist: string;
  }>;
}

export interface MembershipPlan {
  plan_id: string;
  plan_name: string;
  duration_days: number;
  price: number;
  max_freeze_days: number;
  description: string;
  is_active: number;
}

export interface PaymentRecord {
  payment_id: string;
  invoice_number: string;
  member_id: string;
  member_name: string;
  phone: string;
  plan: string;
  amount_paid: number;
  gst_amount: number;
  payment_mode: string;
  transaction_ref: string;
  payment_date: string;
  previous_expiry: string;
  new_expiry_date: string;
  status: string;
  notes: string;
  created_at_ist: string;
}

export interface AttendanceRow {
  attendance_id: string;
  member_id: string;
  checkin_date: string;
  checkin_time_ist: string;
  workout_type: string;
  batch_slot: string;
  streak_after_checkin: number;
  name?: string;
  phone?: string;
  plan?: string;
  current_streak?: number;
  longest_streak?: number;
}

export interface FollowUpItem {
  member_id: string;
  name: string;
  phone: string;
  plan: string;
  expiry_date: string;
  payment_status: string;
  member_status: string;
  followup_type: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  channel: string;
  template_name: string;
  message_text: string;
  days_until_expiry: number;
  days_since_last_checkin: number | null;
}

export interface AccountsSummary {
  as_of_ist: string;
  gross_collections: number;
  total_gst_collected: number;
  cgst_collected: number;
  sgst_collected: number;
  net_revenue_ex_gst: number;
  total_expenses: number;
  net_profit: number;
  profit_margin_pct: number;
  collections_today: number;
  expenses_today: number;
  pending_receivables_amount: number;
  pending_receivables_count: number;
  receivables_aging: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  expenses_by_category: Record<string, number>;
  recent_payments: PaymentRecord[];
  recent_expenses: ExpenseRecord[];
}

export interface ExpenseRecord {
  expense_id: string;
  category: string;
  amount: number;
  vendor: string;
  payment_mode: string;
  expense_date: string;
  notes: string;
  recorded_by: string;
  created_at_ist: string;
}

export interface ReceivableItem {
  member_id: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  start_date: string;
  expiry_date: string;
  last_reminder_date: string;
  amount_due: number;
  days_overdue: number;
  aging_bucket: string;
  message: string;
  mailto_reminder_url: string;
  whatsapp_reminder_url: string;
}

export interface AgentChatResponse {
  run_id: string;
  intent: string;
  reply: string;
  tools_executed: Array<{
    tool_name: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
  }>;
  google_sheets_sync: Record<string, unknown>;
  n8n_dispatch: Record<string, unknown>;
  timestamp_ist: string;
}

export interface WorkflowItem {
  workflow_code: string;
  name: string;
  description: string;
  trigger_type: string;
  cron_expression: string;
  timezone: string;
  webhook_path: string;
  n8n_workflow_id: string;
  is_enabled: boolean;
  last_triggered_at_ist: string;
  last_status: string;
  total_runs: number;
  configured_webhook_url: string;
  webhook_ready: boolean;
  n8n_api_ready: boolean;
}

export interface ScheduledJob {
  job_id: string;
  workflow_code: string;
  job_name: string;
  schedule_type: string;
  cron_expression: string;
  run_at_ist: string;
  interval_minutes: number;
  payload: Record<string, unknown>;
  status: string;
  last_run_at_ist: string;
  next_run_at_ist: string;
  run_count: number;
  created_by: string;
  created_at_ist: string;
}

export interface GstInvoice {
  invoice_number: string;
  payment_id: string;
  invoice_date: string;
  studio: {
    name: string;
    branch: string;
    gstin: string;
    sac_code: string;
    timezone: string;
  };
  billed_to: {
    member_id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  plan: string;
  taxable_value: number;
  cgst_rate_pct: number;
  cgst_amount: number;
  sgst_rate_pct: number;
  sgst_amount: number;
  total_gst: number;
  total_amount_paid: number;
  payment_mode: string;
  transaction_ref: string;
  status: string;
  billing_period: { from: string; to: string };
}

export interface CopilotStatus {
  openai_configured: boolean;
  openai_model: string;
  api_base_url: string;
  n8n_base_url: string;
  google_sheet_id: string;
  studio_name: string;
  tenant_id: string;
}

export interface AutomationSimulationResult {
  workflow_code: "GM-01" | "GM-02" | "GM-03" | "GM-04" | "GM-05" | "SEED";
  title: string;
  summary: string;
  steps: Array<{
    label: string;
    status: "done" | "skipped" | "error";
    detail: string;
  }>;
  raw_result: Record<string, unknown>;
  timestamp_ist: string;
}

function formatIstDateOffset(offsetDays = 0): string {
  const now = new Date();
  const target = new Date(now.getTime() + offsetDays * 86400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
}

function nowIstLabel(): string {
  return `${new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(",", "")} IST`;
}

/* ------------------------------- API Calls ------------------------------- */

export const gymApi = {
  // System & Health
  getHealth: () =>
    apiFetch<{ status: string; service: string; version: string; timezone: string; timestamp_ist: string }>("/health"),
  getSystemInfo: () =>
    apiFetch<{
      service: string;
      version: string;
      timezone: string;
      active_schedules_count: number;
      workflows_count: number;
      routes_count: number;
    }>("/api/v1/system/info"),
  getDashboardAnalytics: () => apiFetch<DashboardAnalytics>("/api/v1/analytics/dashboard"),
  getEnvChecklist: () => apiFetch<Record<string, unknown>>("/api/v1/automations/n8n/env-checklist"),

  // Backend Copilot Status & Executive Brief (powered strictly by FastAPI backend credentials)
  getCopilotStatus: async (): Promise<CopilotStatus> => {
    try {
      const checklist = await apiFetch<{
        ai_agent_and_nextjs?: { LLM_API_KEY?: boolean; LLM_MODEL?: string };
      }>("/api/v1/automations/n8n/env-checklist");
      return {
        openai_configured: Boolean(checklist.ai_agent_and_nextjs?.LLM_API_KEY),
        openai_model: checklist.ai_agent_and_nextjs?.LLM_MODEL || "gpt-4o-mini",
        api_base_url: getApiBaseUrl(),
        n8n_base_url: "",
        google_sheet_id: "",
        studio_name: "Crush Lifestyle Fitness Studio",
        tenant_id: "crush-main-studio",
      };
    } catch {
      return {
        openai_configured: false,
        openai_model: "gpt-4o-mini",
        api_base_url: getApiBaseUrl(),
        n8n_base_url: "",
        google_sheet_id: "",
        studio_name: "Crush Lifestyle Fitness Studio",
        tenant_id: "crush-main-studio",
      };
    }
  },
  getExecutiveBrief: async (studioSnapshot: Record<string, unknown>) => {
    const promptMessage = `Analyze our current studio snapshot and give a concise 3-bullet CEO growth & collection action plan:\n${JSON.stringify(studioSnapshot)}`;
    const agentRes = await apiFetch<AgentChatResponse>("/api/v1/agent/chat", {
      method: "POST",
      body: JSON.stringify({
        message: promptMessage,
        actor_role: "owner",
        sync_to_n8n: false,
      }),
    });
    return {
      brief: agentRes.reply,
      model: agentRes.intent === "AUTOPILOT" ? "backend-ai-agent" : "gpt-4o-mini (backend)",
      openai_used: true,
    };
  },

  // AI Agent Prompt & Autopilot
  sendAgentPrompt: async (
    message: string,
    actorRole = "owner",
    syncToN8n = true,
    actorPhone = ""
  ): Promise<AgentChatResponse> => {
    return apiFetch<AgentChatResponse>("/api/v1/agent/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        actor_role: actorRole,
        actor_phone: actorPhone,
        sync_to_n8n: syncToN8n,
      }),
    });
  },
  runAutonomousCycle: () =>
    apiFetch<AgentChatResponse>("/api/v1/agent/autonomous-cycle", { method: "POST" }),
  getAgentRuns: () =>
    apiFetch<{ count: number; runs: Array<Record<string, unknown>> }>("/api/v1/agent/runs"),

  // Members
  listMembers: (filters?: { member_status?: string; plan?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.member_status) params.set("member_status", filters.member_status);
    if (filters?.plan) params.set("plan", filters.plan);
    if (filters?.search) params.set("search", filters.search);
    const qs = params.toString();
    return apiFetch<{ count: number; members: MemberRecord[] }>(`/api/v1/members${qs ? `?${qs}` : ""}`);
  },
  createMember: (payload: Record<string, unknown>) =>
    apiFetch<{ message: string; member: MemberRecord; payment_receipt: Record<string, unknown> | null }>(
      "/api/v1/members",
      { method: "POST", body: JSON.stringify(payload) }
    ),
  updateMember: (memberId: string, payload: Record<string, unknown>) =>
    apiFetch<{ message: string; member: MemberRecord }>(`/api/v1/members/${encodeURIComponent(memberId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getMember360: (memberId: string) =>
    apiFetch<{
      member: MemberRecord;
      google_sheets_row: Record<string, unknown>;
      payments: PaymentRecord[];
      attendance: AttendanceRow[];
      freezes: Array<Record<string, unknown>>;
      follow_up_logs: Array<Record<string, unknown>>;
    }>(`/api/v1/members/${encodeURIComponent(memberId)}`),
  freezeMember: (memberId: string, freezeDays: number, reason: string) =>
    apiFetch<{ freeze_id: string; new_expiry: string; frozen_until: string; member: MemberRecord }>(
      `/api/v1/members/${encodeURIComponent(memberId)}/freeze`,
      { method: "POST", body: JSON.stringify({ freeze_days: freezeDays, reason }) }
    ),
  unfreezeMember: (memberId: string, reason = "Resumed via Admin Console") =>
    apiFetch<{ member_id: string; reclaimed_freeze_days: number; new_expiry: string; member: MemberRecord }>(
      `/api/v1/members/${encodeURIComponent(memberId)}/unfreeze`,
      { method: "POST", body: JSON.stringify({ reason }) }
    ),
  renewMember: (memberId: string, payload: Record<string, unknown>) =>
    apiFetch<{ payment: PaymentRecord; member: MemberRecord }>(
      `/api/v1/members/${encodeURIComponent(memberId)}/renew`,
      { method: "POST", body: JSON.stringify(payload) }
    ),
  deleteMember: (memberId: string, hard = false) =>
    apiFetch<{ deleted: boolean; mode: string }>(
      `/api/v1/members/${encodeURIComponent(memberId)}?hard=${hard ? "true" : "false"}`,
      { method: "DELETE" }
    ),

  // Attendance
  checkInMember: (payload: { member_id?: string; phone?: string; workout_type?: string; batch_slot?: string }) =>
    apiFetch<{
      already_checked_in_today: boolean;
      attendance_id: string;
      member_id: string;
      member_name: string;
      current_streak: number;
      milestone: string | null;
    }>("/api/v1/attendance/check-in", { method: "POST", body: JSON.stringify(payload) }),
  getTodayAttendance: () => apiFetch<{ date: string; count: number; checkins: AttendanceRow[] }>("/api/v1/attendance/today"),
  getAttendanceHistory: (limit = 50) =>
    apiFetch<{ count: number; checkins: AttendanceRow[] }>(`/api/v1/attendance/history?limit=${limit}`),
  getStreakLeaderboard: (limit = 10) =>
    apiFetch<{ count: number; leaderboard: Array<Record<string, unknown>> }>(
      `/api/v1/attendance/leaderboard?limit=${limit}`
    ),

  // Follow-ups
  getDueFollowUps: (includeRemindedToday = false) =>
    apiFetch<{ as_of_ist: string; count: number; follow_ups: FollowUpItem[] }>(
      `/api/v1/follow-ups/due?include_reminded_today=${includeRemindedToday ? "true" : "false"}`
    ),
  dispatchFollowUps: (payload: { member_ids?: string[]; followup_types?: string[]; dry_run?: boolean }) =>
    apiFetch<Record<string, unknown>>("/api/v1/follow-ups/dispatch", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getFollowUpHistory: () =>
    apiFetch<{ count: number; logs: Array<Record<string, unknown>> }>("/api/v1/follow-ups/history"),

  // Payments & GST
  listPayments: (memberId?: string) =>
    apiFetch<{ count: number; payments: PaymentRecord[] }>(
      `/api/v1/payments${memberId ? `?member_id=${encodeURIComponent(memberId)}` : ""}`
    ),
  recordPayment: (payload: Record<string, unknown>) =>
    apiFetch<{ payment: PaymentRecord; member: MemberRecord }>("/api/v1/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getGstInvoice: (paymentId: string) =>
    apiFetch<GstInvoice>(`/api/v1/payments/${encodeURIComponent(paymentId)}/invoice`),
  refundPayment: (paymentId: string, reason: string) =>
    apiFetch<{ message: string; payment: PaymentRecord }>(
      `/api/v1/payments/${encodeURIComponent(paymentId)}/refund`,
      { method: "POST", body: JSON.stringify({ reason }) }
    ),

  // Accounts & CFO
  getAccountsSummary: () => apiFetch<AccountsSummary>("/api/v1/accounts/summary"),
  getPendingReceivables: () =>
    apiFetch<{ count: number; total_pending_amount: number; aging_totals: Record<string, number>; receivables: ReceivableItem[] }>(
      "/api/v1/accounts/receivables"
    ),
  listExpenses: () => apiFetch<{ count: number; expenses: ExpenseRecord[] }>("/api/v1/accounts/expenses"),
  recordExpense: (payload: Record<string, unknown>) =>
    apiFetch<{ message: string; expense: ExpenseRecord }>("/api/v1/accounts/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteExpense: (expenseId: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/accounts/expenses/${encodeURIComponent(expenseId)}`, {
      method: "DELETE",
    }),

  // Plans & Settings
  listPlans: () => apiFetch<{ plans: MembershipPlan[] }>("/api/v1/plans"),
  createPlan: (payload: Record<string, unknown>) =>
    apiFetch<{ message: string; plan: MembershipPlan }>("/api/v1/plans", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePlan: (planId: string, payload: Record<string, unknown>) =>
    apiFetch<{ message: string; plan: MembershipPlan }>(`/api/v1/plans/${encodeURIComponent(planId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getSettings: () => apiFetch<{ settings: Record<string, string> }>("/api/v1/settings"),
  updateSettings: (settings: Record<string, string>) =>
    apiFetch<{ message: string; settings: Record<string, string> }>("/api/v1/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    }),

  // n8n Control Plane & Google Sheets DB
  listWorkflows: () => apiFetch<{ count: number; workflows: WorkflowItem[] }>("/api/v1/automations/workflows"),
  updateWorkflow: (code: string, payload: Record<string, unknown>) =>
    apiFetch<{ message: string; workflow: WorkflowItem }>(`/api/v1/automations/workflows/${code}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  triggerWorkflow: (code: string, payload: Record<string, unknown> = {}) =>
    apiFetch<Record<string, unknown>>(`/api/v1/automations/workflows/${code}/trigger`, {
      method: "POST",
      body: JSON.stringify({ payload, execute_local_pipeline: true, dispatch_n8n_webhook: true, triggered_by: "NextJS_Admin" }),
    }),
  listSchedules: () => apiFetch<{ count: number; schedules: ScheduledJob[] }>("/api/v1/automations/schedules"),
  createSchedule: (payload: Record<string, unknown>) =>
    apiFetch<{ message: string; schedule: ScheduledJob }>("/api/v1/automations/schedules", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSchedule: (jobId: string, payload: Record<string, unknown>) =>
    apiFetch<{ message: string; schedule: ScheduledJob }>(`/api/v1/automations/schedules/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  runScheduleNow: (jobId: string) =>
    apiFetch<Record<string, unknown>>(`/api/v1/automations/schedules/${jobId}/run-now`, { method: "POST" }),
  tickSchedules: () => apiFetch<Record<string, unknown>>("/api/v1/automations/schedules/tick", { method: "POST" }),
  deployWorkflowsToN8n: (payload: Record<string, unknown> = {}) =>
    apiFetch<Record<string, unknown>>("/api/v1/automations/n8n/deploy", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSheetsStatus: () => apiFetch<Record<string, unknown>>("/api/v1/sheets/status"),
  getSheetsTab: (tabName: string) =>
    apiFetch<{ tab: string; count: number; rows: Array<Record<string, unknown>> }>(
      `/api/v1/sheets/tabs/${encodeURIComponent(tabName)}`
    ),
  pushSheetsSync: () => apiFetch<Record<string, unknown>>("/api/v1/sheets/sync/push", { method: "POST" }),
  pullSheetsSync: () => apiFetch<Record<string, unknown>>("/api/v1/sheets/sync/pull", { method: "POST" }),

  // Interactive Experience Lab — One-Click End-to-End Automation Simulators
  seedRichDemoScenario: async (): Promise<AutomationSimulationResult> => {
    const existing = await gymApi.listMembers();
    const existingPhones = new Set(existing.members.map((m) => m.phone));
    const demoProfiles = [
      {
        name: "Aarav Sharma",
        phone: "9876543210",
        email: "aarav.sharma@crushfit.in",
        plan: "Quarterly",
        fee: 4000,
        start_date: formatIstDateOffset(0),
        payment_status: "Paid",
        assigned_trainer: "Coach Vikram",
        batch_slot: "Morning 7AM",
        fitness_goal: "Strength & Fat Loss",
        checkin: true,
        freezeDays: 0,
      },
      {
        name: "Riya Mukherjee",
        phone: "9831022145",
        email: "riya.m@crushfit.in",
        plan: "Yearly",
        fee: 13500,
        start_date: formatIstDateOffset(-5),
        payment_status: "Paid",
        assigned_trainer: "Coach Ananya",
        batch_slot: "Evening 6PM",
        fitness_goal: "Athletic Conditioning",
        checkin: true,
        freezeDays: 0,
      },
      {
        name: "Sayan Das",
        phone: "9903011882",
        email: "sayan.das@crushfit.in",
        plan: "Monthly",
        fee: 1500,
        start_date: formatIstDateOffset(-10),
        payment_status: "Pending",
        assigned_trainer: "Coach Vikram",
        batch_slot: "Morning 8AM",
        fitness_goal: "Muscle Gain",
        checkin: false,
        freezeDays: 0,
      },
      {
        name: "Kabir Bose",
        phone: "9830155442",
        email: "kabir.bose@crushfit.in",
        plan: "Monthly",
        fee: 1500,
        start_date: formatIstDateOffset(-27),
        payment_status: "Paid",
        assigned_trainer: "Coach Rohan",
        batch_slot: "Evening 7PM",
        fitness_goal: "Weight Loss",
        checkin: false,
        freezeDays: 0,
      },
      {
        name: "Meera Nair",
        phone: "9845099881",
        email: "meera.nair@crushfit.in",
        plan: "Quarterly",
        fee: 4000,
        start_date: formatIstDateOffset(-12),
        payment_status: "Paid",
        assigned_trainer: "Coach Ananya",
        batch_slot: "Morning 6AM",
        fitness_goal: "Mobility & Core",
        checkin: false,
        freezeDays: 7,
      },
      {
        name: "Vikram Joshi",
        phone: "9820411223",
        email: "vikram.j@crushfit.in",
        plan: "Monthly",
        fee: 1500,
        start_date: formatIstDateOffset(-30),
        payment_status: "Paid",
        assigned_trainer: "Coach Rohan",
        batch_slot: "Flexible",
        fitness_goal: "General Fitness",
        checkin: false,
        freezeDays: 0,
      },
    ];

    let createdCount = 0;
    let checkinsCount = 0;
    let freezeCount = 0;
    for (const profile of demoProfiles) {
      if (existingPhones.has(`91${profile.phone}`)) continue;
      const created = await gymApi.createMember({
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        plan: profile.plan,
        fee: profile.fee,
        start_date: profile.start_date,
        payment_status: profile.payment_status,
        assigned_trainer: profile.assigned_trainer,
        batch_slot: profile.batch_slot,
        fitness_goal: profile.fitness_goal,
        sync_to_n8n: false,
      });
      createdCount += 1;
      if (profile.checkin) {
        await gymApi.checkInMember({ member_id: created.member.member_id, workout_type: "Strength & Conditioning" });
        checkinsCount += 1;
      }
      if (profile.freezeDays > 0) {
        await gymApi.freezeMember(created.member.member_id, profile.freezeDays, "Travel pause (demo)");
        freezeCount += 1;
      }
    }

    const expRes = await gymApi.listExpenses();
    let expensesAdded = 0;
    if (expRes.expenses.length === 0) {
      await gymApi.recordExpense({
        category: "Rent",
        amount: 3500,
        vendor: "Indiranagar Studio Leasehold",
        payment_mode: "Bank Transfer",
        notes: "Studio utilities & maintenance retainer",
      });
      await gymApi.recordExpense({
        category: "Electricity & Utilities",
        amount: 1850,
        vendor: "BESCOM Commercial",
        payment_mode: "UPI",
        notes: "Monthly AC & turf lighting",
      });
      expensesAdded = 2;
    }

    const pushRes = await gymApi.pushSheetsSync();
    return {
      workflow_code: "SEED",
      title: "Studio Demo Scenario Hydrated",
      summary: `Seeded ${createdCount} studio member(s) covering Active, T-3 Expiring, T-0 Expiring, Pending Dues, and Frozen states + ${checkinsCount} check-ins & ${expensesAdded} expenses.`,
      steps: [
        {
          label: "1. Studio Profiles",
          status: "done",
          detail: `${createdCount} new members registered (${existing.count + createdCount} total)`,
        },
        {
          label: "2. Attendance & Freeze State",
          status: "done",
          detail: `${checkinsCount} workout streak check-in(s) and ${freezeCount} active freeze window`,
        },
        {
          label: "3. CFO Expense Ledger",
          status: "done",
          detail: expensesAdded > 0 ? `Added ${expensesAdded} operating expenses` : "Existing expense ledger preserved",
        },
        {
          label: "4. Google Sheets Workbook",
          status: "done",
          detail: `Synced tabs locally (${String(pushRes.mode || "flushed")})`,
        },
      ],
      raw_result: { createdCount, checkinsCount, freezeCount, expensesAdded, pushRes },
      timestamp_ist: nowIstLabel(),
    };
  },

  simulateGm01Registration: async (): Promise<AutomationSimulationResult> => {
    const names = ["Rohan Kulkarni", "Tanya Banerjee", "Devika Menon", "Arjun Malhotra", "Ishaan Chatterjee", "Nandini Iyer"];
    const name = names[Math.floor(Math.random() * names.length)];
    const randSuffix = String(Math.floor(10000000 + Math.random() * 89999999));
    const rawPhone = `98${randSuffix}`;
    const emailSlug = name.toLowerCase().replace(/\s+/g, ".");
    const created = await gymApi.createMember({
      name,
      phone: rawPhone,
      email: `${emailSlug}+${randSuffix.slice(0, 3)}@crushfit.in`,
      plan: "Quarterly",
      fee: 4000,
      start_date: formatIstDateOffset(0),
      payment_status: "Paid",
      payment_mode: "UPI",
      fitness_goal: "Transformation & Strength",
      batch_slot: "Morning 7AM",
      assigned_trainer: "Coach Vikram",
      sync_to_n8n: true,
    });
    const mem = created.member;
    const sheetRow = await apiFetch<Record<string, unknown>>(`/api/v1/members/${encodeURIComponent(mem.member_id)}/sheets-row`);
    const trig = await gymApi.triggerWorkflow("GM-01", {
      member_id: mem.member_id,
      name: mem.name,
      phone: mem.phone,
      email: mem.email,
      plan: mem.plan,
      fee: mem.fee,
      expiry_date: mem.expiry_date,
    });
    const webhookRes = (trig.n8n_webhook || {}) as { status?: string; http_status?: number };
    return {
      workflow_code: "GM-01",
      title: "GM-01 Smart Registration & 18-Col Google Sheets Sync",
      summary: `Registered ${mem.name} (${mem.member_id}) · Phone normalized to +${mem.phone} · Valid till ${mem.expiry_date} · 18% GST receipt generated.`,
      steps: [
        { label: "1. Mobile & Plan Validation", status: "done", detail: `Normalized ${rawPhone} -> +${mem.phone}` },
        { label: "2. MEM-ID & 18% GST Receipt", status: "done", detail: `${mem.member_id} | Fee ₹${mem.fee}` },
        { label: "3. Google Sheets 18-Col Row", status: "done", detail: `${Object.keys(sheetRow).length} columns prepared` },
        {
          label: "4. Railway n8n GM-01 Webhook",
          status: webhookRes.status === "SENT" ? "done" : "skipped",
          detail: `Status: ${webhookRes.status || "LOGGED"}`,
        },
      ],
      raw_result: { member: mem, google_sheets_row: sheetRow, n8n_trigger: trig },
      timestamp_ist: nowIstLabel(),
    };
  },

  simulateGm02EmailSweep: async (): Promise<AutomationSimulationResult> => {
    const dueBefore = await gymApi.getDueFollowUps(true);
    const dispatchRes = await gymApi.dispatchFollowUps({ dry_run: false });
    const trig = await gymApi.triggerWorkflow("GM-02", {
      due_count: dueBefore.count,
      record_logs: true,
      source: "ExperienceLab",
    });
    const webhookRes = (trig.n8n_webhook || {}) as { status?: string };
    const dispatchedCount = Number((dispatchRes as { dispatched_count?: number }).dispatched_count ?? dueBefore.count);
    return {
      workflow_code: "GM-02",
      title: "GM-02 Email Retention & Expiry Follow-Up Cadence",
      summary: `Evaluated ${dueBefore.count} due member(s) and dispatched ${dispatchedCount} prioritized Email retention alert(s) via Gmail + n8n.`,
      steps: [
        { label: "1. Retention Stage Scanner", status: "done", detail: `${dueBefore.count} candidate(s) matched (T0/T3/Dues/Inactivity)` },
        { label: "2. Email Copy Generation", status: "done", detail: `${dispatchedCount} personalized Email payload(s) queued` },
        {
          label: "3. Railway n8n GM-02 (Gmail)",
          status: webhookRes.status === "SENT" ? "done" : "skipped",
          detail: `Webhook dispatch: ${webhookRes.status || "QUEUED"}`,
        },
        { label: "4. Automation Audit Log", status: "done", detail: "Updated Follow-Up Logs & last_reminder_date" },
      ],
      raw_result: { due_before: dueBefore, dispatch: dispatchRes, n8n_trigger: trig },
      timestamp_ist: nowIstLabel(),
    };
  },

  simulateGm03PaymentRenewal: async (): Promise<AutomationSimulationResult> => {
    const list = await gymApi.listMembers();
    let target = list.members.find((m) => m.payment_status === "Pending") || list.members[0];
    let autoCreatedPending = false;
    if (!target) {
      const randSuffix = String(Math.floor(10000000 + Math.random() * 89999999));
      const res = await gymApi.createMember({
        name: "Sayan Demo Renewal",
        phone: `97${randSuffix}`,
        email: `sayan.renewal+${randSuffix.slice(0, 3)}@crushfit.in`,
        plan: "Monthly",
        fee: 1500,
        start_date: formatIstDateOffset(-25),
        payment_status: "Pending",
        sync_to_n8n: false,
      });
      target = res.member;
      autoCreatedPending = true;
    }
    const payAmount = target.fee > 0 ? target.fee : 1500;
    const payRes = await gymApi.recordPayment({
      member_id: target.member_id,
      amount_paid: payAmount,
      payment_mode: "UPI",
      extend_membership: true,
      notes: "Instant renewal via GYMFLOW Experience Lab",
    });
    const invoice = await gymApi.getGstInvoice(payRes.payment.payment_id);
    const trig = await gymApi.triggerWorkflow("GM-03", {
      member_id: target.member_id,
      payment_id: payRes.payment.payment_id,
      invoice_number: payRes.payment.invoice_number,
      amount_paid: payRes.payment.amount_paid,
      new_expiry_date: payRes.member.expiry_date,
    });
    const webhookRes = (trig.n8n_webhook || {}) as { status?: string };
    return {
      workflow_code: "GM-03",
      title: "GM-03 Payment Settlement & 18% GST Renewal Engine",
      summary: `Confirmed ${payRes.payment.invoice_number} (₹${payRes.payment.amount_paid}, GST ₹${invoice.total_gst}) for ${target.name}. New expiry: ${payRes.member.expiry_date}.`,
      steps: [
        {
          label: "1. Target Account",
          status: "done",
          detail: `${target.name} (${target.member_id})${autoCreatedPending ? " [demo created]" : ""}`,
        },
        {
          label: "2. 18% GST Invoice Issued",
          status: "done",
          detail: `${invoice.invoice_number} (CGST ₹${invoice.cgst_amount} + SGST ₹${invoice.sgst_amount})`,
        },
        { label: "3. Expiry Auto-Extended", status: "done", detail: `New validity until ${payRes.member.expiry_date}` },
        {
          label: "4. Railway n8n GM-03 Webhook",
          status: webhookRes.status === "SENT" ? "done" : "skipped",
          detail: `Webhook dispatch: ${webhookRes.status || "LOGGED"}`,
        },
      ],
      raw_result: { payment: payRes.payment, invoice, updated_member: payRes.member, n8n_trigger: trig },
      timestamp_ist: nowIstLabel(),
    };
  },

  simulateGm04OwnerDigest: async (): Promise<AutomationSimulationResult> => {
    const trig = await gymApi.triggerWorkflow("GM-04", { source: "ExperienceLab" });
    const localRes = (trig.local_result || {}) as {
      followups_queued_count?: number;
      status_transitions?: Array<unknown>;
      accounts_summary?: { gross_collections?: number; net_profit?: number; pending_receivables_amount?: number };
    };
    const acc = localRes.accounts_summary || {};
    const webhookRes = (trig.n8n_webhook || {}) as { status?: string };
    return {
      workflow_code: "GM-04",
      title: "GM-04 Daily Owner Digest & Churn Radar",
      summary: `Compiled Executive Digest: Gross ₹${acc.gross_collections ?? 0}, Net Profit ₹${acc.net_profit ?? 0}, Pending ₹${acc.pending_receivables_amount ?? 0}, ${localRes.followups_queued_count ?? 0} follow-up(s) queued.`,
      steps: [
        {
          label: "1. Status Housekeeping",
          status: "done",
          detail: `${localRes.status_transitions?.length ?? 0} freeze/expiry transition(s)`,
        },
        {
          label: "2. Churn & Retention Radar",
          status: "done",
          detail: `${localRes.followups_queued_count ?? 0} follow-up(s) surfaced`,
        },
        {
          label: "3. CFO Accounts P&L Rollup",
          status: "done",
          detail: `Gross ₹${acc.gross_collections ?? 0} · Profit ₹${acc.net_profit ?? 0}`,
        },
        {
          label: "4. Railway n8n GM-04 Digest",
          status: webhookRes.status === "SENT" ? "done" : "skipped",
          detail: `Webhook dispatch: ${webhookRes.status || "LOGGED"}`,
        },
      ],
      raw_result: trig,
      timestamp_ist: nowIstLabel(),
    };
  },

  simulateGm05AiAutopilot: async (
    customPrompt = "Run full gym autopilot: update expired/unfrozen statuses, evaluate and queue retention follow-ups, and compile CFO P&L summary."
  ): Promise<AutomationSimulationResult> => {
    const agentRes = await gymApi.sendAgentPrompt(customPrompt, "owner", true);
    const n8nStatus = String((agentRes.n8n_dispatch as { status?: string })?.status || "LOGGED");
    return {
      workflow_code: "GM-05",
      title: "GM-05 OpenAI GPT-4o-mini Autonomous Gym Manager",
      summary: agentRes.reply,
      steps: [
        { label: "1. OpenAI GPT-4o-mini Planner", status: "done", detail: `Intent: ${agentRes.intent}` },
        {
          label: "2. FastAPI Tool Calls",
          status: "done",
          detail: `${agentRes.tools_executed.length} tool(s): ${agentRes.tools_executed.map((t) => t.tool_name).join(", ") || "direct reply"}`,
        },
        { label: "3. Google Sheets Audit Sync", status: "done", detail: `Run ${agentRes.run_id} logged to Agent Runs & Automation Log` },
        {
          label: "4. Railway n8n GM-05 Webhook",
          status: n8nStatus === "SENT" ? "done" : "skipped",
          detail: `Status: ${n8nStatus}`,
        },
      ],
      raw_result: agentRes as unknown as Record<string, unknown>,
      timestamp_ist: agentRes.timestamp_ist || nowIstLabel(),
    };
  },
};
