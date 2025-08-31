"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function Home() {
  // UI state
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [endpoint, setEndpoint] = useState<"summarize" | "extract">("summarize");
  const [text, setText] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [attendees, setAttendees] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API/result state
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helpers
  const bulletLines = (s: string | undefined) =>
    (s || "")
      .split("\n")
      .map((ln) => ln.trim())
      .filter((ln) => ln.length > 0)
      .map((ln) => ln.replace(/^[-•]\s*/, ""));

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt") {
      setError("Please upload a .txt file (PDF parsing not enabled in UI yet).");
      return;
    }
    setError("");
    const textContent = await file.text();
    setText(textContent);
  };

  const handleSummarize = async () => {
    setError("");
    if (!text.trim()) {
      setError("Please provide a meeting transcript (paste or upload a .txt file).");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { text });
      let data = res.data;

      // normalize fallback: ensure object with expected keys
      if (!data || typeof data !== "object") {
        data = { summary: String(data || ""), decisions: [], action_items: [], deadlines: [] };
      } else {
        data.summary = data.summary || "";
        data.decisions = data.decisions || [];
        data.action_items = data.action_items || [];
        data.deadlines = data.deadlines || [];
      }

      setResult(data);
      // scroll to results
      setTimeout(() => {
        const el = document.getElementById("results-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    } catch (err) {
      console.error(err);
      setError("Could not reach backend. Is FastAPI running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meeting Minutes Summarizer</h1>
            <p className="text-gray-600">AI-Powered Transcript Analysis</p>
          </div>
          <div className="text-sm text-gray-500">Local LLM: Mistral (Ollama)</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <section className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Input Transcript</h2>

          {/* Meta form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting title (optional)"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Attendees (comma-separated)"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              className={`px-3 py-1.5 rounded-lg border ${mode === "paste" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"}`}
              onClick={() => setMode("paste")}
            >
              Paste
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg border ${mode === "upload" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"}`}
              onClick={() => {
                setMode("upload");
                fileInputRef.current?.click();
              }}
            >
              Upload .txt
            </button>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFilePick} className="hidden" />
          </div>

          {/* Endpoint toggle */}
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm text-gray-600">Mode:</label>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value as "summarize" | "extract")}
              className="border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summarize">Simple Summary</option>
              <option value="extract">Structured Extraction</option>
            </select>
          </div>

          {/* Paste area */}
          {mode === "paste" && (
            <>
              <textarea
                rows={12}
                className="w-full border rounded-xl p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your meeting transcript here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <span>{text.length.toLocaleString()} characters</span>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg"
            >
              {loading ? "Summarizing…" : "Summarize"}
            </button>
            <button
              onClick={() => {
                setText("");
                setResult(null);
                setError("");
              }}
              disabled={loading}
              className="px-4 py-2.5 border rounded-lg text-gray-700"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Right: Results Panel — stacked sections */}
        <section id="results-section" className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Results</h2>
            {result && result.summary && (
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm border rounded-lg"
                  onClick={() => downloadText(`${meetingTitle || "meeting-summary"}.txt`, result.summary)}
                >
                  Download .txt
                </button>
                <button
                  className="px-3 py-1.5 text-sm border rounded-lg"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                >
                  Copy JSON
                </button>
              </div>
            )}
          </div>

          <div className="min-h-[260px] border rounded-xl p-4 bg-gray-50 space-y-6">
            {/* No result */}
            {!result && <div className="text-gray-500">Run a summary to see results here.</div>}

            {/* Summary section */}
            {result && result.summary && (
              <section>
                <h3 className="text-md font-semibold mb-2">📌 Summary</h3>
                <ul className="list-disc list-inside space-y-1">
                  {bulletLines(result.summary).map((ln, i) => (
                    <li key={i} className="text-gray-800">{ln}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Decisions section (show if non-empty) */}
            {result && Array.isArray(result.decisions) && result.decisions.length > 0 && (
              <section>
                <h3 className="text-md font-semibold mb-2">🗳 Decisions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.decisions.map((d: string, i: number) => (
                    <li key={i} className="text-gray-800">{d}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Action items section */}
            {result && Array.isArray(result.action_items) && result.action_items.length > 0 && (
              <section>
                <h3 className="text-md font-semibold mb-2">✅ Action Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">Owner</th>
                        <th className="py-2 pr-4">Task</th>
                        <th className="py-2">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.action_items.map((a: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 pr-4">{a.owner || "—"}</td>
                          <td className="py-2 pr-4">{a.task}</td>
                          <td className="py-2">{a.due_date || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Deadlines section */}
            {result && Array.isArray(result.deadlines) && result.deadlines.length > 0 && (
              <section>
                <h3 className="text-md font-semibold mb-2">⏰ Deadlines</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.deadlines.map((d: any, i: number) => (
                    <li key={i} className="text-gray-800">
                      <span className="font-medium">{d.item}:</span> {d.date || "—"}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        Built for internship demo • Runs fully local via Ollama + FastAPI
      </footer>
    </main>
  );
}
