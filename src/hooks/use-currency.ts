import { useAuth } from "@/contexts/AuthContext";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function useCurrency() {
  const { userProfile } = useAuth();
  const code = (userProfile?.preferred_currency as CurrencyCode) || "USD";
  const currency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toLocaleString()}`;
  };

  return { currency, currencyCode: code, formatCurrency };
}
