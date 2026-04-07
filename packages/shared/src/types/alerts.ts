export type AlertSeverity = "info" | "warning" | "critical";
export type AlertCategory = "fuel" | "crime" | "property" | "demographics" | "energy" | "infrastructure" | "general";

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  postcode?: string;
  layerId?: string;
  dismissed: boolean;
}
