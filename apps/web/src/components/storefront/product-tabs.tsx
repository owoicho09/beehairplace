"use client";

import { useState } from "react";

export type ProductTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  if (!active) return null;

  return (
    <div>
      <div role="tablist" className="flex gap-8 border-b border-store-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={tab.id === active.id}
            onClick={() => setActiveId(tab.id)}
            className={`-mb-px border-b-2 pb-3 text-xs font-medium uppercase tracking-wide transition-colors ${
              tab.id === active.id
                ? "border-brand text-store-ink"
                : "border-transparent text-store-muted hover:text-store-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="pt-6 text-sm leading-relaxed text-store-muted"
      >
        {active.content}
      </div>
    </div>
  );
}
