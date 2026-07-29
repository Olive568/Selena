import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }
    entry.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 });
  }
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
    return NextResponse.json({ error: "GROQ_API_KEY is not configured. Check your .env.local file." }, { status: 500 });
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
        model: "llama-3.3-70b-versatile",
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
    throw err;
  }
  clearTimeout(timeoutId);

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    console.error("Groq API error:", errorText);
    return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 502 });
  }

  const data = await groqResponse.json();
  const reply = data.choices?.[0]?.message?.content ?? "No response from AI.";

  return NextResponse.json({ reply });
}
