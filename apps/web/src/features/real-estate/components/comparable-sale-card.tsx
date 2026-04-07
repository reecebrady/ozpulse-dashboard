"use client";

import type { ComparableSale } from "@ozpulse/shared";
import { formatAud } from "../lib/mortgage-math";

interface ComparableSaleCardProps {
  sale: ComparableSale;
}

export function ComparableSaleCard({ sale }: ComparableSaleCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{sale.address}</p>
          <p className="text-xs text-muted-foreground">
            {sale.suburb}, {sale.postcode}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{formatAud(sale.soldPriceAud)}</p>
          <p className="text-xs text-muted-foreground">Sold {sale.soldDate}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{sale.bedrooms} bed</span>
        <span>{sale.bathrooms} bath</span>
        <span className="capitalize">{sale.propertyType}</span>
        {sale.pricePerSqm && <span>${sale.pricePerSqm.toLocaleString()}/m²</span>}
        {sale.distanceKm !== undefined && <span>{sale.distanceKm}km away</span>}
      </div>
    </div>
  );
}
