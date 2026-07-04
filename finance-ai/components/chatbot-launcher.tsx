"use client";

import { usePathname } from "next/navigation";
import { Bot, ChevronDown, MessageSquareText, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const hiddenRoutes = ["/login", "/register"];

export function ChatbotLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (hiddenRoutes.includes(pathname)) {
    return null;
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
                  <CardDescription>
                    Skeleton UI for the future assistant. API wiring is intentionally left empty for now.
                  </CardDescription>
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

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Coming soon</Badge>
                <Badge variant="outline">No API token</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
              <div className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/40 p-3">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <MessageSquareText className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Assistant skeleton</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This panel is ready for a future chatbot connection. For now it only shows the UI shell and
                      placeholder state.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Input value="" readOnly disabled placeholder="Ask about spending, budgets, or trends..." />
                <Textarea
                  value=""
                  readOnly
                  disabled
                  className="resize-none"
                  placeholder="Chat input will be enabled when the API is connected."
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  The send action is disabled until the assistant service is wired up.
                </p>
                <Button type="button" disabled className="rounded-full">
                  Send
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
