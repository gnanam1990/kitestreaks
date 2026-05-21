export interface BlockscoutTransaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  status: "ok" | "error" | null;
}

export interface BlockscoutTxList {
  items: BlockscoutTransaction[];
  next_page_params: Record<string, unknown> | null;
}

const MAINNET_API = "https://kitescan.ai/api/v2";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`KiteScan ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getAddressTransactions(
  address: string,
  cursor?: Record<string, unknown> | null
): Promise<BlockscoutTxList> {
  let url = `${MAINNET_API}/addresses/${address}/transactions`;
  if (cursor) {
    const qs = new URLSearchParams(
      Object.entries(cursor).map(([k, v]) => [k, String(v)])
    ).toString();
    url += "?" + qs;
  }
  return fetchJson<BlockscoutTxList>(url);
}
