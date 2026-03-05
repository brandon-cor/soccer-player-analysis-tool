import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { parseXlsxRows } from "../src/lib/parse-xlsx";

interface DemoPlayerEntry {
  fileName: string;
  player: ReturnType<typeof parseXlsxRows>["players"][number];
  categories: string[];
}

const DEMO_FILES = [
  {
    sourceFileName: "player-stats-M-Corcoran.xlsx",
    demoFileName: "demo-sheet-1.xlsx",
    aliasName: "R Calder",
  },
  {
    sourceFileName: "player-stats-J-Agudelo.xlsx",
    demoFileName: "demo-sheet-2.xlsx",
    aliasName: "T Mercer",
  },
  {
    sourceFileName: "player-stats-P-Botello-Faz.xlsx",
    demoFileName: "demo-sheet-3.xlsx",
    aliasName: "K Harlow",
  },
  {
    sourceFileName: "player-stats-W-Harris.xlsx",
    demoFileName: "demo-sheet-4.xlsx",
    aliasName: "V Sinclair",
  },
];

const defaultSourceDirectory =
  "/Users/brandon/Downloads/player-analysis-pandas-numpy-master/player-stats";
const sourceDirectory = process.env.DEMO_XLSX_DIR || defaultSourceDirectory;
const outputPath = path.resolve(process.cwd(), "src/lib/demo-players.json");

async function parseDemoFile(input: {
  sourceFileName: string;
  demoFileName: string;
  aliasName: string;
}): Promise<DemoPlayerEntry> {
  const fullPath = path.resolve(sourceDirectory, input.sourceFileName);
  const buffer = await fs.readFile(fullPath);
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
  const parsed = parseXlsxRows(rows, input.sourceFileName);

  if (parsed.players.length === 0) {
    throw new Error(`No player parsed from file: ${input.sourceFileName}`);
  }

  return {
    fileName: input.demoFileName,
    player: {
      ...parsed.players[0],
      name: input.aliasName,
    },
    categories: parsed.categories,
  };
}

async function main() {
  const entries = await Promise.all(DEMO_FILES.map((entry) => parseDemoFile(entry)));
  await fs.writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
  console.log(`Wrote ${entries.length} demo players to ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to generate demo data:", error);
  process.exit(1);
});
