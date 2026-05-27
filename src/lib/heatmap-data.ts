import { getAddressTransactions } from "./kitescan-api";

export interface YearlyActivityResult {
  daily: Map<string, number>;
  pages_scanned: number;
  total_txs: number;
  is_partial: boolean;
}

interface YearlyActivityOptions {
  maxPages?: number;
  timeBudgetMs?: number;
  onProgress?: (result: YearlyActivityResult) => void;
}

const DEFAULT_MAX_PAGES = 8;
const DEFAULT_TIME_BUDGET_MS = 10_000;

export async function getYearlyActivity(
  address: string,
  fromTs = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000),
  options: YearlyActivityOptions = {}
): Promise<YearlyActivityResult> {
  const daily = new Map<string, number>();
  let cursor: Record<string, unknown> | null = null;
  let pagesScanned = 0;
  let totalTxs = 0;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const timeBudgetMs = options.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS;
  const startedAt = performance.now();

  const toResult = (isPartial: boolean): YearlyActivityResult => ({
    daily: new Map(daily),
    pages_scanned: pagesScanned,
    total_txs: totalTxs,
    is_partial: isPartial,
  });

  for (let page = 0; page < maxPages; page++) {
    const res = await getAddressTransactions(address, cursor);
    pagesScanned = page + 1;

    for (const tx of res.items) {
      const t = new Date(tx.timestamp);
      const sec = Math.floor(t.getTime() / 1000);
      if (sec < fromTs) {
        options.onProgress?.(toResult(false));
        return toResult(false);
      }
      const key = t.toISOString().slice(0, 10);
      daily.set(key, (daily.get(key) ?? 0) + 1);
      totalTxs++;
    }

    const hasMorePages = !!res.next_page_params;
    const shouldKeepScanning =
      hasMorePages &&
      performance.now() - startedAt < timeBudgetMs &&
      page < maxPages - 1;

    options.onProgress?.(toResult(shouldKeepScanning));

    if (!shouldKeepScanning) break;
    cursor = res.next_page_params;
  }

  return toResult(false);
}
