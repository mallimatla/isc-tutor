"use client";

import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import ChapterLessonPreview from "@/components/ChapterLessonPreview";
import { useIsAdmin } from "@/lib/use-is-admin";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";

interface ChapterStatus {
  chapterId: string;
  chapterLabel: string;
  classLevel: string;
  lessonId: string;
  status: "current" | "stale" | "not-seeded";
  promptVersion: string | null;
  generatedAt: string | null;
  beatCount: number;
  diagramCount: number;
  hasHeroImage: boolean;
  sizeBytes: number | null;
}

interface InventoryResponse {
  chapters: ChapterStatus[];
  summary: {
    total: number;
    current: number;
    stale: number;
    notSeeded: number;
    activeVersion: string;
  };
}

function AdminContent() {
  const isAdminUser = useIsAdmin();
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewChapter, setPreviewChapter] = useState<{
    chapterId: string;
    classLevel: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "current" | "stale" | "not-seeded">("all");
  const [classFilter, setClassFilter] = useState<"all" | "11" | "12">("all");

  const fetchInventory = useCallback(async () => {
    setLoading(true);
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

  const summary =
    inventory?.summary ?? {
      total: 0,
      current: 0,
      stale: 0,
      notSeeded: 0,
      activeVersion: "lesson-v3.0",
    };

  const filteredChapters = (inventory?.chapters ?? []).filter((ch) => {
    if (filter !== "all" && ch.status !== filter) return false;
    if (classFilter !== "all" && ch.classLevel !== classFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Chapter Lessons — Read-only Inventory
        </h1>

        {/* Banner */}
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <p className="font-medium">Lessons are generated locally, not from this dashboard.</p>
          <p className="mt-1 text-xs leading-relaxed text-blue-800 dark:text-blue-300">
            Run <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-blue-900">npm run seed:lessons</code> on a developer machine.
            Use <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-blue-900">--only=&lt;chapter-id&gt;</code> to seed one chapter, <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-blue-900">--force</code> to regenerate.
            This view shows what is currently in Firestore.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            {summary.current} of {summary.total} seeded on{" "}
            <span className="font-mono text-xs">{summary.activeVersion}</span>
          </span>
          <div className="flex-1 min-w-[140px] rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{
                width: `${summary.total > 0 ? (summary.current / summary.total) * 100 : 0}%`,
              }}
            />
          </div>
          {summary.stale > 0 && (
            <span className="text-xs text-amber-600">{summary.stale} stale (older version)</span>
          )}
          {summary.notSeeded > 0 && (
            <span className="text-xs text-zinc-500">{summary.notSeeded} not seeded</span>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All</option>
            <option value="current">Current</option>
            <option value="stale">Stale</option>
            <option value="not-seeded">Not seeded</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as typeof classFilter)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All Classes</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>

          <button
            onClick={fetchInventory}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Class</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Chapter</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Beats</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Diagrams</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Hero img</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Generated</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Size</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredChapters.map((ch) => (
                <tr key={ch.lessonId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{ch.classLevel}</td>
                  <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{ch.chapterLabel}</td>
                  <td className="px-3 py-2">
                    {ch.status === "current" && (
                      <span className="text-green-600">Current</span>
                    )}
                    {ch.status === "stale" && (
                      <span title={ch.promptVersion ?? ""} className="text-amber-600">
                        Stale ({ch.promptVersion ?? "?"})
                      </span>
                    )}
                    {ch.status === "not-seeded" && (
                      <span className="text-zinc-400">Not seeded</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {ch.beatCount || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {ch.diagramCount || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {ch.hasHeroImage ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
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
                    {ch.status !== "not-seeded" && (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
