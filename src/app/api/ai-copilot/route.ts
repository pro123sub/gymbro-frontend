import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function resolveBackendUrl(overrideUrl?: string): string {
  return (overrideUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  const overrideUrl = req.nextUrl.searchParams.get("api_base_url") || undefined;
  const backendUrl = resolveBackendUrl(overrideUrl);

  try {
    const res = await fetch(`${backendUrl}/api/v1/automations/n8n/env-checklist`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const checklist = (await res.json()) as {
      ai_agent_and_nextjs?: { LLM_API_KEY?: boolean; LLM_MODEL?: string };
    };
    return NextResponse.json({
      openai_configured: Boolean(checklist.ai_agent_and_nextjs?.LLM_API_KEY),
      openai_model: checklist.ai_agent_and_nextjs?.LLM_MODEL || "gpt-4o-mini",
      api_base_url: backendUrl,
      n8n_base_url: "",
      google_sheet_id: "",
      studio_name: "Crush Lifestyle Fitness Studio",
      tenant_id: "crush-main-studio",
    });
  } catch {
    return NextResponse.json({
      openai_configured: false,
      openai_model: "gpt-4o-mini",
      api_base_url: backendUrl,
      n8n_base_url: "",
      google_sheet_id: "",
      studio_name: "Crush Lifestyle Fitness Studio",
      tenant_id: "crush-main-studio",
    });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    action?: "chat" | "executive_brief";
    message?: string;
    actor_role?: string;
    actor_phone?: string;
    sync_to_n8n?: boolean;
    api_base_url?: string;
    tenant_id?: string;
    api_key?: string;
    studio_snapshot?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON request body." }, { status: 400 });
  }

  const targetBackend = resolveBackendUrl(body.api_base_url);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-ID": (body.tenant_id || "crush-main-studio").trim(),
    "X-Request-ID": `req-copilot-${Date.now().toString(36)}`,
  };
  if (body.api_key?.trim()) {
    headers["X-API-Key"] = body.api_key.trim();
  }

  if (body.action === "executive_brief") {
    const promptMessage =
      "Run full gym autopilot: summarize active members, retention follow-ups, pending receivables, and CFO P&L profit actions.";
    try {
      const agentRes = await fetch(`${targetBackend}/api/v1/agent/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: promptMessage,
          actor_role: "owner",
          sync_to_n8n: false,
        }),
        cache: "no-store",
      });
      if (agentRes.ok) {
        const agentJson = (await agentRes.json()) as { reply?: string; intent?: string };
        return NextResponse.json({
          brief: agentJson.reply || "Autopilot summary generated.",
          model: agentJson.intent === "LLM_DIRECT" || agentJson.intent ? "backend-openai" : "backend-agent",
          openai_used: true,
        });
      }
    } catch {
      // Fall through cleanly if backend is unreachable
    }
    return NextResponse.json(
      { detail: `Could not reach FastAPI backend at ${targetBackend} for AI executive brief.` },
      { status: 502 }
    );
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ detail: "Prompt message cannot be empty." }, { status: 400 });
  }

  try {
    const fastApiRes = await fetch(`${targetBackend}/api/v1/agent/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        actor_role: body.actor_role || "owner",
        actor_phone: body.actor_phone || "",
        sync_to_n8n: Boolean(body.sync_to_n8n),
      }),
      cache: "no-store",
    });

    const rawText = await fastApiRes.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      parsed = { detail: rawText };
    }

    if (!fastApiRes.ok) {
      return NextResponse.json(
        { detail: typeof parsed.detail === "string" ? parsed.detail : `Backend error ${fastApiRes.status}` },
        { status: fastApiRes.status }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      {
        detail: `Could not reach FastAPI backend at ${targetBackend}: ${err instanceof Error ? err.message : "Network error"}`,
      },
      { status: 502 }
    );
  }
}
