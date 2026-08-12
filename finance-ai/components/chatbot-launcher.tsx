"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Loader2, Minus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SelenaIcon } from "@/components/selena-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const hiddenRoutes = ["/", "/sign-in", "/sign-up", "/login", "/register"];

const suggestionPrompts = [
  "How much did I spend this month?",
  "Where is most of my money going?",
  "Show me my recent expenses",
  "How much income did I receive?",
  "What are my biggest expenses?",
];

const MAX_COMPOSER_HEIGHT = 144;

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

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT)}px`;
  }, [input]);

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  async function handleSend(prompt?: string) {
    const trimmed = (prompt ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    lastSentRef.current = trimmed;
    setIsLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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

  async function handleRetry() {
    const trimmed = lastSentRef.current;
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);

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

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="selena-chat-panel"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed inset-x-0 bottom-0 z-50 origin-bottom-right sm:inset-x-auto sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-6"
          >
            <div
              className={cn(
                "flex h-dvh w-full flex-col overflow-hidden bg-card/95 text-foreground backdrop-blur-md",
                "pt-[env(safe-area-inset-top)] sm:pt-0",
                "sm:h-[80vh] sm:w-[70vw] sm:max-w-[680px] sm:rounded-3xl sm:border sm:border-border sm:shadow-2xl sm:shadow-black/15",
                "lg:h-[min(85vh,850px)] lg:w-[min(50vw,720px)] lg:min-w-[500px] lg:rounded-[2rem]"
              )}
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <SelenaIcon className="h-full w-full" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-lg font-semibold tracking-tight">Selena</p>
                    <p className="truncate text-sm text-muted-foreground">Your personal finance assistant</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    onClick={() => setIsOpen(false)}
                    aria-label="Minimize chat"
                    title="Minimize chat"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    title="Close chat"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </header>

              <div className="shrink-0 border-b border-border">
                <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2 text-base">
                    <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">
                      {formatDateLabel(startDate)} <span className="text-muted-foreground">→</span>{" "}
                      {formatDateLabel(endDate)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 rounded-full px-3 text-xs"
                    onClick={() => setShowDatePicker((current) => !current)}
                  >
                    {showDatePicker ? "Done" : "Change"}
                  </Button>
                </div>

                {showDatePicker && (
                  <div className="grid grid-cols-2 gap-3 px-4 pb-3 sm:px-5">
                    <div className="grid gap-1">
                      <Label htmlFor="chat-start" className="text-sm text-muted-foreground">
                        From
                      </Label>
                      <Input
                        id="chat-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="chat-end" className="text-sm text-muted-foreground">
                        To
                      </Label>
                      <Input
                        id="chat-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
                {messages.length === 0 && !error ? (
                  <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                    <span className="flex size-14 items-center justify-center overflow-hidden rounded-2xl">
                      <SelenaIcon className="h-full w-full" />
                    </span>

                    <div className="space-y-1.5">
                      <h2 className="font-heading text-3xl font-semibold tracking-tight">Ask Selena</h2>
                      <p className="text-base font-medium text-foreground">Your personal finance assistant</p>
                      <p className="mx-auto max-w-sm text-base leading-7 text-muted-foreground">
                        Ask about your spending, income, transactions, or financial habits.
                      </p>
                    </div>

                    <div className="grid w-full max-w-md gap-2">
                      {suggestionPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void handleSend(prompt)}
                          className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-base text-foreground transition-colors hover:border-primary/30 hover:bg-muted"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {messages.map((msg, index) =>
                      msg.role === "user" ? (
                        <div key={index} className="flex justify-end">
                          <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-base leading-7 text-primary-foreground sm:max-w-[75%]">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={index} className="flex items-start gap-3">
                          <span className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                            <SelenaIcon className="h-full w-full" />
                          </span>
                          <div className="min-w-0 flex-1 whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-muted/30 px-4 py-3 text-base leading-7 text-foreground">
                            {msg.content}
                          </div>
                        </div>
                      )
                    )}

                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                          <SelenaIcon className="h-full w-full" />
                        </span>
                        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                          <SelenaIcon className="h-full w-full" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 rounded-full"
                            onClick={() => void handleRetry()}
                            disabled={isLoading}
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-4">
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Selena about your finances..."
                    disabled={isLoading}
                    rows={1}
                    className="min-h-0 max-h-[9rem] flex-1 resize-none border-0 bg-transparent px-0 py-1.5 text-base leading-7 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 sm:text-lg"
                  />
                  <Button
                    type="button"
                    size="icon-lg"
                    className="mb-0.5 shrink-0 rounded-full"
                    onClick={() => void handleSend()}
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 rounded-full px-5 text-lg shadow-lg shadow-black/20 lg:bottom-6 lg:right-6 lg:h-14 lg:px-6 lg:text-xl"
        >
          <SelenaIcon className="mr-2 size-5 lg:size-6" />
          Selena Chat
        </Button>
      )}
    </>
  );
}
