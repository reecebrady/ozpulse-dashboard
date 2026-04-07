/**
 * TEMPLATE: Copy this file to create a new map layer component.
 * Rename to match your layer (e.g., PowerEnergyLayer.tsx).
 *
 * Each layer component:
 * 1. Fetches its own data via TanStack Query
 * 2. Registers map overlays via the LayerManager context
 * 3. Renders sidebar/detail panel content when active
 * 4. Is lazy-loaded by the main app
 */
"use client";

import { useQuery } from "@tanstack/react-query";

interface LayerTemplateProps {
  enabled: boolean;
  userPostcode: string;
}

export default function LayerTemplate({ enabled, userPostcode }: LayerTemplateProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["layer-template", userPostcode],
    queryFn: async () => {
      // Replace with your API call
      return [];
    },
    enabled,
    refetchInterval: 60_000, // adjust per layer needs
  });

  if (!enabled) return null;
  if (isLoading) return <div className="p-2 text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-2 text-sm text-destructive">Error loading data</div>;

  return (
    <div className="p-2">
      {/* Render your layer's sidebar content, map overlays, etc. */}
      <p className="text-sm">Template layer active for postcode {userPostcode}</p>
    </div>
  );
}
