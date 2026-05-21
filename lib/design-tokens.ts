/**
 * Design tokens for ISC Tutor.
 *
 * Reference apps: Brilliant, Duolingo, Linear.
 *
 * The visual language is deliberately quiet:
 *   • Near-white slate background, lots of whitespace.
 *   • ONE primary accent (indigo) used sparingly on real calls-to-action
 *     and active states. Per-chapter theme gradients from lib/chapter-theme
 *     remain ONLY for hero banners and small chapter-coded accents; they are
 *     never used for full-screen washes.
 *   • Cards are white, rounded-2xl, border-slate-100, shadow-sm, with a
 *     hover lift via shadow-md.
 *   • Subtle motion only: fade-up on mount, active:scale-95 on buttons,
 *     short transitions. Anything flashy is wrong here. `prefers-reduced-motion`
 *     disables all of it (see app/globals.css).
 *
 * Most components reach for Tailwind utility classes directly — these tokens
 * exist so we (and reviewers) can grep one file to find the canonical values.
 */

export const tokens = {
  // ---------- Color ----------
  /** Single primary accent. Used for the primary CTA, active tab, and key highlights. */
  accent: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-500",
    text: "text-indigo-600",
    ring: "ring-indigo-500",
    border: "border-indigo-500",
    /** raw hex if a component needs it (e.g. inline SVG fill) */
    hex: "#6366F1",
  },
  surface: {
    /** Page background — calm, near-white. */
    page: "bg-slate-50",
    /** Card background. */
    card: "bg-white",
    /** Subtle muted card (e.g. for skeleton or empty states). */
    cardMuted: "bg-slate-50",
  },
  border: {
    soft: "border-slate-100",
    medium: "border-slate-200",
  },
  text: {
    heading: "text-slate-900",
    body: "text-slate-600",
    muted: "text-slate-500",
    subtle: "text-slate-400",
  },

  // ---------- Type scale ----------
  type: {
    pageTitle: "text-3xl font-bold tracking-tight text-slate-900",
    sectionTitle: "text-xl font-semibold text-slate-900",
    cardTitle: "text-base font-semibold text-slate-900",
    body: "text-base leading-relaxed text-slate-600",
    meta: "text-xs uppercase tracking-wide text-slate-400",
  },

  // ---------- Spacing rhythm ----------
  rhythm: {
    /** Vertical gap between major sections on a page. */
    section: "space-y-8",
    /** Vertical gap between elements inside a card. */
    inCard: "space-y-4",
    /** Standard card padding. */
    cardPadding: "p-6",
  },

  // ---------- Containers ----------
  container: {
    narrow: "mx-auto w-full max-w-2xl px-4",
    wide: "mx-auto w-full max-w-4xl px-4",
  },

  // ---------- Buttons ----------
  button: {
    primary:
      "inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 hover:shadow disabled:opacity-50 disabled:active:scale-100",
    secondary:
      "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-95 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:active:scale-100",
    tertiary:
      "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900",
    /** Small/compact secondary, e.g. inline pill buttons. */
    pill:
      "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95 hover:border-slate-300 hover:bg-slate-50",
  },

  // ---------- Card primitives ----------
  card: {
    base:
      "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition",
    hoverable:
      "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-200",
  },

  // ---------- Motion ----------
  motion: {
    fadeUp: "animate-fade-up",
    fadeIn: "animate-fade-in",
    /** Use for repeating skeleton blocks. */
    shimmer: "skeleton-shimmer",
  },
};

export type DesignTokens = typeof tokens;
