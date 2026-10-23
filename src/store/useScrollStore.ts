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
 * Writes a new scroll state derived from page progress.
 * Called from the rAF reader (useScrollProgress hook) — zoom-agnostic
 * because `progress` is a ratio of the scrolled document, not a px value.
 */
export function writeFromProgress(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));

  // Piecewise-linear interpolation across the 6 stations.
  const scaled = clamped * (STATIONS.length - 1);     // 0..5
  const stationFloor = Math.min(Math.floor(scaled), STATIONS.length - 2);
  const frac = scaled - stationFloor;

  const a = STATIONS[stationFloor]!;
  const b = STATIONS[stationFloor + 1]!;

  const theta = Math.round(a.theta + (b.theta - a.theta) * frac);
  const depth = Math.round(a.depth + (b.depth - a.depth) * frac);
  const stationId = (frac >= 0.5 ? stationFloor + 1 : stationFloor) as StationId;

  useScrollStore.setState({
    progress: clamped,
    station: stationId,
    stationFrac: frac,
    theta,
    depth,
  });
}

export const SCROLL_LIMITS = { DEPTH_MAX, THETA_MAX } as const;
