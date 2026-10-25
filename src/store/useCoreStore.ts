"use client";

import { create } from "zustand";

/** Core Gate state shared between the DOM (Enter Core) and the WebGL core. */
export const useCoreStore = create<{ hover: boolean }>(() => ({ hover: false }));
