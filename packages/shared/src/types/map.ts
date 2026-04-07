export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export const AUSTRALIA_DEFAULT_VIEW: MapViewState = {
  longitude: 133.7751,
  latitude: -25.2744,
  zoom: 4,
};

export interface MapLayerSource {
  id: string;
  type: "geojson" | "vector" | "raster";
  url?: string;
  data?: GeoJSON.FeatureCollection;
}

export interface MapPin {
  id: string;
  longitude: number;
  latitude: number;
  type: string;
  color: string;
  label?: string;
  metadata?: Record<string, unknown>;
}
