"use client";

import type { TestimonySummary } from "@ozpulse/shared";

interface TestimonyPanelProps {
  testimonies: TestimonySummary[];
}

const SENTIMENT_COLORS = {
  positive: "text-green-600 bg-green-50",
  neutral: "text-yellow-600 bg-yellow-50",
  negative: "text-red-600 bg-red-50",
} as const;

export function TestimonyPanel({ testimonies }: TestimonyPanelProps) {
  if (!testimonies.length) {
    return (
      <p className="text-xs text-muted-foreground">
        No community feedback available for this area.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Community Sentiment</h4>
      {testimonies.map((t, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
              {t.suburb} ({t.postcode})
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SENTIMENT_COLORS[t.sentiment]}`}
            >
              {t.sentiment}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {t.themes.map((theme) => (
              <span
                key={theme}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {theme}
              </span>
            ))}
          </div>

          {t.sampleQuotes.length > 0 && (
            <div className="mt-2 space-y-1">
              {t.sampleQuotes.map((quote, qi) => (
                <p
                  key={qi}
                  className="border-l-2 border-border pl-2 text-xs italic text-muted-foreground"
                >
                  &ldquo;{quote}&rdquo;
                </p>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Based on {t.sourcesCount} sources
          </p>
        </div>
      ))}
    </div>
  );
}
