"use client";

import React, { useState } from "react";
import { Sparkles, Send, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { AgentChatResponse, gymApi } from "@/lib/api";

interface PromptCommandBarProps {
  onActionCompleted: () => Promise<void> | void;
}

const QUICK_PROMPTS = [
  {
    label: "Register Member",
    prompt: "Register Rahul Verma phone 9876543210 quarterly paid 4000",
  },
  {
    label: "Email Follow-Ups (GM-02)",
    prompt: "Evaluate and send due email follow-ups",
  },
  {
    label: "Run Daily Autopilot",
    prompt: "Run full gym autopilot",
  },
  {
    label: "CFO P&L & Pending Dues",
    prompt: "Show accounts P&L and pending dues summary",
  },
  {
    label: "Record Electricity Expense",
    prompt: "Record electricity expense Rs 3500",
  },
  {
    label: "Streak Leaderboard",
    prompt: "Show workout streak leaderboard",
  },
];

export default function PromptCommandBar({ onActionCompleted }: PromptCommandBarProps) {
  const [prompt, setPrompt] = useState("");
  const [syncN8n, setSyncN8n] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentChatResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function executePrompt(textToRun?: string) {
    const query = (textToRun ?? prompt).trim();
    if (!query || running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await gymApi.sendAgentPrompt(query, "owner", syncN8n);
      setResult(res);
      setShowDetails(true);
      if (!textToRun) setPrompt("");
      await onActionCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run prompt against FastAPI agent.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest text-lime-neon">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              AI Gym Manager Command Bar{" "}
              <span className="ml-1.5 rounded-full bg-[#eef7e6] px-2 py-0.5 text-[11px] font-medium text-forest-accent">
                n8n GM-05 + Google Sheets
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Register members, check in, freeze plans, record expenses, or trigger email follow-ups with one natural prompt.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={syncN8n}
            onChange={(e) => setSyncN8n(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-forest-accent"
          />
          Forward run to n8n GM-05 Webhook
        </label>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void executePrompt();
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Try: "Register Ankit Sen phone 9876509876 yearly paid 13500" or "Run full gym autopilot"'
          className="flex-1 rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-forest-accent focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={running || !prompt.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-neon px-5 py-2.5 text-sm font-semibold text-forest transition hover:brightness-95 disabled:opacity-50"
        >
          {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {running ? "Executing..." : "Run Prompt"}
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mr-1">Quick Prompts:</span>
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={running}
            onClick={() => {
              setPrompt(item.prompt);
              void executePrompt(item.prompt);
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-forest-accent/40 hover:bg-[#eef7e6] hover:text-forest"
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-[#f0f7f3] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-forest-accent" />
              <span className="rounded-full bg-forest px-2 py-0.5 text-[11px] font-semibold text-lime-neon">
                {result.intent}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Run {result.run_id} · {result.timestamp_ist}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-forest-accent hover:underline"
            >
              <Terminal className="h-3.5 w-3.5" />
              Tools ({result.tools_executed.length})
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">{result.reply}</p>

          {showDetails && result.tools_executed.length > 0 && (
            <div className="mt-2.5 space-y-1.5 border-t border-emerald-200/80 pt-2">
              {result.tools_executed.map((tool, idx) => (
                <div key={`${tool.tool_name}-${idx}`} className="rounded-lg bg-white/80 p-2 text-xs">
                  <div className="font-mono font-semibold text-forest-accent">{tool.tool_name}</div>
                  <pre className="mt-1 max-h-28 overflow-auto text-[11px] text-slate-600">
                    {JSON.stringify(tool.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
