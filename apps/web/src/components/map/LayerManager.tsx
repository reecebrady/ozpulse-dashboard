/**
 * LayerManager: Central registry for map layers.
 * Each layer agent registers its GeoJSON, tiles, markers, etc. here.
 * The map component consumes this to render overlays.
 */
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface LayerOverlay {
  id: string;
  type: "geojson" | "tiles" | "markers" | "heatmap";
  data: unknown;
  visible: boolean;
  zIndex: number;
}

interface LayerManagerContextType {
  overlays: Map<string, LayerOverlay>;
  registerOverlay: (overlay: LayerOverlay) => void;
  removeOverlay: (id: string) => void;
  toggleOverlay: (id: string) => void;
}

const LayerManagerContext = createContext<LayerManagerContextType | null>(null);

export function LayerManagerProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<Map<string, LayerOverlay>>(new Map());

  const registerOverlay = useCallback((overlay: LayerOverlay) => {
    setOverlays((prev) => {
      const next = new Map(prev);
      next.set(overlay.id, overlay);
      return next;
    });
  }, []);

  const removeOverlay = useCallback((id: string) => {
    setOverlays((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleOverlay = useCallback((id: string) => {
    setOverlays((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        next.set(id, { ...existing, visible: !existing.visible });
      }
      return next;
    });
  }, []);

  return (
    <LayerManagerContext.Provider value={{ overlays, registerOverlay, removeOverlay, toggleOverlay }}>
      {children}
    </LayerManagerContext.Provider>
  );
}

export function useLayerManager() {
  const ctx = useContext(LayerManagerContext);
  if (!ctx) throw new Error("useLayerManager must be used within LayerManagerProvider");
  return ctx;
}
