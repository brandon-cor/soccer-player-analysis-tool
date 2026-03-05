"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { parseXlsxRows } from "@/lib/parse-xlsx";
import { PlayerData } from "@/lib/player-data";

function saveUpload(fileName: string, playerData: PlayerData[], categories: string[]) {
  fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, playerData, categories }),
  }).catch(() => {});
}

interface UploadedFile {
  file: File;
  name: string;
}

interface DemoPlayerEntry {
  fileName: string;
  player: PlayerData;
  categories: string[];
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [demoPlayers, setDemoPlayers] = useState<DemoPlayerEntry[]>([]);
  const [selectedDemoFiles, setSelectedDemoFiles] = useState<string[]>([]);

  useEffect(() => {
    async function loadDemoPlayers() {
      try {
        const response = await fetch("/api/demo-players", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { players?: DemoPlayerEntry[] };
        if (payload.players?.length) setDemoPlayers(payload.players);
      } catch {
        // keep page usable even if demo endpoint fails
      }
    }

    void loadDemoPlayers();
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      setSelectedDemoFiles([]);
      const newFiles: UploadedFile[] = [];

      for (const file of Array.from(incoming)) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "xlsx") {
          setError("Only .xlsx files are accepted.");
          return;
        }
        newFiles.push({ file, name: file.name });
      }

      const combined = [...files, ...newFiles];
      if (combined.length > 2) {
        setError("You can upload a maximum of 2 files.");
        return;
      }

      setFiles(combined);
    },
    [files]
  );

  const toggleDemoPlayer = (fileName: string) => {
    setError(null);
    setFiles([]);
    setSelectedDemoFiles((previous) => {
      if (previous.includes(fileName)) {
        return previous.filter((value) => value !== fileName);
      }
      if (previous.length >= 2) {
        setError("Pick up to 2 demo players.");
        return previous;
      }
      return [...previous, fileName];
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const parseFile = async (file: File) => {
    const buffer = await readFileAsArrayBuffer(file);
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
    return parseXlsxRows(rows, file.name);
  };

  const handleProcess = async () => {
    if (files.length === 0 && selectedDemoFiles.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      setProcessingProgress(10);
      const usingDemo = selectedDemoFiles.length > 0;
      const parsed = usingDemo
        ? []
        : await Promise.all(files.map((f) => parseFile(f.file)));
      setProcessingProgress(40);

      await new Promise((r) => setTimeout(r, 600));
      setProcessingProgress(60);

      if (usingDemo) {
        const selectedEntries = selectedDemoFiles
          .map((fileName) => demoPlayers.find((entry) => entry.fileName === fileName))
          .filter((entry): entry is DemoPlayerEntry => Boolean(entry));

        if (selectedEntries.length === 0) {
          setError("No demo players selected.");
          setIsProcessing(false);
          return;
        }

        if (selectedEntries.length === 1) {
          const [entry] = selectedEntries;
          const categories = entry.categories;
          const players = [{ ...entry.player, stats: { ...entry.player.stats } }];
          sessionStorage.setItem(
            "moneyball_data",
            JSON.stringify({ players, categories, mode: "analysis" })
          );
          saveUpload(entry.fileName, players, categories);
        } else {
          const [entryA, entryB] = selectedEntries;
          const playerA = { ...entryA.player, stats: { ...entryA.player.stats } };
          const playerB = { ...entryB.player, stats: { ...entryB.player.stats } };
          const categories = entryA.categories;
          sessionStorage.setItem(
            "moneyball_data",
            JSON.stringify({
              playerA,
              playerB,
              categories,
              mode: "comparison",
            })
          );
          saveUpload(entryA.fileName, [playerA], categories);
          saveUpload(entryB.fileName, [playerB], categories);
        }
      } else if (files.length === 1) {
        const categories = parsed[0].categories;
        const players = parsed[0].players.map((player) => ({
          ...player,
          stats: { ...player.stats },
        }));
        if (players.length === 0) {
          setError("No valid player data found in the spreadsheet.");
          setIsProcessing(false);
          return;
        }
        sessionStorage.setItem(
          "moneyball_data",
          JSON.stringify({ players, categories, mode: "analysis" })
        );
        saveUpload(files[0].name, players, categories);
      } else {
        const dataA = parsed[0];
        const dataB = parsed[1];
        if (dataA.players.length === 0 || dataB.players.length === 0) {
          setError("No valid player data found in one of the spreadsheets.");
          setIsProcessing(false);
          return;
        }
        const [playerA, playerB] = [
          { ...dataA.players[0], stats: { ...dataA.players[0].stats } },
          { ...dataB.players[0], stats: { ...dataB.players[0].stats } },
        ];
        const allCategories = dataA.categories;
        sessionStorage.setItem(
          "moneyball_data",
          JSON.stringify({
            playerA,
            playerB,
            categories: allCategories,
            mode: "comparison",
          })
        );
        saveUpload(files[0].name, [playerA], allCategories);
        saveUpload(files[1].name, [playerB], allCategories);
      }

      setProcessingProgress(80);
      await new Promise((r) => setTimeout(r, 500));
      setProcessingProgress(100);
      await new Promise((r) => setTimeout(r, 300));

      const shouldCompare = selectedDemoFiles.length === 2 || files.length === 2;
      if (shouldCompare) {
        router.push("/comparison");
      } else {
        router.push("/analysis");
      }
    } catch {
      setError("Failed to parse the spreadsheet. Please check the file format.");
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md w-full">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <Loader2
              size={80}
              className="text-[#E8A838] animate-spin"
              strokeWidth={1.5}
            />
          </div>
          <h2
            className="text-3xl text-white mb-3"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Crunching the numbers
          </h2>
          <p
            className="text-gray-300 mb-8 text-lg"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            Analyzing {files.length === 2 ? "both spreadsheets" : "your spreadsheet"} for player insights...
          </p>
          <div className="w-full bg-white/10 h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E8A838] to-[#3A7D44] transition-all duration-500 ease-out"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p
            className="text-sm text-gray-400 mt-3"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            {processingProgress}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1
            className="text-5xl md:text-6xl text-white mb-3"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Upload your data
          </h1>
          <p
            className="text-gray-300 text-lg"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            Drop one spreadsheet for player analysis, or two to compare them head-to-head.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-0 min-h-[340px]">
          {/* Left: Upload */}
          <div className="flex-1 lg:border-r border-white/20 lg:pr-8 flex flex-col">
            <div
              className={`flex-1 border-2 border-dashed rounded-2xl p-8 lg:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                dragging
                  ? "border-[#E8A838] bg-[#E8A838]/10 scale-[1.01]"
                  : "border-white/20 hover:border-white/40 hover:bg-white/[0.03]"
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
            accept=".xlsx"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {files.length === 0 ? (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <Upload size={36} className="text-white/60" />
              </div>
              <div>
                <p
                  className="text-white text-lg mb-1"
                  style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                >
                  Drag & drop your{" "}
                  <span className="text-[#E8A838] font-medium">.xlsx</span>{" "}
                  files here
                </p>
                <p
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                >
                  or click to browse — up to 2 files
                </p>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <FileSpreadsheet size={24} className="text-white/40" />
                  <span
                    className="text-xs text-gray-400"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                  >
                    1 file → Analysis
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex -space-x-2">
                    <FileSpreadsheet size={24} className="text-white/40" />
                    <FileSpreadsheet size={24} className="text-[#E8A838]/60" />
                  </div>
                  <span
                    className="text-xs text-gray-400"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                  >
                    2 files → Comparison
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.06] border border-white/10 w-full max-w-sm"
                >
                  <FileSpreadsheet size={20} className="text-[#E8A838] flex-shrink-0" />
                  <span
                    className="text-sm text-white truncate flex-1 text-left"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                  >
                    {f.name}
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="hover-lift text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {files.length < 2 && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="hover-lift flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all w-full max-w-sm"
                  style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                >
                  <Upload size={16} />
                  <span className="text-sm">Add a second file to compare</span>
                </button>
              )}
            </div>
          )}
            </div>
          </div>

          <div
            className="hidden lg:block w-px flex-shrink-0 bg-white/20 self-stretch min-h-[280px]"
            aria-hidden
          />

          {/* Right: Demo */}
          <div className="flex-1 lg:pl-8 flex flex-col">
            {demoPlayers.length > 0 ? (
              <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
                <h3
                  className="text-lg text-white mb-1"
                  style={{ fontFamily: '"Instrument Serif", serif' }}
                >
                  Try the demo
                </h3>
                <p
                  className="text-sm text-gray-400 mb-4"
                  style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                >
                  Use preloaded sheets — pick 1 for analysis or 2 for comparison.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 content-start">
                  {demoPlayers.map((entry) => {
                    const isSelected = selectedDemoFiles.includes(entry.fileName);
                    const isDisabled = !isSelected && selectedDemoFiles.length >= 2;
                    return (
                      <button
                        key={entry.fileName}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleDemoPlayer(entry.fileName)}
                        className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-[#E8A838] bg-[#E8A838]/10"
                            : "border-white/15 bg-white/[0.03] hover:border-white/35"
                        } ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover-lift"}`}
                      >
                        <p className="text-sm font-medium text-white truncate">{entry.player.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {entry.player.team || "Unknown"} • {entry.player.position || "—"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex items-center justify-center">
                <p
                  className="text-sm text-gray-500 text-center"
                  style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                >
                  Demo sheets loading…
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p
            className="text-sm text-red-400 mt-6 text-center"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            {error}
          </p>
        )}

        {(files.length > 0 || selectedDemoFiles.length > 0) && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleProcess}
              className="hover-lift px-8 py-3 text-sm text-white/90 bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] hover:bg-white/[0.14] hover:border-white/25 transition-all uppercase tracking-wider shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.2)]"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              {selectedDemoFiles.length === 2 || files.length === 2
                ? "Compare Players"
                : "Analyze Player"}
            </button>
            <p
              className="text-xs text-gray-400"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              {selectedDemoFiles.length > 0
                ? selectedDemoFiles.length === 1
                  ? "1 demo sheet selected — will open Player Analysis"
                  : "2 demo sheets selected — will open Comparison view"
                : files.length === 1
                  ? "1 file selected — will open Player Analysis"
                  : "2 files selected — will open Comparison view"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
