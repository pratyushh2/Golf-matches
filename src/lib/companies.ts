export type Company = {
  ticker: string;
  name: string;
  years: number[];
};

/** Frontend mock data. Replaced by GET /companies once the backend is connected. */
export const MOCK_COMPANIES: Company[] = [
  { ticker: "AAPL", name: "Apple Inc.", years: [2022, 2023, 2024, 2025] },
  { ticker: "MSFT", name: "Microsoft Corporation", years: [2022, 2023, 2024, 2025] },
  { ticker: "TSLA", name: "Tesla, Inc.", years: [2022, 2023, 2024, 2025] },
  { ticker: "NVDA", name: "NVIDIA Corporation", years: [2022, 2023, 2024, 2025] },
  { ticker: "AMZN", name: "Amazon.com, Inc.", years: [2022, 2023, 2024, 2025] },
];

export const POPULAR_TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN"];

export function searchCompanies(query: string, list: Company[] = MOCK_COMPANIES): Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list.filter((c) => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
}

export function findCompany(ticker: string, list: Company[] = MOCK_COMPANIES): Company | undefined {
  return list.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase());
}

export function filingRange(c: Company): string {
  const first = c.years[0];
  const last = c.years[c.years.length - 1];
  return `Annual filings · ${first} — ${last}`;
}
