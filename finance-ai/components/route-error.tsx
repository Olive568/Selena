"use client";

import { Button } from "@/components/ui/button";

type RouteErrorProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function RouteError({ title, description, reset }: RouteErrorProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-foreground">
      <div role="alert" className="w-full max-w-lg space-y-4 rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button type="button" onClick={reset} className="rounded-full">
          Try again
        </Button>
      </div>
    </main>
  );
}
