import { NextRequest, NextResponse } from "next/server";

interface WikidataRow {
  playerLabel?: { value: string };
  dob?: { value: string };
  height?: { value: string };
  footLabel?: { value: string };
  handLabel?: { value: string };
  clubLabel?: { value: string };
  isFootballer?: { value: string };
}

interface WikipediaSearchResponse {
  query?: {
    search?: Array<{
      title?: string;
    }>;
  };
}

function getAgeAround2022(dateOfBirthIso: string): number | null {
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) return null;

  const reference = new Date("2022-07-01T00:00:00.000Z");
  let age = reference.getUTCFullYear() - dob.getUTCFullYear();
  const hasBirthdayPassed =
    reference.getUTCMonth() > dob.getUTCMonth() ||
    (reference.getUTCMonth() === dob.getUTCMonth() &&
      reference.getUTCDate() >= dob.getUTCDate());

  if (!hasBirthdayPassed) age -= 1;
  return age >= 0 ? age : null;
}

function formatHeight(value: string | undefined): string | null {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  // Wikidata values are commonly in centimeters for footballers (e.g., 183).
  const meters = numeric > 3 ? numeric / 100 : numeric;

  const totalInches = meters * 39.3701;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet}'${inches}"`;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function scoreCandidate(row: WikidataRow, inputName: string, inputTeam: string): number {
  const label = normalizeText(row.playerLabel?.value ?? "");
  const club = normalizeText(row.clubLabel?.value ?? "");
  const queryName = normalizeText(inputName);
  const queryTeam = normalizeText(inputTeam);

  let score = 0;
  if (label === queryName) score += 5;
  else if (label.includes(queryName) || queryName.includes(label)) score += 3;

  if (queryTeam && club && (club.includes(queryTeam) || queryTeam.includes(club))) {
    score += 4;
  }

  if (row.isFootballer?.value) score += 3;
  if (row.dob?.value) score += 1;
  if (row.height?.value) score += 1;
  if (row.footLabel?.value || row.handLabel?.value) score += 1;

  return score;
}

async function fetchWithTimeout(url: URL, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent": "moneyball-player-metadata/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function stripParentheticalTitle(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

async function resolveLikelyFullName(name: string, team: string): Promise<string> {
  const query = `${name} ${team} full name football`;
  const wikiUrl = new URL("https://en.wikipedia.org/w/api.php");
  wikiUrl.searchParams.set("action", "query");
  wikiUrl.searchParams.set("list", "search");
  wikiUrl.searchParams.set("srsearch", query);
  wikiUrl.searchParams.set("utf8", "1");
  wikiUrl.searchParams.set("format", "json");
  wikiUrl.searchParams.set("origin", "*");
  wikiUrl.searchParams.set("srlimit", "5");

  try {
    const response = await fetchWithTimeout(wikiUrl, 4000);
    if (!response.ok) return name;

    const payload = (await response.json()) as WikipediaSearchResponse;
    const candidates = (payload.query?.search ?? [])
      .map((item) => stripParentheticalTitle(item.title ?? ""))
      .filter(Boolean);

    if (candidates.length === 0) return name;

    const normalizedInput = normalizeText(name);
    const bestCandidate =
      candidates.find((candidate) => normalizeText(candidate).includes(normalizedInput)) ??
      candidates[0];

    // Prefer a likely full name, but never downgrade to a shorter/less useful string.
    if (bestCandidate.length >= name.length) return bestCandidate;
    return name;
  } catch {
    return name;
  }
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();
  const team = request.nextUrl.searchParams.get("team")?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { error: "Missing required query param: name" },
      { status: 400 }
    );
  }

  const fullNameSeed = await resolveLikelyFullName(name, team);
  const escapedName = fullNameSeed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const sparql = `
    SELECT ?player ?playerLabel ?dob ?height ?footLabel ?handLabel ?clubLabel ?isFootballer WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch";
                        wikibase:endpoint "www.wikidata.org";
                        mwapi:search "${escapedName}";
                        mwapi:language "en".
        ?player wikibase:apiOutputItem mwapi:item.
      }
      ?player wdt:P31 wd:Q5.
      OPTIONAL { ?player wdt:P106/wdt:P279* wd:Q937857. BIND("1" AS ?isFootballer) }
      OPTIONAL {
        ?player wdt:P54 ?club.
        ?club rdfs:label ?clubLabel.
        FILTER(LANG(?clubLabel) = "en")
      }
      OPTIONAL { ?player wdt:P569 ?dob. }
      OPTIONAL { ?player wdt:P2048 ?height. }
      OPTIONAL {
        ?player wdt:P423 ?foot.
        ?foot rdfs:label ?footLabel.
        FILTER(LANG(?footLabel) = "en")
      }
      OPTIONAL {
        ?player wdt:P552 ?hand.
        ?hand rdfs:label ?handLabel.
        FILTER(LANG(?handLabel) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 15
  `;

  const url = new URL("https://query.wikidata.org/sparql");
  url.searchParams.set("format", "json");
  url.searchParams.set("query", sparql);

  try {
    const response = await fetchWithTimeout(url, 8000);

    if (!response.ok) {
      return NextResponse.json(
        { fullName: null, age: null, height: null, foot: null },
        { status: 200 }
      );
    }

    const payload = (await response.json()) as {
      results?: { bindings?: WikidataRow[] };
    };
    const rows = payload.results?.bindings ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ fullName: null, age: null, height: null, foot: null });
    }

    const best = [...rows].sort(
      (a, b) => scoreCandidate(b, fullNameSeed, team) - scoreCandidate(a, fullNameSeed, team)
    )[0];

    const fullName = best.playerLabel?.value ?? null;
    const age = best.dob?.value ? getAgeAround2022(best.dob.value) : null;
    const height = formatHeight(best.height?.value);
    const foot = best.footLabel?.value ?? best.handLabel?.value ?? null;

    return NextResponse.json({ fullName, age, height, foot });
  } catch {
    return NextResponse.json({ fullName: null, age: null, height: null, foot: null });
  }
}
