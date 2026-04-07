"use client";

import { useEffect, useRef } from "react";
import type { LayerId } from "@ozpulse/shared";

interface MapContainerProps {
  activeLayers: Set<LayerId>;
  onFeatureClick: (feature: unknown) => void;
}

export function MapContainer({ activeLayers, onFeatureClick }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // MapLibre GL JS will be initialised here by Agent 3
    // Placeholder: show a static map background
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-full w-full bg-[#0d1117]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 60%, #1a2332 0%, #0d1117 70%)",
      }}
    >
      {/* Map renders here */}
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            OzPulse Map
          </p>
          <p className="text-sm text-muted-foreground/60">
            MapLibre GL JS initialising...
          </p>
          {activeLayers.size > 0 && (
            <p className="mt-2 text-xs text-primary">
              {activeLayers.size} layer{activeLayers.size > 1 ? "s" : ""} active
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
