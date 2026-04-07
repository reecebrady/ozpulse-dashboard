"use client";

export function AlertFeed() {
  return (
    <div className="flex h-10 items-center border-t border-border bg-card px-4">
      <span className="text-xs text-muted-foreground">
        No alerts -- configure your postcode to receive personalised notifications
      </span>
    </div>
  );
}
