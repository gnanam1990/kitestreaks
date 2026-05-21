import { getAddressTransactions } from "./kitescan-api";

const MAX_PAGES = 25;

export async function getYearlyActivity(
  address: string,
  fromTs = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000)
): Promise<Map<string, number>> {
  const daily = new Map<string, number>();
  let cursor: Record<string, unknown> | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await getAddressTransactions(address, cursor);
    for (const tx of res.items) {
      const t = new Date(tx.timestamp);
      const sec = Math.floor(t.getTime() / 1000);
      if (sec < fromTs) return daily;
      const key = t.toISOString().slice(0, 10);
      daily.set(key, (daily.get(key) ?? 0) + 1);
    }
    if (!res.next_page_params) break;
    cursor = res.next_page_params;
  }
  return daily;
}
