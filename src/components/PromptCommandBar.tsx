"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Cpu,
  Database,
  Workflow,
  ArrowRight,
  Zap,
} from "lucide-react";
import { AgentChatResponse, CopilotStatus, gymApi } from "@/lib/api";

interface PromptCommandBarProps {
  onActionCompleted: () => Promise<void> | void;
  copilotStatus?: CopilotStatus | null;
}

const QUICK_PROMPTS = [
  {
    label: "Register Walk-in",
    tag: "GM-01",
    prompt: "Register Rahul Verma phone 9876543210 quarterly paid 4000",
  },
  {
    label: "Email Follow-Ups",
    tag: "GM-02",
    prompt: "Evaluate and send due email follow-ups",
  },
  {
    label: "Run Daily Autopilot",
    tag: "GM-04",
    prompt: "Run full gym autopilot",
  },
  {
    label: "CFO P&L & Dues",
    tag: "CFO",
    prompt: "Show accounts P&L and pending dues summary",
  },
  {
    label: "Log Electricity ₹3,500",
    tag: "EXP",
    prompt: "Record electricity expense Rs 3500",
  },
  {
    label: "Streak Leaderboard",
    tag: "STREAK",
    prompt: "Show workout streak leaderboard",
  },
  {
    label: "Check-in Aarav",
    tag: "ATTN",
    prompt: "Check-in Aarav Sharma workout Strength",
  },
  {
    label: "Test Member RBAC",
    tag: "RBAC",
    roleOverride: "member" as const,
    prompt: "Show accounts P&L",
  },
];

export default function PromptCommandBar({ onActionCompleted, copilotStatus }: PromptCommandBarProps) {
  const [prompt, setPrompt] = useState("");
  const [actorRole, setActorRole] = useState<"owner" | "staff" | "member">("owner");
  const [syncN8n, setSyncN8n] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentChatResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function executePrompt(textToRun?: string, roleOverride?: "owner" | "staff" | "member") {
    const query = (textToRun ?? prompt).trim();
    if (!query || running) return;
    const effectiveRole = roleOverride ?? actorRole;
    if (roleOverride) setActorRole(roleOverride);
    setRunning(true);
    setError(null);
    try {
      const res = await gymApi.sendAgentPrompt(query, effectiveRole, syncN8n);
      setResult(res);
      setShowDetails(false);
      if (!textToRun) setPrompt("");
      await onActionCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run prompt against FastAPI + OpenAI agent.");
    } finally {
      setRunning(false);
    }
  }

  const n8nStatus = result ? String((result.n8n_dispatch as { status?: string })?.status || "LOGGED") : "IDLE";

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#071912] via-[#0c261b] to-[#133828] p-5 text-white shadow-xl shadow-emerald-950/15">
      <div className="bg-command-grid pointer-events-none absolute inset-0 opacity-75" />
      <div className="relative z-10">
        {/* Top Status & Controls Row */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-neon text-forest shadow-md shadow-lime-neon/25">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white sm:text-base">
                  AI Gym Manager Command Deck
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-neon/35 bg-lime-neon/15 px-2.5 py-0.5 text-[11px] font-semibold text-lime-neon">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-neon" />
                  OpenAI {copilotStatus?.openai_model || "gpt-4o-mini"} Ready
                </span>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100/80 sm:inline-flex">
                  n8n GM-05 + Google Sheets
                </span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-100/70">
                Execute natural-language commands to register members, issue GST renewals, freeze plans, audit P&amp;L, or fire live n8n automations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Actor Role Switcher to test RBAC */}
            <div className="inline-flex items-center rounded-full border border-white/15 bg-black/25 p-0.5 text-[11px]">
              {(["owner", "staff", "member"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActorRole(r)}
                  className={`rounded-full px-2.5 py-1 font-semibold capitalize transition ${
                    actorRole === r ? "bg-lime-neon text-forest" : "text-emerald-100/75 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-medium text-emerald-100/90 transition hover:border-lime-neon/40">
              <input
                type="checkbox"
                checked={syncN8n}
                onChange={(e) => setSyncN8n(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-[#b9f44d]"
              />
              Live n8n Sync
            </label>
          </div>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void executePrompt();
          }}
          className="flex flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Terminal className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-lime-neon/80" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try: "Register Ankit Sen phone 9876509876 yearly paid 13500" or "Run full gym autopilot"'
              className="w-full rounded-2xl border border-white/15 bg-black/30 py-3 pl-10 pr-4 text-sm text-white placeholder:text-emerald-200/45 focus:border-lime-neon focus:bg-black/45 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={running || !prompt.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-neon px-6 py-3 text-sm font-bold text-forest shadow-lg shadow-lime-neon/20 transition hover:brightness-95 disabled:opacity-50"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {running ? "Executing AI..." : "Run Command"}
          </button>
        </form>

        {/* Quick Action Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-200/60">
            <Zap className="h-3 w-3 text-lime-neon" /> Try Live:
          </span>
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={running}
              onClick={() => {
                setPrompt(item.prompt);
                void executePrompt(item.prompt, item.roleOverride);
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-50 transition hover:border-lime-neon/60 hover:bg-lime-neon hover:text-forest disabled:opacity-50"
            >
              <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-lime-neon group-hover:bg-forest group-hover:text-lime-neon">
                {item.tag}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3.5 rounded-2xl border border-red-400/40 bg-red-950/60 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* 5-Stage Visual Automation Pipeline Trace */}
        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-black/35 p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-lime-neon" />
                <span className="rounded-full bg-lime-neon px-2.5 py-0.5 text-[11px] font-extrabold text-forest">
                  {result.intent}
                </span>
                <span className="font-mono text-xs text-emerald-200/75">
                  {result.run_id} · {result.timestamp_ist}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-lime-neon hover:bg-white/10"
              >
                <Terminal className="h-3.5 w-3.5" />
                Tool &amp; Sheets Trace ({result.tools_executed.length})
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            <p className="mt-2.5 text-sm font-medium leading-relaxed text-white">{result.reply}</p>

            {/* Visual Pipeline Nodes */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lime-neon">
                  <Cpu className="h-3.5 w-3.5" /> 1. AI Planner
                </div>
                <p className="mt-0.5 truncate text-[11px] text-emerald-100/80">
                  Role: {actorRole} · {result.intent}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lime-neon">
                  <ShieldCheck className="h-3.5 w-3.5" /> 2. FastAPI Tools
                </div>
                <p className="mt-0.5 truncate text-[11px] text-emerald-100/80">
                  {result.tools_executed.map((t) => t.tool_name).join(", ") || "Direct response"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lime-neon">
                  <Database className="h-3.5 w-3.5" /> 3. Google Sheets
                </div>
                <p className="mt-0.5 truncate text-[11px] text-emerald-100/80">
                  Logged &amp; workbook flushed
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lime-neon">
                  <Workflow className="h-3.5 w-3.5" /> 4. n8n GM-05
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-emerald-100/80">
                  <ArrowRight className="h-3 w-3 text-lime-neon" /> Webhook: {n8nStatus}
                </p>
              </div>
            </div>

            {showDetails && (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                {result.tools_executed.map((tool, idx) => (
                  <div key={`${tool.tool_name}-${idx}`} className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lime-neon">{tool.tool_name}</span>
                      <span className="font-mono text-[10px] text-emerald-200/60">
                        args: {JSON.stringify(tool.arguments)}
                      </span>
                    </div>
                    <pre className="mt-1.5 max-h-36 overflow-auto text-[11px] text-emerald-100/85">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
