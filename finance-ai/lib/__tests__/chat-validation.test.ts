import { describe, expect, it } from "vitest";

import { validateChatRequest } from "@/lib/chat-validation";

describe("validateChatRequest", () => {
  it("accepts a bounded valid request", () => {
    expect(validateChatRequest({
      message: "Where did my money go?",
      startDate: "2026-08-01",
      endDate: "2026-08-24",
    })).toMatchObject({ success: true });
  });

  it.each([
    null,
    [],
    { message: "", startDate: "2026-08-01", endDate: "2026-08-24" },
    { message: "test", startDate: "2026-02-30", endDate: "2026-03-01" },
    { message: "test", startDate: "2026-08-24", endDate: "2026-08-01" },
    { message: "test", startDate: "2025-01-01", endDate: "2026-08-24" },
  ])("rejects malformed or unsafe input", (body) => {
    expect(validateChatRequest(body)).toMatchObject({ success: false });
  });
});
