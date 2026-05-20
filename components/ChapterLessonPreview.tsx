"use client";

import ChapterLesson from "@/components/ChapterLesson";

interface ChapterLessonPreviewProps {
  chapterId: string;
  classLevel: string;
  onClose: () => void;
}

export default function ChapterLessonPreview({
  chapterId,
  classLevel,
  onClose,
}: ChapterLessonPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Preview
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Close
          </button>
        </div>
        <ChapterLesson
          chapterId={chapterId}
          classLevel={classLevel}
          onGotIt={onClose}
        />
      </div>
    </div>
  );
}
