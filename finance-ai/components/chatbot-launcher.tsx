"use client";

import { usePathname } from "next/navigation";
import { Bot, ChevronDown, Loader2, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const hiddenRoutes = ["/login", "/register"];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthStart() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatbotLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [startDate, setStartDate] = useState(getMonthStart);
  const [endDate, setEndDate] = useState(getToday);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    lastSentRef.current = trimmed;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, startDate, endDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get response");
      }

      const assistantMessage: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-3">
        {isOpen && (
          <Card className="w-[calc(100vw-2rem)] max-w-sm border-border bg-card/95 shadow-2xl shadow-black/20 backdrop-blur sm:w-[22rem]">
            <CardHeader className="space-y-3 border-b border-border pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bot className="size-4 text-primary" />
                    <CardTitle className="text-base">Finance Chat</CardTitle>
                  </div>
                  <CardDescription>Ask about your transactions within a date range.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="chat-start" className="text-xs text-muted-foreground">From</Label>
                  <Input
                    id="chat-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="chat-end" className="text-xs text-muted-foreground">To</Label>
                  <Input
                    id="chat-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
              {messages.length === 0 && !error && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
                  Ask about your spending, income, or any transaction within the selected dates.
                </div>
              )}

              {messages.length > 0 && (
                <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl px-3 py-2 text-sm leading-6 ${
                        msg.role === "user"
                          ? "ml-8 bg-primary/10 text-foreground"
                          : "mr-8 border border-border bg-muted/40 text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setError(null);
                      setIsLoading(true);
                      const trimmed = lastSentRef.current;
                      if (!trimmed) return;
                      try {
                        const res = await fetch("/api/chat", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ message: trimmed, startDate, endDate }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error ?? "Failed to get response");
                        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Something went wrong");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    Retry
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances..."
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="h-12 rounded-full px-5 shadow-lg shadow-black/20"
        >
          <Bot className="mr-2 size-4" />
          {isOpen ? "Close chat" : "Chat"}
          <ChevronDown className={`ml-2 size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </>
  );
}
