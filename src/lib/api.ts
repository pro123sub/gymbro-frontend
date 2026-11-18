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
      process.env.NEXT_PUBLIC_TENANT_ID ||
      "crush-main-studio",
    ...extra,
  };
  const apiKey =
    (typeof window !== "undefined" && window.localStorage.getItem("gymflow_api_key")) ||
    process.env.NEXT_PUBLIC_API_KEY ||
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

  // AI Agent Prompt & Autopilot
  sendAgentPrompt: (message: string, actorRole = "owner", syncToN8n = false) =>
    apiFetch<AgentChatResponse>("/api/v1/agent/chat", {
      method: "POST",
      body: JSON.stringify({ message, actor_role: actorRole, sync_to_n8n: syncToN8n }),
    }),
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
};
