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
 * - Discord: copies username, label switches to "COPIED ✓" for 1.5s
 */
export function SocialNode({ platform, label, href, copyValue }: SocialNodeProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleCopy = async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied — stay silent, label stays as-is
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
            className="block size-[2.875rem] rotate-45"
            style={{
              backgroundColor: "rgb(7 10 31 / 0.85)",
              border: "1.5px solid rgb(111 242 230 / 0.55)",
              boxShadow: "0 0 0.625rem rgb(111 242 230 / 0.25)",
            }}
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
        className="font-mono text-mono-data uppercase"
        style={{ color: "var(--color-vex-cyan)" }}
      >
        {copied ? "COPIED ✓" : label}
      </span>
    </>
  );

  const base =
    "flex flex-col items-center gap-2.5 transition-opacity duration-[var(--dur-hover)] hover:opacity-80 focus-visible:opacity-100";

  if (href) {
    return (
      <a
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
      type="button"
      onClick={handleCopy}
      aria-label={`${label} — copies ${copyValue} to clipboard`}
      className={base}
    >
      {content}
    </button>
  );
}
