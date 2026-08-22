import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const GROQ_MODEL =
  process.env.GROQ_MODEL ?? "qwen/qwen3.6-27b";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`chat:${user.id}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { message, startDate, endDate } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
  }

  const transactionsQuery = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  const { data: transactions, error: txError } = await transactionsQuery;

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("Groq API key is not configured");
    return NextResponse.json({ error: "AI service is not configured." }, { status: 500 });
  }

  const systemPrompt = `You are a personal finance assistant. The user has asked you about their transactions.

Here is their transaction data (in JSON format):
${JSON.stringify(transactions ?? [], null, 2)}

Date range: ${startDate} to ${endDate}

Answer questions about their spending, income, categories, merchants, or any other financial insights based on this data. Be concise and helpful. If the data is empty for the period, let them know.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let groqResponse;
  try {
    groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        reasoning_effort: "none",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "AI request timed out. Please try again." }, { status: 504 });
    }
    console.error("Groq API request failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      model: GROQ_MODEL,
    });
    return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 502 });
  }
  clearTimeout(timeoutId);

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    console.error("Groq API error", {
      status: groqResponse.status,
      statusText: groqResponse.statusText,
      model: GROQ_MODEL,
      response: errorText.slice(0, 1000),
    });
    return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 502 });
  }

  const data = await groqResponse.json();
  const reply = data.choices?.[0]?.message?.content ?? "No response from AI.";

  return NextResponse.json({ reply });
}
