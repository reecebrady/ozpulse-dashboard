"use client";

import { useCallback } from "react";
import {
  Zap,
  Home,
  Shield,
  Users,
  Building2,
  Mountain,
  TreePine,
  GraduationCap,
  Landmark,
  TrendingDown,
  Car,
  Heart,
  Newspaper,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLayerStore } from "@/src/stores/layer-store";
import { useMapStore } from "@/src/stores/map-store";
import { Separator } from "@/src/components/ui/separator";
import { Tooltip } from "@/src/components/ui/tooltip";
import { Sheet, SheetContent } from "@/src/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Icon mapping from string names to Lucide components                */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Home,
  Shield,
  Users,
  Building: Building2,
  Building2,
  Mountain,
  TreePine,
  GraduationCap,
  Landmark,
  TrendingDown,
  Car,
  Heart,
  Newspaper,
  DollarSign,
};

/* ------------------------------------------------------------------ */
/*  Layer category groupings for the sidebar                           */
/* ------------------------------------------------------------------ */

const LAYER_GROUPS = [
  {
    label: "Power & Energy",
    ids: ["power-energy"],
  },
  {
    label: "Real Estate",
    ids: ["real-estate"],
  },
  {
    label: "Crime & Safety",
    ids: ["crime-safety"],
  },
  {
    label: "Immigration & Demographics",
    ids: ["immigration-demographics"],
  },
  {
    label: "Infrastructure",
    ids: ["infrastructure-industry", "infrastructure"],
  },
  {
    label: "Mining & Resources",
    ids: ["minerals-mining", "mining-resources"],
  },
  {
    label: "Leisure & Lifestyle",
    ids: ["leisure-lifestyle"],
  },
  {
    label: "Education & Health",
    ids: ["education", "health", "health-hospitals"],
  },
  {
    label: "Economy & Government",
    ids: ["economic-pressure", "government-performance", "personal-finance"],
  },
  {
    label: "Transport & Media",
    ids: ["traffic-commute", "media-sentiment"],
  },
];

/* ------------------------------------------------------------------ */
/*  Layer toggle switch                                                */
/* ------------------------------------------------------------------ */

interface LayerToggleProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

function LayerToggle({
  name,
  description,
  icon,
  color,
  enabled,
  collapsed,
  onToggle,
}: LayerToggleProps) {
  const Icon = ICON_MAP[icon] ?? Zap;

  const toggle = (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
        enabled
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-pressed={enabled}
      role="switch"
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
          enabled ? "bg-primary/15" : "bg-muted"
        )}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: enabled ? color : undefined }}
        />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[13px] leading-tight">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
            {description}
          </div>
        </div>
      )}
      {!collapsed && (
        <div
          className={cn(
            "h-4 w-7 shrink-0 rounded-full p-0.5 transition-colors",
            enabled ? "bg-primary" : "bg-border"
          )}
        >
          <div
            className={cn(
              "h-3 w-3 rounded-full bg-white transition-transform",
              enabled ? "translate-x-3" : "translate-x-0"
            )}
          />
        </div>
      )}
    </button>
  );

  if (collapsed) {
    return <Tooltip content={name}>{toggle}</Tooltip>;
  }

  return toggle;
}

/* ------------------------------------------------------------------ */
/*  Sidebar content (shared between desktop and mobile)                */
/* ------------------------------------------------------------------ */

interface SidebarContentProps {
  collapsed: boolean;
}

function SidebarContent({ collapsed }: SidebarContentProps) {
  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
      {LAYER_GROUPS.map((group) => {
        const groupLayers = layers.filter((l) => group.ids.includes(l.id));
        if (groupLayers.length === 0) return null;

        return (
          <div key={group.label} className="mb-3">
            {!collapsed && (
              <h3 className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h3>
            )}
            <div className="space-y-0.5">
              {groupLayers.map((layer) => (
                <LayerToggle
                  key={layer.id}
                  id={layer.id}
                  name={layer.name}
                  description={layer.description}
                  icon={layer.icon}
                  color={layer.color}
                  enabled={layer.enabled}
                  collapsed={collapsed}
                  onToggle={() => toggleLayer(layer.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop sidebar                                                    */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const toggleSidebar = useMapStore((s) => s.toggleSidebar);
  const collapsed = !sidebarOpen;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out",
        collapsed ? "w-14" : "w-72"
      )}
    >
      {/* Collapse toggle */}
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Layers
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile sidebar (sheet/drawer)                                      */
/* ------------------------------------------------------------------ */

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-12 items-center border-b border-border px-4">
          <span className="text-sm font-semibold">Layers</span>
        </div>
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
