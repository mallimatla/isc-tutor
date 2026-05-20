"use client";

import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import ChapterLessonPreview from "@/components/ChapterLessonPreview";
import { useIsAdmin } from "@/lib/use-is-admin";
import { apiFetch } from "@/lib/api-client";
import { auth } from "@/lib/firebase";
import Link from "next/link";

interface ChapterStatus {
  chapterId: string;
  chapterLabel: string;
  classLevel: string;
  lessonId: string;
  status: "seeded" | "not-seeded" | "failed";
  generatedAt: string | null;
  promptVersion: string | null;
  hasSanitizationWarnings: boolean;
  sizeBytes: number | null;
}

interface InventoryResponse {
  chapters: ChapterStatus[];
  summary: { total: number; seeded: number; not_seeded: number; failed: number };
}

interface LogEntry {
  chapterId: string;
  classLevel: string;
  status: "generating" | "done" | "failed";
  message: string;
}

function AdminContent() {
  const isAdminUser = useIsAdmin();
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkLogs, setBulkLogs] = useState<LogEntry[]>([]);
  const [previewChapter, setPreviewChapter] = useState<{
    chapterId: string;
    classLevel: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "seeded" | "not-seeded" | "failed">("all");
  const [classFilter, setClassFilter] = useState<"all" | "11" | "12">("all");

  const fetchInventory = useCallback(async () => {
    try {
      const data = await apiFetch<InventoryResponse>("/api/admin/lessons");
      setInventory(data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminUser) fetchInventory();
  }, [isAdminUser, fetchInventory]);

  const handleGenerate = async (
    chapterId: string,
    classLevel: string,
    force = false
  ) => {
    setGeneratingChapter(`${classLevel}-${chapterId}`);
    try {
      await apiFetch("/api/admin/lessons/generate", {
        method: "POST",
        body: JSON.stringify({ chapterId, classLevel, force }),
      });
      await fetchInventory();
    } catch {
      // Refresh inventory to see current state
      await fetchInventory();
    } finally {
      setGeneratingChapter(null);
    }
  };

  const handleGenerateAll = async (force = false) => {
    setBulkRunning(true);
    setBulkLogs([]);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/lessons/generate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          force,
          classLevel: classFilter === "all" ? null : classFilter,
        }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "chapter-progress") {
            setBulkLogs((prev) => [
              ...prev,
              {
                chapterId: data.chapterId,
                classLevel: data.classLevel,
                status: "generating",
                message: `Generating ${data.chapterId} (${data.classLevel})...`,
              },
            ]);
          } else if (data.type === "chapter-done") {
            setBulkLogs((prev) =>
              prev.map((l) =>
                l.chapterId === data.chapterId && l.status === "generating"
                  ? {
                      ...l,
                      status: "done" as const,
                      message: `${data.chapterId} (${data.classLevel}) — ${(data.durationMs / 1000).toFixed(1)}s`,
                    }
                  : l
              )
            );
          } else if (data.type === "chapter-failed") {
            setBulkLogs((prev) =>
              prev.map((l) =>
                l.chapterId === data.chapterId && l.status === "generating"
                  ? {
                      ...l,
                      status: "failed" as const,
                      message: `${data.chapterId} (${data.classLevel}) — ${data.error}`,
                    }
                  : l
              )
            );
          }
        }
      }

      await fetchInventory();
    } finally {
      setBulkRunning(false);
    }
  };

  if (!isAdminUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-sm text-zinc-500">Not authorized.</p>
        <Link href="/" className="text-sm text-blue-600 underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading inventory...</p>
      </div>
    );
  }

  const summary = inventory?.summary ?? {
    total: 0,
    seeded: 0,
    not_seeded: 0,
    failed: 0,
  };

  const filteredChapters = (inventory?.chapters ?? []).filter((ch) => {
    if (filter !== "all" && ch.status !== filter) return false;
    if (classFilter !== "all" && ch.classLevel !== classFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Chapter Lessons Admin
        </h1>

        {/* Stats bar */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {summary.seeded} of {summary.total} seeded
          </span>
          <div className="flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{
                width: `${summary.total > 0 ? (summary.seeded / summary.total) * 100 : 0}%`,
              }}
            />
          </div>
          {summary.failed > 0 && (
            <span className="text-xs text-red-500">{summary.failed} failed</span>
          )}
        </div>

        {/* Actions */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerateAll(false)}
            disabled={bulkRunning}
            className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {bulkRunning ? "Running..." : "Generate All Missing"}
          </button>
          <button
            onClick={() => {
              if (confirm("Regenerate all chapters? This costs ~$3 in API calls.")) {
                handleGenerateAll(true);
              }
            }}
            disabled={bulkRunning}
            className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Regenerate All
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All</option>
            <option value="seeded">Seeded</option>
            <option value="not-seeded">Not Seeded</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) =>
              setClassFilter(e.target.value as typeof classFilter)
            }
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All Classes</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        {/* Bulk progress logs */}
        {bulkLogs.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-900">
            {bulkLogs.map((log, i) => (
              <div key={i} className="py-0.5">
                {log.status === "done" && (
                  <span className="text-green-600">Done: </span>
                )}
                {log.status === "failed" && (
                  <span className="text-red-600">Failed: </span>
                )}
                {log.status === "generating" && (
                  <span className="text-zinc-400">Generating: </span>
                )}
                <span className="text-zinc-700 dark:text-zinc-300">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">
                  Class
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">
                  Chapter
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">
                  Generated
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">
                  Size
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredChapters.map((ch) => {
                const isGenerating =
                  generatingChapter === `${ch.classLevel}-${ch.chapterId}`;
                return (
                  <tr
                    key={ch.lessonId}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {ch.classLevel}
                    </td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">
                      {ch.chapterLabel}
                    </td>
                    <td className="px-3 py-2">
                      {ch.status === "seeded" && (
                        <span className="text-green-600">Seeded</span>
                      )}
                      {ch.status === "not-seeded" && (
                        <span className="text-zinc-400">Not seeded</span>
                      )}
                      {ch.status === "failed" && (
                        <span className="text-red-500">Failed</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {ch.generatedAt
                        ? new Date(ch.generatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {ch.sizeBytes
                        ? `${(ch.sizeBytes / 1024).toFixed(1)} KB`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {ch.status === "seeded" && (
                          <button
                            onClick={() =>
                              setPreviewChapter({
                                chapterId: ch.chapterId,
                                classLevel: ch.classLevel,
                              })
                            }
                            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleGenerate(
                              ch.chapterId,
                              ch.classLevel,
                              ch.status === "seeded"
                            )
                          }
                          disabled={isGenerating || bulkRunning}
                          className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                          {isGenerating
                            ? "..."
                            : ch.status === "seeded"
                              ? "Regen"
                              : "Generate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {previewChapter && (
        <ChapterLessonPreview
          chapterId={previewChapter.chapterId}
          classLevel={previewChapter.classLevel}
          onClose={() => setPreviewChapter(null)}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGate>
      <AdminContent />
    </AuthGate>
  );
}
