/**
 * API integration layer.
 *
 * Every function here currently returns local mock data (see `MOCK_MODE`).
 * When the FastAPI backend exists, set VITE_API_BASE_URL and replace the mock
 * branches with the fetch calls already sketched below. No secrets belong here —
 * SEC, Groq and ChromaDB access all stay server-side.
 */
import { MOCK_COMPANIES, findCompany, searchCompanies, type Company } from "./companies";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";
export const MOCK_MODE = !API_BASE_URL;

export type Source = { ticker: string; year: number; item: string };

export type AskRequest = { ticker: string; text: string };

export type AskResponse = {
  answer: string;
  sources: Source[];
  /** True while the response comes from local mock data rather than the backend. */
  mock: boolean;
};

/** GET /companies */
export async function getCompanies(): Promise<Company[]> {
  if (MOCK_MODE) return MOCK_COMPANIES;
  const res = await fetch(`${API_BASE_URL}/companies`);
  if (!res.ok) throw new Error("Failed to load companies");
  return (await res.json()) as Company[];
}

/** Client-side filter today; a `GET /companies?q=` search later. */
export async function suggestCompanies(query: string): Promise<Company[]> {
  const list = await getCompanies();
  return searchCompanies(query, list);
}

const MOCK_ANSWERS: { match: RegExp; answer: string; item: string }[] = [
  {
    match: /cyber|security|breach/i,
    answer:
      "The filings describe cybersecurity exposure from unauthorised access to systems and product data, reliance on third-party service providers, and the operational and reputational cost of responding to incidents. Mitigations discussed include internal security programmes and incident response processes.",
    item: "Item 1A",
  },
  {
    match: /supply|manufactur|supplier/i,
    answer:
      "Supply-chain disclosures centre on dependence on a limited number of outsourcing partners and component suppliers, single-source parts, and concentration of manufacturing capacity in specific regions — with disruption, cost and quality risk flowing from that concentration.",
    item: "Item 1A",
  },
  {
    match: /legal|litigation|proceeding|lawsuit/i,
    answer:
      "Legal proceedings disclosures cover antitrust and competition matters, intellectual-property claims, consumer and shareholder actions, and regulatory investigations across multiple jurisdictions, together with the statement that outcomes and possible losses remain uncertain.",
    item: "Item 3",
  },
  {
    match: /chang|compare|year|diff/i,
    answer:
      "Year-over-year, the risk language shifts emphasis toward regulatory scrutiny and artificial-intelligence related obligations, while supply-chain and macroeconomic wording is condensed relative to the prior filing. Core dependency and competition risks persist largely unchanged.",
    item: "Item 1A",
  },
];

/** POST /ask  →  { ticker, text } */
export async function ask({ ticker, text }: AskRequest): Promise<AskResponse> {
  if (MOCK_MODE) {
    const company = findCompany(ticker);
    const year = company?.years[company.years.length - 1] ?? 2025;
    const hit = MOCK_ANSWERS.find((a) => a.match.test(text));
    const answer =
      hit?.answer ??
      `${company?.name ?? ticker} filings identify risks related to supply chain dependencies, cybersecurity, changing market conditions, regulation, and reliance on third-party manufacturing.`;
    return {
      answer,
      sources: [
        { ticker: ticker.toUpperCase(), year, item: hit?.item ?? "Item 1A" },
        { ticker: ticker.toUpperCase(), year: year - 1, item: "Item 1A" },
      ],
      mock: true,
    };
  }

  const res = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ticker, text } satisfies AskRequest),
  });
  if (!res.ok) throw new Error("Request failed");
  const data = (await res.json()) as Omit<AskResponse, "mock">;
  return { ...data, mock: false };
}
