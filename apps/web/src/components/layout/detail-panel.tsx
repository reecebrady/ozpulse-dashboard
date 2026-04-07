"use client";

interface DetailPanelProps {
  feature: unknown;
  onClose: () => void;
}

export function DetailPanel({ feature, onClose }: DetailPanelProps) {
  return (
    <div className="absolute right-0 top-0 z-10 h-full w-96 border-l border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Details</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          x
        </button>
      </div>
      <div className="overflow-y-auto p-4">
        <pre className="text-xs text-muted-foreground">
          {JSON.stringify(feature, null, 2)}
        </pre>
      </div>
    </div>
  );
}
