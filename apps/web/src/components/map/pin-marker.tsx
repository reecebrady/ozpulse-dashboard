"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { useMapContext } from "@/hooks/use-map";

// --- Pin type definitions ---

export type PinType =
  | "generator"
  | "mine"
  | "project"
  | "property"
  | "school"
  | "hospital"
  | "home"
  | "work"
  | "custom";

const PIN_COLORS: Record<PinType, string> = {
  generator: "#eab308",
  mine: "#a855f7",
  project: "#f97316",
  property: "#22c55e",
  school: "#3b82f6",
  hospital: "#ec4899",
  home: "#06b6d4",
  work: "#8b5cf6",
  custom: "#94a3b8",
};

const PIN_ICONS: Record<PinType, string> = {
  generator: "⚡",
  mine: "⛏",
  project: "🏗",
  property: "🏠",
  school: "🎓",
  hospital: "🏥",
  home: "📍",
  work: "💼",
  custom: "📌",
};

// --- Interfaces ---

export interface PinMarkerData {
  id: string;
  lng: number;
  lat: number;
  type: PinType;
  label?: string;
  color?: string;
  tooltip?: {
    title: string;
    stats?: Array<{ label: string; value: string }>;
  };
  metadata?: Record<string, unknown>;
}

interface PinMarkerProps {
  pins: PinMarkerData[];
  onPinClick?: (pin: PinMarkerData) => void;
}

/**
 * PinMarker -- renders custom HTML markers on the map.
 * Color-coded by type, with hover tooltips and click handling.
 */
export function PinMarkers({ pins, onPinClick }: PinMarkerProps) {
  const { getMap, ready } = useMapContext();
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const createMarkerElement = useCallback(
    (pin: PinMarkerData): HTMLDivElement => {
      const el = document.createElement("div");
      const color = pin.color ?? PIN_COLORS[pin.type] ?? PIN_COLORS.custom;
      const icon = PIN_ICONS[pin.type] ?? PIN_ICONS.custom;

      el.className = "ozpulse-pin-marker";
      el.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background: ${color};
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      border: 2px solid rgba(255,255,255,0.9);
      transition: transform 0.15s ease;
    `;

      const inner = document.createElement("span");
      inner.style.cssText = `
      transform: rotate(45deg);
      font-size: 13px;
      line-height: 1;
    `;
      inner.textContent = icon;
      el.appendChild(inner);

      // Hover tooltip
      if (pin.tooltip) {
        el.addEventListener("mouseenter", () => {
          el.style.transform = "rotate(-45deg) scale(1.2)";
          el.style.zIndex = "10";
          showTooltip(pin);
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "rotate(-45deg) scale(1)";
          el.style.zIndex = "";
          hideTooltip();
        });
      }

      // Click handler
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onPinClick?.(pin);
      });

      return el;
    },
    [onPinClick]
  );

  const showTooltip = useCallback(
    (pin: PinMarkerData) => {
      const map = getMap();
      if (!map || !pin.tooltip) return;

      hideTooltip();

      let html = `<div style="font-family:system-ui;font-size:12px;max-width:220px;">`;
      html += `<div style="font-weight:600;margin-bottom:4px;">${pin.tooltip.title}</div>`;
      if (pin.tooltip.stats) {
        for (const stat of pin.tooltip.stats) {
          html += `<div style="display:flex;justify-content:space-between;gap:12px;">`;
          html += `<span style="color:#94a3b8;">${stat.label}</span>`;
          html += `<span style="font-weight:500;">${stat.value}</span>`;
          html += `</div>`;
        }
      }
      if (pin.label) {
        html += `<div style="color:#64748b;margin-top:4px;font-size:11px;">${pin.label}</div>`;
      }
      html += `</div>`;

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 20,
        className: "ozpulse-pin-tooltip",
      })
        .setLngLat([pin.lng, pin.lat])
        .setHTML(html)
        .addTo(map);

      popupRef.current = popup;
    },
    [getMap]
  );

  const hideTooltip = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  // Sync markers to map
  useEffect(() => {
    const map = getMap();
    if (!map || !ready) return;

    const currentMarkers = markersRef.current;
    const newPinIds = new Set(pins.map((p) => p.id));

    // Remove markers that are no longer in the pins list
    for (const [id, marker] of currentMarkers) {
      if (!newPinIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Add or update markers
    for (const pin of pins) {
      const existing = currentMarkers.get(pin.id);
      if (existing) {
        // Update position if changed
        existing.setLngLat([pin.lng, pin.lat]);
      } else {
        // Create new marker
        const el = createMarkerElement(pin);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);
        currentMarkers.set(pin.id, marker);
      }
    }

    return () => {
      // Cleanup all markers on unmount
      for (const marker of currentMarkers.values()) {
        marker.remove();
      }
      currentMarkers.clear();
      hideTooltip();
    };
  }, [pins, ready, getMap, createMarkerElement, hideTooltip]);

  // This component renders markers imperatively, no DOM output needed
  return null;
}

/**
 * Utility to create a single marker directly on a map instance (non-React usage).
 */
export function addPinToMap(
  map: maplibregl.Map,
  pin: PinMarkerData,
  onClick?: (pin: PinMarkerData) => void
): maplibregl.Marker {
  const color = pin.color ?? PIN_COLORS[pin.type] ?? PIN_COLORS.custom;
  const icon = PIN_ICONS[pin.type] ?? PIN_ICONS.custom;

  const el = document.createElement("div");
  el.style.cssText = `
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    background: ${color};
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    border: 2px solid rgba(255,255,255,0.9);
  `;

  const inner = document.createElement("span");
  inner.style.cssText = `transform: rotate(45deg); font-size: 13px; line-height: 1;`;
  inner.textContent = icon;
  el.appendChild(inner);

  if (onClick) {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(pin);
    });
  }

  return new maplibregl.Marker({ element: el })
    .setLngLat([pin.lng, pin.lat])
    .addTo(map);
}
