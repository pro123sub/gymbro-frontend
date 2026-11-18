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
} from "lucide-react";
import { ScheduledJob, WorkflowItem, gymApi, getApiBaseUrl } from "@/lib/api";

const SHEET_TABS = [
  "Members",
  "Membership Plans",
  "Payments",
  "Attendance",
  "Automation Log",
  "Gym Settings",
  "Expenses",
];

export default function AutomationControlTab({
  workflows,
  schedules,
  sheetsStatus,
  onRefresh,
  onToast,
}: {
  workflows: WorkflowItem[];
  schedules: ScheduledJob[];
  sheetsStatus: Record<string, unknown> | null;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, isError?: boolean) => void;
}) {
  const [selectedTab, setSelectedTab] = useState("Members");
  const [tabRows, setTabRows] = useState<Array<Record<string, unknown>>>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [deployOutput, setDeployOutput] = useState<string | null>(null);

  // New schedule form state
  const [jobWorkflow, setJobWorkflow] = useState("GM-02");
  const [jobName, setJobName] = useState("Morning Email Retention Sweep");
  const [scheduleType, setScheduleType] = useState<"cron" | "interval_minutes" | "one_time">("cron");
  const [cronExpr, setCronExpr] = useState("0 9 * * *");
  const [intervalMins, setIntervalMins] = useState("60");
  const [runAtIst, setRunAtIst] = useState("2026-11-20 09:00:00 IST");

  // API connection override state
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");

  useEffect(() => {
    setCustomApiUrl(getApiBaseUrl());
    if (typeof window !== "undefined") {
      setCustomApiKey(window.localStorage.getItem("gymflow_api_key") || "");
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

  return (
    <div className="space-y-6">
      {/* Workflow Control Plane (GM-01 .. GM-05) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">n8n Workflow Control Plane (GM-01 to GM-05)</h3>
            <p className="text-xs text-slate-500">
              Start workflows via API, inspect webhook readiness, toggle status, or auto-deploy flows to Railway n8n.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() =>
                void runAction("deploy-dry", async () => {
                  const res = await gymApi.deployWorkflowsToN8n({ activate: false, dry_run: false });
                  setDeployOutput(JSON.stringify(res, null, 2));
                  onToast("Executed n8n workflow deployment request.");
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-pill disabled:opacity-50"
            >
              <Rocket className="h-3.5 w-3.5 text-lime-neon" />
              {busyAction === "deploy-dry" ? "Deploying..." : "Sync / Deploy Flows to n8n"}
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((wf) => (
            <div key={wf.workflow_code} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#f9fbfa] p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-forest px-2.5 py-0.5 text-[11px] font-bold text-lime-neon">
                    {wf.workflow_code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      wf.is_enabled ? "bg-emerald-100 text-forest-accent" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {wf.is_enabled ? "Enabled" : "Disabled"} · {wf.last_status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{wf.name}</p>
                <p className="mt-1 text-xs text-slate-500">{wf.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span>Trigger: <strong>{wf.trigger_type}</strong></span>
                  {wf.cron_expression && <span>Cron: <code>{wf.cron_expression}</code></span>}
                  <span>Runs: <strong>{wf.total_runs}</strong></span>
                </div>
                {wf.n8n_workflow_id && (
                  <p className="mt-1 font-mono text-[11px] text-forest-accent">n8n ID: {wf.n8n_workflow_id}</p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-200/70 pt-3">
                <button
                  type="button"
                  disabled={!wf.is_enabled || busyAction !== null}
                  onClick={() =>
                    void runAction(`trig-${wf.workflow_code}`, async () => {
                      const payload = wf.workflow_code === "GM-05" ? { message: "Run full gym autopilot" } : {};
                      await gymApi.triggerWorkflow(wf.workflow_code, payload);
                      onToast(`Triggered ${wf.workflow_code} via API.`);
                    })
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-lime-neon px-3 py-1.5 text-xs font-semibold text-forest hover:brightness-95 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" /> Trigger Now
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(`toggle-${wf.workflow_code}`, async () => {
                      await gymApi.updateWorkflow(wf.workflow_code, { is_enabled: !wf.is_enabled });
                      onToast(`${wf.workflow_code} ${wf.is_enabled ? "disabled" : "enabled"}.`);
                    })
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {wf.is_enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {deployOutput && (
          <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] text-emerald-300">
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
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <h4 className="text-sm font-bold text-slate-900">Create Automated Schedule</h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Workflow</label>
            <select value={jobWorkflow} onChange={(e) => setJobWorkflow(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs">
              <option value="GM-01">GM-01 — Member Registration</option>
              <option value="GM-02">GM-02 — Email Follow-Up Cadence</option>
              <option value="GM-03">GM-03 — Payment & Renewal</option>
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
            className="w-full rounded-full bg-lime-neon py-2 text-xs font-semibold text-forest hover:brightness-95"
          >
            + Add Schedule Job
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="mb-3 text-sm font-bold text-slate-900">Scheduled Automation Jobs ({schedules.length})</h4>
          {schedules.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500">
              No custom schedules added yet. Create a cron or interval schedule on the left to start automating runs.
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
                      <td className="py-2.5 pr-3 font-medium text-slate-900">{job.job_name}</td>
                      <td className="py-2.5 pr-3 font-mono text-forest-accent">{job.workflow_code}</td>
                      <td className="py-2.5 pr-3 font-mono text-slate-600">
                        {job.cron_expression || (job.interval_minutes ? `${job.interval_minutes}m` : job.run_at_ist)}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">{job.next_run_at_ist || "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium">{job.status}</span>
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Table2 className="h-5 w-5 text-forest-accent" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                100% Google Sheets Workbook Database ({String(sheetsStatus?.google_sheets_mode ?? "n8n_bridge")})
              </h4>
              <p className="text-xs text-slate-500">
                Spreadsheet ID: <code className="text-forest-accent">{String(sheetsStatus?.spreadsheet_id ?? "—")}</code>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void runAction("sheets-push", async () => {
                  const r = await gymApi.pushSheetsSync();
                  onToast(`Sheets Push (${String((r as { mode?: string }).mode)}): flushed workbook.`);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon px-3.5 py-1.5 text-xs font-semibold text-forest"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Push to Google Sheets
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
          {SHEET_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedTab === tab
                  ? "bg-forest text-lime-neon"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loadingTab ? (
          <div className="flex items-center gap-2 py-6 text-xs text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading {selectedTab} rows...
          </div>
        ) : (
          <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  {tabRows.length > 0 ? (
                    Object.keys(tabRows[0])
                      .slice(0, 8)
                      .map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 font-semibold">
                          {col}
                        </th>
                      ))
                  ) : (
                    <th className="px-3 py-2">Empty Tab</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tabRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-slate-400">No rows in {selectedTab} yet.</td>
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

      {/* API Endpoint Settings Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-forest-accent" />
          <h4 className="text-sm font-bold text-slate-900">Backend Connection Settings (Local or Railway URL)</h4>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={customApiUrl}
            onChange={(e) => setCustomApiUrl(e.target.value)}
            placeholder="https://your-backend.up.railway.app"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="Optional X-API-Key"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("gymflow_api_base_url", customApiUrl.trim() || "http://localhost:8000");
                if (customApiKey.trim()) {
                  window.localStorage.setItem("gymflow_api_key", customApiKey.trim());
                } else {
                  window.localStorage.removeItem("gymflow_api_key");
                }
              }
              onToast("Updated backend connection URL. Refreshing data...");
              void onRefresh();
            }}
            className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-pill"
          >
            Save & Reconnect
          </button>
        </div>
      </div>
    </div>
  );
}
