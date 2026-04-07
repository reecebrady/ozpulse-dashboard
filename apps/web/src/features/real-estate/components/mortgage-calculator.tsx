"use client";

import { useState, useMemo } from "react";
import type { MortgageInput, AuState } from "@ozpulse/shared";
import { calculateMortgage, calculateStampDuty, formatAud, formatPercent } from "../lib/mortgage-math";

interface MortgageCalculatorProps {
  defaults?: Partial<MortgageInput>;
  suburbMedianPrice?: number;
  state?: AuState;
}

const PRICE_CHANGE_SCENARIOS = [-10, -5, -2, 0, 2, 5, 10];

export function MortgageCalculator({
  defaults,
  suburbMedianPrice,
  state = "NSW",
}: MortgageCalculatorProps) {
  const [input, setInput] = useState<MortgageInput>({
    propertyValue: defaults?.propertyValue ?? 750000,
    loanRemaining: defaults?.loanRemaining ?? 450000,
    remainingTermYears: defaults?.remainingTermYears ?? 15,
    interestRate: defaults?.interestRate ?? 6.5,
    netWorth: defaults?.netWorth ?? 550000,
  });

  const calc = useMemo(() => calculateMortgage(input), [input]);
  const stampDuty = useMemo(
    () => calculateStampDuty(input.propertyValue, state),
    [input.propertyValue, state]
  );

  function updateField(field: keyof MortgageInput, value: number) {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Mortgage Impact Calculator</h4>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Property Value"
          value={input.propertyValue}
          onChange={(v) => updateField("propertyValue", v)}
          prefix="$"
          step={10000}
        />
        <InputField
          label="Loan Remaining"
          value={input.loanRemaining}
          onChange={(v) => updateField("loanRemaining", v)}
          prefix="$"
          step={10000}
        />
        <InputField
          label="Remaining Term (yrs)"
          value={input.remainingTermYears}
          onChange={(v) => updateField("remainingTermYears", v)}
          step={1}
          min={1}
          max={30}
        />
        <InputField
          label="Interest Rate (%)"
          value={input.interestRate}
          onChange={(v) => updateField("interestRate", v)}
          step={0.1}
          min={0}
          max={15}
        />
      </div>

      {/* Current Position */}
      <div className="rounded-lg border border-border p-3">
        <h5 className="mb-2 text-xs font-medium text-muted-foreground">
          Current Position
        </h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Equity</p>
            <p className="text-sm font-bold text-green-600">
              {formatAud(calc.currentEquity)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">LTV Ratio</p>
            <p className="text-sm font-bold">
              {(calc.currentLtv * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Repayment</p>
            <p className="text-sm font-bold">
              ${calc.monthlyRepayment.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Interest</p>
            <p className="text-sm font-bold">{formatAud(calc.totalInterest)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Refinance Capacity</p>
            <p className="text-sm font-bold">
              {formatAud(calc.refinanceCapacity)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Stamp Duty ({state})</p>
            <p className="text-sm font-bold">${stampDuty.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Price Change Scenarios */}
      <div className="rounded-lg border border-border p-3">
        <h5 className="mb-2 text-xs font-medium text-muted-foreground">
          If Local Prices Change...
        </h5>
        <div className="space-y-1">
          {PRICE_CHANGE_SCENARIOS.map((pct) => {
            const equity = calc.equityAfterPriceChange(pct);
            const ltv = calc.ltvAfterPriceChange(pct);
            return (
              <div
                key={pct}
                className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                  pct === 0 ? "bg-muted font-medium" : ""
                }`}
              >
                <span
                  className={
                    pct > 0
                      ? "text-green-600"
                      : pct < 0
                      ? "text-red-500"
                      : "text-foreground"
                  }
                >
                  {formatPercent(pct, 0)}
                </span>
                <span>Equity: {formatAud(equity)}</span>
                <span>LTV: {(ltv * 100).toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suburb Comparison */}
      {suburbMedianPrice && (
        <div className="rounded-lg border border-border p-3">
          <h5 className="mb-1 text-xs font-medium text-muted-foreground">
            Suburb Median Comparison
          </h5>
          <div className="flex items-center justify-between text-xs">
            <span>Suburb Median: {formatAud(suburbMedianPrice)}</span>
            <span>
              Your Property:{" "}
              {input.propertyValue >= suburbMedianPrice ? (
                <span className="text-green-600">
                  {formatPercent(
                    ((input.propertyValue - suburbMedianPrice) /
                      suburbMedianPrice) *
                      100
                  )}{" "}
                  above
                </span>
              ) : (
                <span className="text-red-500">
                  {formatPercent(
                    ((input.propertyValue - suburbMedianPrice) /
                      suburbMedianPrice) *
                      100
                  )}{" "}
                  below
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper input component ---

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  step = 1,
  min,
  max,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground">{label}</label>
      <div className="relative mt-0.5">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className={`w-full rounded border border-border bg-background px-2 py-1 text-xs ${
            prefix ? "pl-5" : ""
          }`}
        />
      </div>
    </div>
  );
}
