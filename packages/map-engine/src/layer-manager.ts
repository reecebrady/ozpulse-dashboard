import type { LayerId } from "@ozpulse/shared";

export interface RegisteredLayer {
  id: LayerId;
  visible: boolean;
  addToMap: (map: maplibregl.Map) => void;
  removeFromMap: (map: maplibregl.Map) => void;
  update?: (map: maplibregl.Map) => void;
}

export interface LayerManagerAPI {
  register(layer: RegisteredLayer): void;
  unregister(layerId: LayerId): void;
  show(layerId: LayerId): void;
  hide(layerId: LayerId): void;
  toggle(layerId: LayerId): void;
  getVisible(): LayerId[];
  getAll(): RegisteredLayer[];
}

export class LayerManager implements LayerManagerAPI {
  private layers = new Map<LayerId, RegisteredLayer>();
  private map: maplibregl.Map | null = null;

  setMap(map: maplibregl.Map) {
    this.map = map;
  }

  register(layer: RegisteredLayer): void {
    this.layers.set(layer.id, layer);
    if (layer.visible && this.map) {
      layer.addToMap(this.map);
    }
  }

  unregister(layerId: LayerId): void {
    const layer = this.layers.get(layerId);
    if (layer && this.map) {
      layer.removeFromMap(this.map);
    }
    this.layers.delete(layerId);
  }

  show(layerId: LayerId): void {
    const layer = this.layers.get(layerId);
    if (layer && this.map) {
      layer.visible = true;
      layer.addToMap(this.map);
    }
  }

  hide(layerId: LayerId): void {
    const layer = this.layers.get(layerId);
    if (layer && this.map) {
      layer.visible = false;
      layer.removeFromMap(this.map);
    }
  }

  toggle(layerId: LayerId): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible ? this.hide(layerId) : this.show(layerId);
    }
  }

  getVisible(): LayerId[] {
    return Array.from(this.layers.values())
      .filter((l) => l.visible)
      .map((l) => l.id);
  }

  getAll(): RegisteredLayer[] {
    return Array.from(this.layers.values());
  }
}
