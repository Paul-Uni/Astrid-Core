"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";

/**
 * Thin client wrapper that activates the rAF scroll reader.
 * Mounted once in page.tsx so Nav/OrbitRail/Hud subscribers stay in sync.
 */
export function ScrollProgressDriver() {
  useScrollProgress();
  return null;
}
