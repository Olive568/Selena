import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
  }

  const systemPrompt = `You are a personal finance assistant. The user has asked you about their transactions.

Here is their transaction data (in JSON format):
${JSON.stringify(transactions ?? [], null, 2)}

Date range: ${startDate} to ${endDate}

Answer questions about their spending, income, categories, merchants, or any other financial insights based on this data. Be concise and helpful. If the data is empty for the period, let them know.`;

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
  });

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    return NextResponse.json({ error: `Groq API error: ${errorText}` }, { status: 502 });
  }

  const data = await groqResponse.json();
  const reply = data.choices?.[0]?.message?.content ?? "No response from AI.";

  return NextResponse.json({ reply });
}
