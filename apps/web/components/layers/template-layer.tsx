"use client";

import { useEffect } from "react";
import type { LayerId } from "@ozpulse/shared";

/**
 * TEMPLATE LAYER COMPONENT
 * Copy this file and rename for your specific layer.
 * Each layer is lazy-loaded via React.lazy() in the main map view.
 *
 * Steps:
 * 1. Copy this file to your-layer-name.tsx
 * 2. Rename the component and update LAYER_ID
 * 3. Add your TanStack Query hooks for data fetching
 * 4. Register your map sources/layers via the LayerManager
 * 5. Return any UI overlays (legends, popups) as JSX
 */

const LAYER_ID: LayerId = "power-energy"; // Change to your layer ID

interface TemplateLayerProps {
  visible: boolean;
  userPostcode?: string;
}

export default function TemplateLayer({ visible, userPostcode }: TemplateLayerProps) {
  useEffect(() => {
    if (!visible) return;

    // Register your map layers here using the LayerManager
    // Example:
    // layerManager.register({
    //   id: LAYER_ID,
    //   visible: true,
    //   addToMap: (map) => { /* add sources and layers */ },
    //   removeFromMap: (map) => { /* remove sources and layers */ },
    // });

    return () => {
      // Cleanup: unregister layers
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Layer-specific UI overlays (legends, info panels) go here */}
    </div>
  );
}
