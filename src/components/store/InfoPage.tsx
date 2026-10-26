import type { ReactNode } from "react";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 leading-relaxed shadow-card sm:p-10">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
