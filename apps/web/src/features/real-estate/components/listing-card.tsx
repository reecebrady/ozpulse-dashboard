"use client";

import type { PropertyListing } from "@ozpulse/shared";
import { formatAud } from "../lib/mortgage-math";

interface ListingCardProps {
  listing: PropertyListing;
  onClick?: () => void;
}

export function ListingCard({ listing, onClick }: ListingCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{listing.address}</p>
          <p className="text-xs text-muted-foreground">
            {listing.suburb}, {listing.postcode}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-green-600">
            {formatAud(listing.priceAud)}
          </p>
          <p className="text-xs text-muted-foreground">
            {listing.listingType === "auction" ? "Auction" : "For Sale"}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{listing.bedrooms} bed</span>
        <span>{listing.bathrooms} bath</span>
        {listing.carSpaces !== undefined && <span>{listing.carSpaces} car</span>}
        <span className="capitalize">{listing.propertyType}</span>
        {listing.pricePerSqm && (
          <span>${listing.pricePerSqm.toLocaleString()}/m²</span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{listing.daysOnMarket}d on market</span>
        {listing.rentalYieldPercent && (
          <span>Yield {listing.rentalYieldPercent}%</span>
        )}
        {listing.landAreaSqm && <span>{listing.landAreaSqm}m² land</span>}
      </div>
    </button>
  );
}
