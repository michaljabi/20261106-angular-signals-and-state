// Style guide: name after what it does – no generic utils.ts / helpers.ts.
export function formatPrice(value: number): string {
  return `${value.toFixed(2)} zł`;
}
