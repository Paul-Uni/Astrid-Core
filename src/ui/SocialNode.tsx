"use client";

import { useState, useRef, useEffect } from "react";

type SocialNodeProps = {
  platform: "github" | "linkedin" | "discord";
  label: string;
  /** `href` for GitHub/LinkedIn; omit for Discord (copies instead). */
  href?: string;
  /** Discord username — copied to clipboard on click. */
  copyValue?: string;
};

/**
 * Social Node per DESIGN.md:
 * - 46px rotated square (void 0.85 bg, 1.5px cyan border 0.55, cyan glow)
 * - 24px icon centered
 * - Mono/Data label below ("GITHUB ↗", "LINKEDIN ↗", "DISCORD · COPY")
 * - Discord: copies username, label switches to "COPIED ✓" for 1.5s.
 *   If the clipboard is blocked, the label shows the username for 4s
 *   so it can be read and copied by hand.
 */
export function SocialNode({ platform, label, href, copyValue }: SocialNodeProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const showStatus = (next: "copied" | "failed", ms: number) => {
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), ms);
  };

  const handleCopy = async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      showStatus("copied", 1500);
    } catch {
      showStatus("failed", 4000);
    }
  };

  const content = (
    <>
      <span className="relative block size-16">
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="block size-[2.875rem] rotate-45 border-[1.5px] border-vex-cyan/55 bg-void/85 shadow-[var(--glow-cyan-soft)]"
          />
        </span>
        <img
          aria-hidden
          src={`/icons/${platform}.${platform === "linkedin" ? "svg" : "png"}`}
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2"
        />
      </span>
      <span
        aria-live={copyValue ? "polite" : undefined}
        className={
          "font-mono text-mono-data text-vex-cyan " +
          (status === "failed" ? "select-all normal-case" : "uppercase")
        }
      >
        {status === "copied" ? "COPIED ✓" : status === "failed" ? copyValue : label}
      </span>
    </>
  );

  const base =
    "flex flex-col items-center gap-2.5 transition-opacity duration-[var(--dur-hover)] hover:opacity-80 focus-visible:opacity-100";

  if (href) {
    return (
      <a
        data-calm
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${label} — opens in a new tab`}
        className={base}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      data-calm
      type="button"
      onClick={handleCopy}
      aria-label={`${label} — copies ${copyValue} to clipboard`}
      className={base}
    >
      {content}
    </button>
  );
}
