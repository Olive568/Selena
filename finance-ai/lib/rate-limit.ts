import type { SupabaseClient } from "@supabase/supabase-js";

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

export async function checkRateLimit(
  supabase: SupabaseClient,
  bucket: "chat" | "delete-account"
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_bucket: bucket,
  });

  if (error || !data || typeof data !== "object") {
    throw new Error("Shared rate limiter is unavailable.");
  }

  const result = data as Partial<RateLimitResult>;
  if (typeof result.allowed !== "boolean" || typeof result.retryAfter !== "number") {
    throw new Error("Shared rate limiter returned an invalid response.");
  }

  return { allowed: result.allowed, retryAfter: Math.max(1, Math.ceil(result.retryAfter)) };
}
