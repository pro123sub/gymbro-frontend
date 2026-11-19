"use client";

import React, { useEffect, useState } from "react";
import {
  Play,
  Clock,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Rocket,
  Pause,
  Table2,
  Settings2,
  CheckCircle2,
  ExternalLink,
  Workflow,
  Server,
} from "lucide-react";
import { ScheduledJob, WorkflowItem, gymApi, getApiBaseUrl } from "@/lib/api";

const SHEET_TABS = [
  "Members",
  "Membership Plans",
  "Payments",
  "Attendance",
  "Follow-Up Logs",
  "Automation Log",
  "Expenses",
  "Agent Runs",
  "Gym Settings",
];

export default function AutomationControlTab({
  workflows,
  schedules,
  sheetsStatus,
  n8nBaseUrl,
  onRefresh,
  onToast,
}: {
  workflows: WorkflowItem[];
  schedules: ScheduledJob[];
  sheetsStatus: Record<string, unknown> | null;
  n8nBaseUrl?: string;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, isError?: boolean) => void;
}) {
  const [selectedTab, setSelectedTab] = useState("Members");
  const [tabRows, setTabRows] = useState<Array<Record<string, unknown>>>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [deployOutput, setDeployOutput] = useState<string | null>(null);

  const [jobWorkflow, setJobWorkflow] = useState("GM-02");
  const [jobName, setJobName] = useState("Morning Email Retention Sweep");
  const [scheduleType, setScheduleType] = useState<"cron" | "interval_minutes" | "one_time">("cron");
  const [cronExpr, setCronExpr] = useState("0 9 * * *");
  const [intervalMins, setIntervalMins] = useState("60");
  const [runAtIst, setRunAtIst] = useState("2026-11-20 09:00:00 IST");

  const [customApiUrl, setCustomApiUrl] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customTenantId, setCustomTenantId] = useState("crush-main-studio");

  useEffect(() => {
    setCustomApiUrl(getApiBaseUrl());
    if (typeof window !== "undefined") {
      setCustomApiKey(window.localStorage.getItem("gymflow_api_key") || "");
      setCustomTenantId(window.localStorage.getItem("gymflow_tenant_id") || "crush-main-studio");
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingTab(true);
    gymApi
      .getSheetsTab(selectedTab)
      .then((res) => {
        if (active) setTabRows(res.rows);
      })
      .catch(() => {
        if (active) setTabRows([]);
      })
      .finally(() => {
        if (active) setLoadingTab(false);
      });
    return () => {
      active = false;
    };
  }, [selectedTab, sheetsStatus]);

  async function runAction(key: string, fn: () => Promise<void>) {
    setBusyAction(key);
    try {
      await fn();
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Operation failed", true);
    } finally {
      setBusyAction(null);
    }
  }

  const sheetCounts = (sheetsStatus?.counts || {}) as Record<string, number>;
  const sheetId = String(sheetsStatus?.spreadsheet_id || "");

  return (
    <div className="space-y-6">
      {/* Workflow Control Plane (GM-01 .. GM-05) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-forest text-lime-neon">
              <Workflow className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">n8n Workflow Control Plane (GM-01 to GM-05)</h3>
              <p className="text-xs text-slate-500">
                Trigger live Railway n8n flows via API, inspect webhook readiness, toggle status, or re-sync workflows.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {n8nBaseUrl && (
              <a
                href={n8nBaseUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open Railway n8n <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() =>
                void runAction("deploy-dry", async () => {
                  const res = await gymApi.deployWorkflowsToN8n({ activate: true, dry_run: false });
                  setDeployOutput(JSON.stringify(res, null, 2));
                  onToast("Synchronized & deployed GM-01..GM-05 workflows to Railway n8n.");
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-forest-pill disabled:opacity-50"
            >
              <Rocket className="h-3.5 w-3.5 text-lime-neon" />
              {busyAction === "deploy-dry" ? "Syncing..." : "Sync & Activate Flows on n8n"}
            </button>
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() =>
                void runAction("tick", async () => {
                  const res = await gymApi.tickSchedules();
                  onToast(`Checked schedules in IST: ${String((res as { executed_count?: number }).executed_count ?? 0)} executed.`);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Clock className="h-3.5 w-3.5" /> Tick Due Schedules
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((wf) => (
            <div
              key={wf.workflow_code}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#f8fbf9] p-4 transition hover:border-forest-accent/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-forest px-2.5 py-0.5 text-[11px] font-bold text-lime-neon">
                      {wf.workflow_code}
                    </span>
                    <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {wf.trigger_type}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      wf.is_enabled ? "bg-emerald-100 text-forest-accent" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {wf.is_enabled ? "Enabled" : "Paused"} · {wf.last_status}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-bold text-slate-900">{wf.name.replace(`${wf.workflow_code} - `, "")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{wf.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {wf.cron_expression && (
                    <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200/70 font-mono">
                      cron: {wf.cron_expression}
                    </span>
                  )}
                  <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200/70">
                    Runs: <strong>{wf.total_runs}</strong>
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 border ${
                      wf.webhook_ready
                        ? "border-emerald-200 bg-emerald-50 text-forest-accent"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {wf.webhook_ready ? "Webhook Ready" : "Local Pipeline"}
                  </span>
                </div>
                {wf.n8n_workflow_id && (
                  <p className="mt-2 font-mono text-[11px] text-forest-accent">
                    n8n ID: {wf.n8n_workflow_id}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-200/70 pt-3">
                <button
                  type="button"
                  disabled={!wf.is_enabled || busyAction !== null}
                  onClick={() =>
                    void runAction(`trig-${wf.workflow_code}`, async () => {
                      const payload = wf.workflow_code === "GM-05" ? { message: "Run full gym autopilot" } : {};
                      const res = await gymApi.triggerWorkflow(wf.workflow_code, payload);
                      const whStatus = String((res.n8n_webhook as { status?: string })?.status || "COMPLETED");
                      onToast(`Executed ${wf.workflow_code} (${whStatus}).`);
                    })
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-lime-neon px-3 py-1.5 text-xs font-bold text-forest transition hover:brightness-95 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" /> {busyAction === `trig-${wf.workflow_code}` ? "Running..." : "Trigger Now"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(`toggle-${wf.workflow_code}`, async () => {
                      await gymApi.updateWorkflow(wf.workflow_code, { is_enabled: !wf.is_enabled });
                      onToast(`${wf.workflow_code} ${wf.is_enabled ? "disabled" : "enabled"}.`);
                    })
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {wf.is_enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {deployOutput && (
          <pre className="mt-4 max-h-52 overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] text-emerald-300">
            {deployOutput}
          </pre>
        )}
      </div>

      {/* Create Schedule & Active Schedules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runAction("create-sched", async () => {
              await gymApi.createSchedule({
                workflow_code: jobWorkflow,
                job_name: jobName,
                schedule_type: scheduleType,
                cron_expression: scheduleType === "cron" ? cronExpr : "",
                interval_minutes: scheduleType === "interval_minutes" ? Number(intervalMins) : 0,
                run_at_ist: scheduleType === "one_time" ? runAtIst : "",
                payload: jobWorkflow === "GM-05" ? { message: "Run full gym autopilot" } : {},
              });
              onToast(`Scheduled "${jobName}" for ${jobWorkflow}.`);
            });
          }}
          className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm"
        >
          <h4 className="text-sm font-bold text-slate-900">Create Automated Schedule</h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Workflow</label>
            <select value={jobWorkflow} onChange={(e) => setJobWorkflow(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs">
              <option value="GM-01">GM-01 — Member Registration</option>
              <option value="GM-02">GM-02 — Email Follow-Up Cadence</option>
              <option value="GM-03">GM-03 — Payment &amp; Renewal</option>
              <option value="GM-04">GM-04 — Daily Owner Digest</option>
              <option value="GM-05">GM-05 — AI Gym Manager Agent</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Job Name</label>
            <input required value={jobName} onChange={(e) => setJobName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Schedule Type</label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as "cron" | "interval_minutes" | "one_time")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
            >
              <option value="cron">Cron (IST)</option>
              <option value="interval_minutes">Every N Minutes</option>
              <option value="one_time">One-Time (IST Timestamp)</option>
            </select>
          </div>
          {scheduleType === "cron" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Cron Expression (min hr dom mon dow)</label>
              <input value={cronExpr} onChange={(e) => setCronExpr(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs" />
            </div>
          )}
          {scheduleType === "interval_minutes" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Interval (Minutes)</label>
              <input type="number" min="1" value={intervalMins} onChange={(e) => setIntervalMins(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
            </div>
          )}
          {scheduleType === "one_time" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Run At (YYYY-MM-DD HH:MM:SS IST)</label>
              <input value={runAtIst} onChange={(e) => setRunAtIst(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs" />
            </div>
          )}
          <button
            type="submit"
            disabled={busyAction !== null}
            className="w-full rounded-full bg-lime-neon py-2.5 text-xs font-bold text-forest transition hover:brightness-95"
          >
            + Add Schedule Job
          </button>
        </form>

        <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-slate-900">Scheduled Automation Jobs ({schedules.length})</h4>
          {schedules.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">
              No custom schedules added yet. Create a cron or interval schedule on the left to automate runs.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="py-2 pr-3">Job</th>
                    <th className="py-2 pr-3">Flow</th>
                    <th className="py-2 pr-3">Rule</th>
                    <th className="py-2 pr-3">Next Run</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((job) => (
                    <tr key={job.job_id}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">{job.job_name}</td>
                      <td className="py-2.5 pr-3 font-mono font-bold text-forest-accent">{job.workflow_code}</td>
                      <td className="py-2.5 pr-3 font-mono text-slate-600">
                        {job.cron_expression || (job.interval_minutes ? `${job.interval_minutes}m` : job.run_at_ist)}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">{job.next_run_at_ist || "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-forest-accent">
                          {job.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(`run-${job.job_id}`, async () => {
                              await gymApi.runScheduleNow(job.job_id);
                              onToast(`Executed "${job.job_name}".`);
                            })
                          }
                          className="rounded-full bg-[#eef7e6] px-2.5 py-1 text-[11px] font-semibold text-forest-accent"
                        >
                          Run Now
                        </button>
                        {job.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() =>
                              void runAction(`pause-${job.job_id}`, async () => {
                                const next = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
                                await gymApi.updateSchedule(job.job_id, { status: next });
                                onToast(`Schedule ${next.toLowerCase()}.`);
                              })
                            }
                            className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                          >
                            <Pause className="h-3 w-3" /> {job.status === "ACTIVE" ? "Pause" : "Resume"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Live 100% Google Sheets Workbook Explorer & Sync */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef7e6] text-forest-accent">
              <Table2 className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                100% Google Sheets Workbook Database ({String(sheetsStatus?.google_sheets_mode ?? "n8n_bridge")})
              </h4>
              <p className="text-xs text-slate-500">
                Spreadsheet ID: <code className="font-mono text-forest-accent">{sheetId || "—"}</code>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sheetId && !sheetId.startsWith("REPLACE_WITH") && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open Google Sheet <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() =>
                void runAction("sheets-push", async () => {
                  const r = await gymApi.pushSheetsSync();
                  onToast(`Sheets Push (${String((r as { mode?: string }).mode)}): flushed workbook.`);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-3.5 py-1.5 text-xs font-bold text-forest"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Push Snapshot
            </button>
            <button
              type="button"
              onClick={() =>
                void runAction("sheets-pull", async () => {
                  await gymApi.pullSheetsSync();
                  onToast("Pulled latest rows from Google Sheets store.");
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <DownloadCloud className="h-3.5 w-3.5" /> Pull Snapshot
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {SHEET_TABS.map((tab) => {
            const count = sheetCounts[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedTab === tab
                    ? "bg-forest text-lime-neon"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab}</span>
                {typeof count === "number" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      selectedTab === tab ? "bg-lime-neon/20 text-lime-neon" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loadingTab ? (
          <div className="flex items-center gap-2 py-6 text-xs text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading {selectedTab} rows...
          </div>
        ) : (
          <div className="max-h-72 overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  {tabRows.length > 0 ? (
                    Object.keys(tabRows[0])
                      .slice(0, 8)
                      .map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                          {col}
                        </th>
                      ))
                  ) : (
                    <th className="px-3 py-2.5">Empty Tab</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tabRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-400">No rows in {selectedTab} yet.</td>
                  </tr>
                ) : (
                  tabRows.slice(0, 25).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      {Object.keys(tabRows[0])
                        .slice(0, 8)
                        .map((col) => (
                          <td key={col} className="max-w-[220px] truncate px-3 py-2 text-slate-700">
                            {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")}
                          </td>
                        ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backend Connection Settings Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-forest-accent" />
            <h4 className="text-sm font-bold text-slate-900">Backend &amp; Environment Connection (Local or Railway)</h4>
          </div>
          <button
            type="button"
            onClick={() => setCustomApiUrl("http://localhost:8000")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Server className="h-3 w-3" /> Reset to localhost:8000
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            value={customApiUrl}
            onChange={(e) => setCustomApiUrl(e.target.value)}
            placeholder="https://your-backend.up.railway.app"
            className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-forest-accent focus:outline-none"
          />
          <input
            value={customTenantId}
            onChange={(e) => setCustomTenantId(e.target.value)}
            placeholder="Tenant ID (crush-main-studio)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-forest-accent focus:outline-none"
          />
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="Optional X-API-Key"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-forest-accent focus:outline-none"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("gymflow_api_base_url", customApiUrl.trim() || "http://localhost:8000");
                window.localStorage.setItem("gymflow_tenant_id", customTenantId.trim() || "crush-main-studio");
                if (customApiKey.trim()) {
                  window.localStorage.setItem("gymflow_api_key", customApiKey.trim());
                } else {
                  window.localStorage.removeItem("gymflow_api_key");
                }
              }
              onToast("Updated backend connection URL. Reconnecting...");
              void onRefresh();
            }}
            className="rounded-full bg-forest px-5 py-2 text-xs font-bold text-lime-neon transition hover:bg-forest-pill"
          >
            Save &amp; Reconnect
          </button>
        </div>
      </div>
    </div>
  );
}
