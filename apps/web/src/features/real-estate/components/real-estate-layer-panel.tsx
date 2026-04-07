"use client";

import { useState } from "react";
import {
  useHeatmapData,
  useSuburbDetail,
  useListings,
  usePriceIndex,
} from "../hooks/use-real-estate-data";
import { SuburbStatsCard } from "./suburb-stats-card";
import { ListingCard } from "./listing-card";
import { ComparableSaleCard } from "./comparable-sale-card";
import { MortgageCalculator } from "./mortgage-calculator";
import { TestimonyPanel } from "./testimony-panel";
import { ValuationCard } from "./valuation-card";
import { PriceIndexChart } from "./price-index-chart";
import { PriceHeatmapLegend } from "./price-heatmap-legend";
import type { PropertyType, PropertyListing, AuState } from "@ozpulse/shared";

type Tab = "overview" | "listings" | "comparables" | "mortgage" | "trends";

interface RealEstateLayerPanelProps {
  postcode: string;
  enabled: boolean;
  mortgageDefaults?: {
    propertyValue: number;
    loanRemaining: number;
    remainingTermYears: number;
    interestRate: number;
    netWorth: number;
  };
  state?: AuState;
  onListingClick?: (listing: PropertyListing) => void;
  onEquityUpdate?: (equity: number, ltv: number) => void;
}

export function RealEstateLayerPanel({
  postcode,
  enabled,
  mortgageDefaults,
  state = "NSW",
  onListingClick,
}: RealEstateLayerPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | undefined>();
  const [bedroomFilter, setBedroomFilter] = useState<number | undefined>();

  const { data: heatmapData } = useHeatmapData(enabled);
  const { data: suburbData, isLoading: suburbLoading } = useSuburbDetail(postcode, enabled);
  const { data: listingsData, isLoading: listingsLoading } = useListings(
    { postcode, propertyType: propertyTypeFilter, bedrooms: bedroomFilter, limit: 20 },
    enabled && activeTab === "listings"
  );
  const { data: priceIndexData, isLoading: priceIndexLoading } = usePriceIndex(
    postcode,
    enabled && activeTab === "trends"
  );

  if (!enabled) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "listings", label: "Listings" },
    { id: "comparables", label: "Comparables" },
    { id: "mortgage", label: "Mortgage" },
    { id: "trends", label: "Trends" },
  ];

  return (
    <div className="space-y-3">
      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-green-500 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Heatmap Legend (always visible) */}
      <PriceHeatmapLegend />

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {suburbLoading ? (
            <p className="text-xs text-muted-foreground">Loading suburb data...</p>
          ) : suburbData ? (
            <>
              <SuburbStatsCard stats={suburbData.stats} />
              {suburbData.valuation && (
                <ValuationCard valuation={suburbData.valuation} />
              )}
              <TestimonyPanel testimonies={suburbData.testimonies} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter a postcode to see suburb data
            </p>
          )}
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={propertyTypeFilter ?? ""}
              onChange={(e) =>
                setPropertyTypeFilter(
                  (e.target.value as PropertyType) || undefined
                )
              }
              className="rounded border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="unit">Unit</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
            </select>
            <select
              value={bedroomFilter ?? ""}
              onChange={(e) =>
                setBedroomFilter(
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className="rounded border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">Any Beds</option>
              <option value="1">1 bed</option>
              <option value="2">2 bed</option>
              <option value="3">3 bed</option>
              <option value="4">4+ bed</option>
            </select>
          </div>

          {listingsLoading ? (
            <p className="text-xs text-muted-foreground">Loading listings...</p>
          ) : listingsData?.listings.length ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {listingsData.total} listings in {postcode}
              </p>
              {listingsData.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => onListingClick?.(listing)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No listings found</p>
          )}
        </div>
      )}

      {/* Comparables Tab */}
      {activeTab === "comparables" && (
        <div className="space-y-2">
          {suburbLoading ? (
            <p className="text-xs text-muted-foreground">Loading comparables...</p>
          ) : suburbData?.comparables.length ? (
            <>
              <p className="text-xs text-muted-foreground">
                Recent sales near {postcode}
              </p>
              {suburbData.comparables.map((sale) => (
                <ComparableSaleCard key={sale.id} sale={sale} />
              ))}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No comparable sales data
            </p>
          )}
        </div>
      )}

      {/* Mortgage Tab */}
      {activeTab === "mortgage" && (
        <MortgageCalculator
          defaults={mortgageDefaults}
          suburbMedianPrice={suburbData?.stats.medianPriceHouse ?? undefined}
          state={state}
        />
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-3">
          {priceIndexLoading ? (
            <p className="text-xs text-muted-foreground">Loading price trends...</p>
          ) : priceIndexData ? (
            <PriceIndexChart
              suburbSeries={priceIndexData.suburb}
              nationalSeries={priceIndexData.national}
            />
          ) : (
            <p className="text-xs text-muted-foreground">No trend data</p>
          )}
        </div>
      )}
    </div>
  );
}
