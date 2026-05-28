export function computeAdjustedPrice(
  basePrice: number,
  type: "fixed" | "percentage" | "custom_price",
  direction: "increase" | "decrease",
  value: number
): number {
  if (type === "custom_price") return Math.max(0, Math.round(value * 100) / 100)
  const delta = type === "fixed" ? value : basePrice * (value / 100)
  const adjusted = direction === "increase" ? basePrice + delta : basePrice - delta
  return Math.max(0, Math.round(adjusted * 100) / 100)
}
