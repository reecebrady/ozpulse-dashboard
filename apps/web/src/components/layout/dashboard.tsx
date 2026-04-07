"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { DetailPanel } from "./detail-panel";
import { AlertFeed } from "./alert-feed";
import { MapContainer } from "../map/map-container";
import type { LayerId } from "@ozpulse/shared";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(new Set());
  const [selectedFeature, setSelectedFeature] = useState<unknown>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  function toggleLayer(layerId: LayerId) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }

  function handleFeatureClick(feature: unknown) {
    setSelectedFeature(feature);
    setDetailPanelOpen(true);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
      />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <div className="relative flex-1">
          <MapContainer
            activeLayers={activeLayers}
            onFeatureClick={handleFeatureClick}
          />
          {detailPanelOpen && selectedFeature && (
            <DetailPanel
              feature={selectedFeature}
              onClose={() => setDetailPanelOpen(false)}
            />
          )}
        </div>
        <AlertFeed />
      </div>
    </div>
  );
}
