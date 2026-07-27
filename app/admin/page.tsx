"use client";

import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import ChapterLessonPreview from "@/components/ChapterLessonPreview";
import { useIsAdmin } from "@/lib/use-is-admin";
import { apiFetch } from "@/lib/api-client";
import { listSubjects, type SubjectId } from "@/lib/subjects";
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

function StatusPill({ status, version }: { status: ChapterStatus["status"]; version: string | null }) {
  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Current
      </span>
    );
  }
  if (status === "stale") {
    return (
      <span
        title={version ?? ""}
        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Stale
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Not seeded
    </span>
  );
}

function AdminContent() {
  const isAdminUser = useIsAdmin();
  const subjects = listSubjects();
  const [subject, setSubject] = useState<SubjectId>("mathematics");
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewChapter, setPreviewChapter] = useState<{
    chapterId: string;
    classLevel: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "current" | "stale" | "not-seeded">("all");
  const [classFilter, setClassFilter] = useState<"all" | "11" | "12">("all");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<{ running: boolean; done: number; total: number; failed: number }>({
    running: false,
    done: 0,
    total: 0,
    failed: 0,
  });
  const [genError, setGenError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<InventoryResponse>(
        `/api/admin/lessons?subject=${subject}`
      );
      setInventory(data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    if (isAdminUser) fetchInventory();
  }, [isAdminUser, fetchInventory]);

  if (!isAdminUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-sm text-slate-500">Not authorized.</p>
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
          Back to home
        </Link>
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

  const pending = (inventory?.chapters ?? []).filter((c) => c.status !== "current");

  const setBusyFor = (lessonId: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(lessonId);
      else next.delete(lessonId);
      return next;
    });

  const markGenerated = (
    lessonId: string,
    res: { beatCount: number; diagramCount: number }
  ) => {
    setInventory((prev) => {
      if (!prev) return prev;
      const chapters = prev.chapters.map((c) =>
        c.lessonId === lessonId
          ? {
              ...c,
              status: "current" as const,
              promptVersion: prev.summary.activeVersion,
              beatCount: res.beatCount,
              diagramCount: res.diagramCount,
              generatedAt: new Date().toISOString(),
            }
          : c
      );
      return {
        chapters,
        summary: {
          ...prev.summary,
          current: chapters.filter((c) => c.status === "current").length,
          stale: chapters.filter((c) => c.status === "stale").length,
          notSeeded: chapters.filter((c) => c.status === "not-seeded").length,
        },
      };
    });
  };

  const generateOne = async (ch: ChapterStatus, force = false) => {
    setGenError(null);
    setBusyFor(ch.lessonId, true);
    try {
      const res = await apiFetch<{
        status: string;
        beatCount: number;
        diagramCount: number;
      }>("/api/admin/lessons/generate", {
        method: "POST",
        body: JSON.stringify({
          subject,
          classLevel: ch.classLevel,
          chapterId: ch.chapterId,
          force,
        }),
      });
      if (res.status === "current") markGenerated(ch.lessonId, res);
      return true;
    } catch (e) {
      setGenError(
        `${ch.chapterLabel}: ${e instanceof Error ? e.message : "generation failed"}`
      );
      return false;
    } finally {
      setBusyFor(ch.lessonId, false);
    }
  };

  const generateAllMissing = async () => {
    if (pending.length === 0 || bulk.running) return;
    setGenError(null);
    setBulk({ running: true, done: 0, total: pending.length, failed: 0 });
    let done = 0;
    let failed = 0;
    for (const ch of pending) {
      const ok = await generateOne(ch, ch.status === "stale");
      done += 1;
      if (!ok) failed += 1;
      setBulk({ running: true, done, total: pending.length, failed });
    }
    setBulk({ running: false, done, total: pending.length, failed });
  };

  const pct = summary.total > 0 ? (summary.current / summary.total) * 100 : 0;
  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chapter Lessons</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Read-only inventory of what&apos;s seeded in Firestore.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 self-start rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  subject === s.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-900">
          <p className="font-semibold">Generate lessons right here.</p>
          <p className="mt-1.5 text-xs leading-relaxed text-indigo-800">
            Use <span className="font-semibold">Generate</span> on any row, or{" "}
            <span className="font-semibold">Generate all missing</span> below, to
            create illustrated lessons (narrative + diagrams) in the cloud — no
            local setup. Each chapter takes ~30–60s and runs one at a time.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-indigo-700">
            Prefer the command line, or want to seed the question bank? Run locally:{" "}
            <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-[11px]">
              npm run seed:lessons -- --subject={subject}
            </code>{" "}
            and{" "}
            <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-[11px]">
              npm run seed:questions -- --subject={subject}
            </code>
            .
          </p>
        </div>

        {genError && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {genError}
            <button
              onClick={() => setGenError(null)}
              className="ml-2 text-xs font-medium text-rose-600 underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-700">
            {summary.current} of {summary.total} seeded
            <span className="ml-1.5 font-mono text-xs text-slate-400">
              {summary.activeVersion}
            </span>
          </span>
          <div className="h-2 min-w-[160px] flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {summary.stale > 0 && (
            <span className="text-xs font-medium text-amber-600">
              {summary.stale} stale
            </span>
          )}
          {summary.notSeeded > 0 && (
            <span className="text-xs font-medium text-slate-500">
              {summary.notSeeded} not seeded
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className={selectClass}
          >
            <option value="all">All statuses</option>
            <option value="current">Current</option>
            <option value="stale">Stale</option>
            <option value="not-seeded">Not seeded</option>
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as typeof classFilter)}
            className={selectClass}
          >
            <option value="all">All classes</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
          <button
            onClick={fetchInventory}
            disabled={bulk.running}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>

          <div className="ml-auto">
            <button
              onClick={generateAllMissing}
              disabled={bulk.running || pending.length === 0}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {bulk.running
                ? `Generating ${bulk.done}/${bulk.total}…`
                : pending.length > 0
                  ? `Generate all missing (${pending.length})`
                  : "All lessons current"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Class", "Chapter", "Status", "Beats", "Diagrams", "Hero", "Generated", "Size"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    Loading inventory…
                  </td>
                </tr>
              ) : filteredChapters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    No chapters match these filters.
                  </td>
                </tr>
              ) : (
                filteredChapters.map((ch) => (
                  <tr key={ch.lessonId} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-500">{ch.classLevel}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{ch.chapterLabel}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={ch.status} version={ch.promptVersion} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ch.beatCount || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{ch.diagramCount || "—"}</td>
                    <td className="px-4 py-3">
                      {ch.hasHeroImage ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {ch.generatedAt ? new Date(ch.generatedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {ch.sizeBytes ? `${(ch.sizeBytes / 1024).toFixed(1)} KB` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {busy.has(ch.lessonId) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                            Generating…
                          </span>
                        ) : (
                          <>
                            {ch.status !== "not-seeded" && (
                              <button
                                onClick={() =>
                                  setPreviewChapter({
                                    chapterId: ch.chapterId,
                                    classLevel: ch.classLevel,
                                  })
                                }
                                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                              >
                                Preview
                              </button>
                            )}
                            <button
                              onClick={() => generateOne(ch, ch.status !== "not-seeded")}
                              disabled={bulk.running}
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40"
                            >
                              {ch.status === "not-seeded" ? "Generate" : "Regenerate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
