"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { PlayerData } from "@/lib/player-data";

interface FileUploadProps {
  onDataLoaded: (players: PlayerData[], categories: string[]) => void;
}

const STAT_KEYS = [
  "Shooting",
  "Pace",
  "Passing",
  "Defending",
  "Physical",
  "Dribbling",
];

function parseRows(
  rows: Record<string, string | number>[]
): { players: PlayerData[]; categories: string[] } {
  if (rows.length === 0) return { players: [], categories: [] };

  const headers = Object.keys(rows[0]);
  const statCols = headers
    .filter((h) => {
      const lh = h.trim().toLowerCase();
      return (
        STAT_KEYS.some((k) => k.toLowerCase() === lh) ||
        rows.some((r) => r[h] !== "" && !isNaN(Number(r[h])))
      );
    })
    .filter((h) => {
      const lh = h.trim().toLowerCase();
      return ![
        "name",
        "player",
        "id",
        "team",
        "club",
        "position",
        "pos",
        "nationality",
      ].includes(lh);
    });

  const nameCol =
    headers.find((h) => {
      const lh = h.trim().toLowerCase();
      return ["name", "player", "playername"].includes(lh);
    }) ?? headers[0];

  const categories = [...new Set(statCols)].slice(0, 8);
  const COLORS_LIST = ["#E8A838", "#3A7D44", "#E05C5C", "#5B8DD9", "#9B59B6"];

  const players: PlayerData[] = rows.slice(0, 5).map((row, i) => {
    const stats: Record<string, number> = {};
    categories.forEach((col) => {
      stats[col] = Math.min(100, Math.max(0, Number(row[col]) || 0));
    });
    return {
      name: String(row[nameCol] ?? `Player ${i + 1}`),
      color: COLORS_LIST[i % COLORS_LIST.length],
      stats,
    };
  });

  return { players, categories };
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data as Record<string, string>[];
          const parsed = parseRows(rows);
          if (parsed.players.length === 0) {
            setError("No valid player data found in CSV.");
          } else {
            onDataLoaded(parsed.players, parsed.categories);
          }
        },
        error: () => setError("Failed to parse CSV file."),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(
            sheet
          );
          const parsed = parseRows(rows);
          if (parsed.players.length === 0) {
            setError("No valid player data found in XLSX.");
          } else {
            onDataLoaded(parsed.players, parsed.categories);
          }
        } catch {
          setError("Failed to parse XLSX file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Please upload a .csv or .xlsx file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-[#E8A838] bg-[#E8A838]/10"
            : "border-white/20 hover:border-[#E8A838] hover:bg-white/5"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        {fileName ? (
          <div className="flex items-center justify-center gap-2">
            <FileSpreadsheet size={20} className="text-[#E8A838]" />
            <span className="text-sm text-white font-medium truncate max-w-[180px]">
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="hover-lift ml-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8A838] to-[#3A7D44] flex items-center justify-center">
              <Upload size={32} className="text-white" />
            </div>
            <p className="text-sm text-gray-300">
              Drop a <span className="font-semibold text-white">CSV</span> or{" "}
              <span className="font-semibold text-white">XLSX</span> file here
            </p>
            <p className="text-xs text-gray-400">or click to browse</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
