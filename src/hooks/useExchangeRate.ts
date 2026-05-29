import { useState, useEffect, useCallback } from 'react';

const PRIMARY_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';
const FALLBACK_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

export interface ExchangeRateResult {
  rate: number | null;
  date: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches the live USD→MYR exchange rate from fawazahmed0/exchange-api.
 * Tries the primary Cloudflare endpoint first, falls back to jsDelivr CDN.
 * Returns null values until the first successful fetch.
 */
export function useExchangeRate(fallbackRate: number = 4.42): ExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const tryFetch = async (url: string): Promise<{ rate: number; date: string }> => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const myrRate = data?.usd?.myr;
      if (typeof myrRate !== 'number' || myrRate <= 0) {
        throw new Error('Invalid MYR rate in response');
      }
      return { rate: myrRate, date: data.date ?? null };
    };

    try {
      const result = await tryFetch(PRIMARY_URL);
      setRate(result.rate);
      setDate(result.date);
    } catch {
      // Primary failed, try fallback
      try {
        const result = await tryFetch(FALLBACK_URL);
        setRate(result.rate);
        setDate(result.date);
      } catch {
        setError('Failed to fetch live rate');
        // Keep previous rate if we had one, otherwise use fallback
        setRate(prev => prev ?? fallbackRate);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fallbackRate]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return { rate, date, isLoading, error };
}
