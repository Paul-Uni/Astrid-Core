"use client";

import { create } from "zustand";
import { STATIONS, type StationId } from "@/tokens/stations";

export type ScrollState = {
  /** Global page progress, 0..1 (document-relative). */
  progress: number;
  /** Active station index 0..5 (floor of continuous position). */
  station: StationId;
  /** Fractional position within the current station, 0..1. */
  stationFrac: number;
  /** Camera angle in degrees, 0..300 (interpolated across stations). */
  theta: number;
  /** Camera depth in world units, 0..3700. */
  depth: number;
};

const DEPTH_MAX = STATIONS[STATIONS.length - 1]!.depth;
const THETA_MAX = STATIONS[STATIONS.length - 1]!.theta;

export const useScrollStore = create<ScrollState>(() => ({
  progress: 0,
  station: 0,
  stationFrac: 0,
  theta: 0,
  depth: 0,
}));

/**
 * Writes scroll state derived from which DOM section is active and how
 * far through it we've scrolled.
 *
 * Called from the rAF reader (useScrollProgress hook). Honours whatever
 * heights the sections actually have in the DOM, so jumping to a `#slug`
 * lights up the matching rail diamond regardless of per-section height.
 */
export function writeFromSections(currentIndex: number, frac: number) {
  const clampedFrac = Math.max(0, Math.min(1, frac));
  const safeIndex = Math.max(0, Math.min(currentIndex, STATIONS.length - 1));
  const nextIndex = Math.min(safeIndex + 1, STATIONS.length - 1);

  const a = STATIONS[safeIndex]!;
  const b = STATIONS[nextIndex]!;

  const theta = Math.round(a.theta + (b.theta - a.theta) * clampedFrac);
  const depth = Math.round(a.depth + (b.depth - a.depth) * clampedFrac);
  const stationId = (clampedFrac >= 0.5 ? nextIndex : safeIndex) as StationId;
  const progress = (safeIndex + clampedFrac) / (STATIONS.length - 1);

  useScrollStore.setState({
    progress,
    station: stationId,
    stationFrac: clampedFrac,
    theta,
    depth,
  });
}

export const SCROLL_LIMITS = { DEPTH_MAX, THETA_MAX } as const;
