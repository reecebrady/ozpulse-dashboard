export type LayerId =
  | "power-energy"
  | "real-estate"
  | "crime-safety"
  | "immigration-demographics"
  | "infrastructure"
  | "mining-resources"
  | "leisure-lifestyle"
  | "education"
  | "government-performance"
  | "economic-pressure"
  | "traffic-commute"
  | "health"
  | "media-sentiment"
  | "personal-finance";

export interface LayerConfig {
  id: LayerId;
  name: string;
  description: string;
  icon: string;
  defaultVisible: boolean;
  category: "core" | "expanded";
  refreshIntervalMs: number;
}

export const LAYER_CONFIGS: LayerConfig[] = [
  { id: "power-energy", name: "Power & Energy", description: "Generator sites, grid output, fuel prices", icon: "Zap", defaultVisible: false, category: "core", refreshIntervalMs: 300_000 },
  { id: "real-estate", name: "Real Estate", description: "Property prices, listings, mortgage impact", icon: "Home", defaultVisible: false, category: "core", refreshIntervalMs: 3_600_000 },
  { id: "crime-safety", name: "Crime & Safety", description: "Offence heatmaps, school safety, trends", icon: "Shield", defaultVisible: false, category: "core", refreshIntervalMs: 86_400_000 },
  { id: "immigration-demographics", name: "Immigration & Demographics", description: "Migration flows, diaspora maps, workforce shifts", icon: "Users", defaultVisible: false, category: "core", refreshIntervalMs: 86_400_000 },
  { id: "infrastructure", name: "Infrastructure", description: "Major projects, pipeline, construction stages", icon: "Building", defaultVisible: false, category: "core", refreshIntervalMs: 86_400_000 },
  { id: "mining-resources", name: "Mining & Resources", description: "Mine sites, production, commodity prices", icon: "Mountain", defaultVisible: false, category: "core", refreshIntervalMs: 3_600_000 },
  { id: "leisure-lifestyle", name: "Leisure & Lifestyle", description: "Parks, events, weekend planner", icon: "TreePine", defaultVisible: false, category: "core", refreshIntervalMs: 86_400_000 },
  { id: "education", name: "Education", description: "NAPLAN, MySchool ratings", icon: "GraduationCap", defaultVisible: false, category: "expanded", refreshIntervalMs: 86_400_000 },
  { id: "government-performance", name: "Government Performance", description: "MP voting records, attendance", icon: "Landmark", defaultVisible: false, category: "expanded", refreshIntervalMs: 86_400_000 },
  { id: "economic-pressure", name: "Economic Pressure", description: "Wage growth vs inflation", icon: "TrendingDown", defaultVisible: false, category: "expanded", refreshIntervalMs: 86_400_000 },
  { id: "traffic-commute", name: "Traffic & Commute", description: "Live traffic, transport feeds", icon: "Car", defaultVisible: false, category: "expanded", refreshIntervalMs: 300_000 },
  { id: "health", name: "Health", description: "Hospital wait times by region", icon: "Heart", defaultVisible: false, category: "expanded", refreshIntervalMs: 3_600_000 },
  { id: "media-sentiment", name: "Media Sentiment", description: "Headline sentiment by topic", icon: "Newspaper", defaultVisible: false, category: "expanded", refreshIntervalMs: 3_600_000 },
  { id: "personal-finance", name: "Personal Finance", description: "Mortgage equity tied to all layers", icon: "DollarSign", defaultVisible: false, category: "expanded", refreshIntervalMs: 3_600_000 },
];
