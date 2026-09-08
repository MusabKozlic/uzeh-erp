/**
 * Bosnian formatting utilities according to business specifications:
 * - Currency: BAM / KM
 * - Date format: DD.MM.YYYY
 * - Decimal separator: comma (,)
 * - Thousands separator: dot (.)
 * Example: 1.250,50 KM
 */

export function formatKM(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return "0,00 KM";

  const parts = num.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = parts[1];

  return `${intPart},${decPart} KM`;
}

export const formatBosnianCurrency = formatKM;

export function formatDecimal(num: number | string | null | undefined, decimals = 2): string {
  const val = typeof num === "number" ? num : parseFloat(String(num || 0));
  if (isNaN(val)) return "0," + "0".repeat(decimals);

  const parts = val.toFixed(decimals).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = parts[1];

  return `${intPart},${decPart}`;
}

export function parseBosnianNumber(str: string): number {
  if (!str) return 0;
  // Remove thousand dots and replace decimal comma with dot
  const clean = str.replace(/\./g, "").replace(",", ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return String(dateInput);
  }
}

export const formatBosnianDate = formatDate;

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return String(dateInput);
  }
}
