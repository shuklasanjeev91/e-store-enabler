// Currency formatting utilities
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  MXN: 'MX$',
  BRL: 'R$',
  AED: 'د.إ',
  SAR: '﷼',
  ZAR: 'R',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  VND: '₫',
  PKR: '₨',
  BDT: '৳',
  NGN: '₦',
  EGP: 'E£',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  
  // Handle currencies that typically don't use decimals
  const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR'];
  const decimals = noDecimalCurrencies.includes(currency.toUpperCase()) ? 0 : 2;
  
  return `${symbol}${amount.toFixed(decimals)}`;
}
