/**
 * Suburb comparison PDF export.
 * Generates clean HTML that can be saved as-is or printed to PDF.
 * Compares 2-5 postcodes across all available layer data.
 */

// ── Types ─────────────────────────────────────────────────

export interface SuburbLayerData {
  [layerId: string]: Record<string, unknown>;
}

interface LayerDisplayConfig {
  label: string;
  fields: { key: string; label: string; format?: (v: unknown) => string }[];
}

// ── Field Formatters ──────────────────────────────────────

function formatCurrency(v: unknown): string {
  if (v == null) return "N/A";
  return `$${Number(v).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(v: unknown): string {
  if (v == null) return "N/A";
  return `${Number(v).toFixed(1)}%`;
}

function formatNumber(v: unknown): string {
  if (v == null) return "N/A";
  return Number(v).toLocaleString("en-AU");
}

function formatDefault(v: unknown): string {
  if (v == null) return "N/A";
  return String(v);
}

// ── Layer Display Configs ─────────────────────────────────

const LAYER_DISPLAYS: Record<string, LayerDisplayConfig> = {
  "power-energy": {
    label: "Power & Energy",
    fields: [
      { key: "fuelPricePerLitre", label: "Fuel Price ($/L)", format: (v) => `$${Number(v).toFixed(2)}` },
      { key: "coalGasSharePercent", label: "Coal/Gas Share", format: formatPercent },
      { key: "renewableSharePercent", label: "Renewable Share", format: formatPercent },
      { key: "gridReliabilityIndex", label: "Grid Reliability", format: formatDefault },
    ],
  },
  "real-estate": {
    label: "Real Estate",
    fields: [
      { key: "medianPrice", label: "Median Price", format: formatCurrency },
      { key: "medianPricePerSqm", label: "Median $/sqm", format: formatCurrency },
      { key: "auctionClearanceRate", label: "Auction Clearance", format: formatPercent },
      { key: "daysOnMarket", label: "Avg Days on Market", format: formatNumber },
      { key: "rentalYield", label: "Rental Yield", format: formatPercent },
      { key: "priceChange12m", label: "12m Price Change", format: formatPercent },
    ],
  },
  "crime-safety": {
    label: "Crime & Safety",
    fields: [
      { key: "crimeIndex", label: "Crime Index", format: formatNumber },
      { key: "violentCrimeRate", label: "Violent Crime Rate", format: formatNumber },
      { key: "propertyCrimeRate", label: "Property Crime Rate", format: formatNumber },
      { key: "safetyScore", label: "Safety Score", format: formatDefault },
    ],
  },
  "immigration-demographics": {
    label: "Immigration & Demographics",
    fields: [
      { key: "population", label: "Population", format: formatNumber },
      { key: "populationGrowth", label: "Population Growth", format: formatPercent },
      { key: "medianAge", label: "Median Age", format: formatNumber },
      { key: "overseasBornPercent", label: "Overseas Born", format: formatPercent },
      { key: "netMigration", label: "Net Migration", format: formatNumber },
    ],
  },
  infrastructure: {
    label: "Infrastructure",
    fields: [
      { key: "activeProjects", label: "Active Projects", format: formatNumber },
      { key: "totalBudget", label: "Total Budget", format: formatCurrency },
      { key: "expectedJobs", label: "Expected Jobs", format: formatNumber },
    ],
  },
  "mining-resources": {
    label: "Mining & Resources",
    fields: [
      { key: "nearbySites", label: "Nearby Mine Sites", format: formatNumber },
      { key: "totalProduction", label: "Total Production (t)", format: formatNumber },
      { key: "exportValue", label: "Export Value", format: formatCurrency },
    ],
  },
};

// ── HTML Generation ───────────────────────────────────────

/**
 * Generate a self-contained HTML document comparing postcodes.
 * Designed for print-to-PDF workflow.
 */
export function generateSuburbComparisonHtml(
  postcodes: string[],
  suburbData: Record<string, SuburbLayerData>
): string {
  const now = new Date().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const layerSections = Object.entries(LAYER_DISPLAYS)
    .map(([layerId, config]) => {
      const hasAnyData = postcodes.some(
        (pc) => suburbData[pc]?.[layerId] != null
      );
      if (!hasAnyData) return "";

      const rows = config.fields
        .map((field) => {
          const cells = postcodes
            .map((pc) => {
              const layerData = suburbData[pc]?.[layerId];
              const value = layerData
                ? (layerData as Record<string, unknown>)[field.key]
                : null;
              const formatted = (field.format ?? formatDefault)(value);
              return `<td>${formatted}</td>`;
            })
            .join("");
          return `<tr><td class="field-label">${field.label}</td>${cells}</tr>`;
        })
        .join("\n");

      return `
        <h2>${config.label}</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              ${postcodes.map((pc) => `<th>${pc}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    })
    .filter(Boolean)
    .join("\n");

  const noDataMessage =
    layerSections.length === 0
      ? '<p class="no-data">No cached data available for the selected postcodes. Enable layers and view data first to populate the cache.</p>'
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OzPulse Suburb Comparison: ${postcodes.join(" vs ")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      padding: 40px;
      max-width: 1100px;
      margin: 0 auto;
      line-height: 1.5;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 4px;
      color: #0f172a;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 16px;
      color: #334155;
      margin-top: 28px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    td {
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
    }
    .field-label {
      font-weight: 500;
      color: #475569;
      background: #fafafa;
    }
    tr:nth-child(even) td:not(.field-label) {
      background: #f8fafc;
    }
    .no-data {
      color: #94a3b8;
      font-style: italic;
      margin-top: 24px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Suburb Comparison Report</h1>
  <p class="subtitle">Postcodes: ${postcodes.join(", ")} &mdash; Generated ${now} by OzPulse</p>

  ${noDataMessage}
  ${layerSections}

  <div class="footer">
    <p>Generated by OzPulse Dashboard. Data sourced from public Australian datasets. This report is for informational purposes only.</p>
  </div>
</body>
</html>`;
}

/**
 * Trigger a browser download of the HTML report.
 * Client-side helper for the export button.
 */
export function downloadHtmlReport(
  html: string,
  filename: string
): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
