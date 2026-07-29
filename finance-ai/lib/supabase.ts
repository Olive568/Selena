import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. Check your .env.local file.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.assign("/login");
    }
  });
}

export function sanitizeError(message: string): string {
  if (message.includes("JWT") || message.includes("session") || message.includes("auth")) {
    return "Session expired. Please sign in again.";
  }
  if (message.includes("duplicate key") || message.includes("unique constraint")) {
    return "This record already exists.";
  }
  return message;
}

export function redirectIfAuthError(error: unknown): void {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("jwt") || msg.includes("session") || msg.includes("auth")) {
      window.location.assign("/login");
    }
  }
}
