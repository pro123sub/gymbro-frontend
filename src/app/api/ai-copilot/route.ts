import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getOpenAiConfig() {
  return {
    apiKey: (process.env.OPENAI_API_KEY || "").trim(),
    model: (process.env.OPENAI_MODEL || "gpt-4o-mini").trim(),
    backendUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, ""),
    n8nBaseUrl: (process.env.NEXT_PUBLIC_N8N_BASE_URL || "https://n8n-production-d690f344.up.railway.app").replace(/\/+$/, ""),
    googleSheetId: (process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "").trim(),
    studioName: (process.env.NEXT_PUBLIC_STUDIO_NAME || "Crush Lifestyle Fitness Studio").trim(),
    tenantId: (process.env.NEXT_PUBLIC_TENANT_ID || "crush-main-studio").trim(),
  };
}

export async function GET() {
  const cfg = getOpenAiConfig();
  return NextResponse.json({
    openai_configured: Boolean(cfg.apiKey),
    openai_model: cfg.model,
    api_base_url: cfg.backendUrl,
    n8n_base_url: cfg.n8nBaseUrl,
    google_sheet_id: cfg.googleSheetId,
    studio_name: cfg.studioName,
    tenant_id: cfg.tenantId,
  });
}

async function callOpenAiDirect(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 450,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const cfg = getOpenAiConfig();
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

  // Executive AI Brief mode powered directly by OpenAI gpt-4o-mini using live studio KPIs
  if (body.action === "executive_brief") {
    const snapshot = body.studio_snapshot || {};
    const briefPrompt = `Analyze this live gym state for ${cfg.studioName} (India, INR, IST) and return 3 concise, high-impact action bullets:\n${JSON.stringify(snapshot, null, 2)}`;
    const brief = await callOpenAiDirect(
      cfg.apiKey,
      cfg.model,
      "You are a sharp Gym Growth & CFO Strategist for an Indian fitness studio chain. Give crisp, actionable bullets referencing exact INR numbers and member counts.",
      briefPrompt
    );
    if (!brief) {
      return NextResponse.json(
        {
          brief:
            "• Run GM-02 Email Follow-Up Cadence to recover pending dues and expiring T-3 memberships.\n• Trigger GM-01 + Check-ins to boost 7-day consistency streaks.\n• Review CFO P&L in Reports & Analytics after clearing overdue receivables.",
          model: "fallback-deterministic",
          openai_used: false,
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ brief, model: cfg.model, openai_used: true });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ detail: "Prompt message cannot be empty." }, { status: 400 });
  }

  const targetBackend = (body.api_base_url || cfg.backendUrl).replace(/\/+$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-ID": (body.tenant_id || cfg.tenantId).trim(),
    "X-Request-ID": `req-copilot-${Date.now().toString(36)}`,
  };
  if (body.api_key?.trim()) {
    headers["X-API-Key"] = body.api_key.trim();
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

    return NextResponse.json({
      ...parsed,
      openai_configured: Boolean(cfg.apiKey),
      openai_model: cfg.model,
      copilot_source: "fastapi_agent",
    });
  } catch (err) {
    // Fallback advisory response using OpenAI if FastAPI server isn't reachable yet
    const advice = await callOpenAiDirect(
      cfg.apiKey,
      cfg.model,
      `You are the GYMFLOW AI Copilot for ${cfg.studioName}. The FastAPI backend (${targetBackend}) could not be reached right now. Explain briefly what automation step you would execute and remind the admin to start FastAPI or check the API URL.`,
      message
    );
    return NextResponse.json(
      {
        detail:
          advice ||
          `Could not reach FastAPI backend at ${targetBackend}: ${err instanceof Error ? err.message : "Network error"}`,
      },
      { status: 502 }
    );
  }
}
