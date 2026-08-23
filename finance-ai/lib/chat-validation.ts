export const MAX_CHAT_MESSAGE_LENGTH = 2_000;
export const MAX_CHAT_DATE_SPAN_DAYS = 366;

export type ChatRequest = {
  message: string;
  startDate: string;
  endDate: string;
};

type ValidationResult =
  | { success: true; data: ChatRequest }
  | { success: false; error: string };

function parseDate(value: unknown): { value: string; time: number } | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day);
  const parsed = new Date(time);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return { value, time };
}

export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, error: "Invalid request body." };
  }

  const input = body as Record<string, unknown>;
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (!message || message.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must be between 1 and ${MAX_CHAT_MESSAGE_LENGTH} characters.`,
    };
  }

  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);
  if (!start || !end) {
    return { success: false, error: "Dates must use YYYY-MM-DD format." };
  }

  const spanDays = Math.floor((end.time - start.time) / 86_400_000) + 1;
  if (spanDays < 1 || spanDays > MAX_CHAT_DATE_SPAN_DAYS) {
    return {
      success: false,
      error: `Date range must be between 1 and ${MAX_CHAT_DATE_SPAN_DAYS} days.`,
    };
  }

  return {
    success: true,
    data: { message, startDate: start.value, endDate: end.value },
  };
}
