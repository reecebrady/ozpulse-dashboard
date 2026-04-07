"use client";

import type { SuburbStats } from "@ozpulse/shared";
import { formatAud, formatPercent } from "../lib/mortgage-math";

interface SuburbStatsCardProps {
  stats: SuburbStats;
  onClick?: () => void;
}

export function SuburbStatsCard({ stats, onClick }: SuburbStatsCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold">{stats.suburb}</h4>
          <p className="text-xs text-muted-foreground">
            {stats.postcode} {stats.state}
          </p>
        </div>
        {stats.priceChangePercent12m !== undefined && (
          <span
            className={`text-xs font-medium ${
              stats.priceChangePercent12m >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {formatPercent(stats.priceChangePercent12m)} 12m
          </span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Median House</p>
          <p className="font-medium">
            {stats.medianPriceHouse ? formatAud(stats.medianPriceHouse) : "--"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Median Apt</p>
          <p className="font-medium">
            {stats.medianPriceApartment
              ? formatAud(stats.medianPriceApartment)
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">$/m²</p>
          <p className="font-medium">
            {stats.medianPricePerSqm
              ? `$${stats.medianPricePerSqm.toLocaleString()}`
              : "--"}
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Days Listed</p>
          <p className="font-medium">{stats.medianDaysOnMarket ?? "--"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Clearance</p>
          <p className="font-medium">
            {stats.auctionClearanceRate !== undefined
              ? `${stats.auctionClearanceRate}%`
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Yield</p>
          <p className="font-medium">
            {stats.rentalYieldMedian !== undefined
              ? `${stats.rentalYieldMedian}%`
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Sales/yr</p>
          <p className="font-medium">{stats.totalSales12Months}</p>
        </div>
      </div>
    </button>
  );
}
