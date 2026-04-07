import type { MortgageInput, MortgageCalculation, AuState } from "@ozpulse/shared";
import { STAMP_DUTY_BRACKETS } from "./constants";

/**
 * Calculate monthly mortgage repayment (principal + interest).
 */
function monthlyRepayment(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Calculate stamp duty for a property purchase in a given state.
 */
export function calculateStampDuty(propertyValue: number, state: AuState): number {
  const brackets = STAMP_DUTY_BRACKETS[state];
  if (!brackets || brackets.length === 0) return 0;

  let applicableBracket = brackets[0];
  for (const bracket of brackets) {
    if (propertyValue >= bracket.threshold) {
      applicableBracket = bracket;
    } else {
      break;
    }
  }

  return Math.round(
    applicableBracket.base +
      applicableBracket.rate * (propertyValue - applicableBracket.threshold)
  );
}

/**
 * Full mortgage calculation from user inputs.
 */
export function calculateMortgage(input: MortgageInput): MortgageCalculation {
  const { propertyValue, loanRemaining, remainingTermYears, interestRate, netWorth } = input;

  const currentEquity = propertyValue - loanRemaining;
  const currentLtv = loanRemaining / propertyValue;
  const payment = monthlyRepayment(loanRemaining, interestRate, remainingTermYears);
  const totalInterest = payment * remainingTermYears * 12 - loanRemaining;

  // Assume 80% LVR max for refinance
  const maxBorrowable = propertyValue * 0.8;
  const refinanceCapacity = Math.max(0, maxBorrowable - loanRemaining);

  // Default stamp duty estimate for the user's state (use NSW as fallback)
  const stampDutyEstimate = calculateStampDuty(propertyValue, "NSW");

  return {
    currentEquity,
    currentLtv,
    monthlyRepayment: Math.round(payment),
    totalInterest: Math.round(totalInterest),
    equityAfterPriceChange: (changePercent: number) => {
      const newValue = propertyValue * (1 + changePercent / 100);
      return newValue - loanRemaining;
    },
    ltvAfterPriceChange: (changePercent: number) => {
      const newValue = propertyValue * (1 + changePercent / 100);
      return loanRemaining / newValue;
    },
    refinanceCapacity: Math.round(refinanceCapacity),
    stampDutyEstimate,
  };
}

/**
 * Format AUD currency.
 */
export function formatAud(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format percentage.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}
