"use client";

import { useCoreStore } from "@/store/useCoreStore";
import { ButtonCore } from "./ButtonCore";

const setHover = (hover: boolean) => useCoreStore.setState({ hover });

/**
 * Core Gate (References/"example lock"). The lock itself is WebGL
 * (scene/CoreLock): a glass padlock hovering over the gravity well's mouth.
 * Below the well, Button/Core (solid) "ENTER CORE"; the beam dims down the
 * throat at this station, so the button never sits on a bright line. Hover
 * or focus on the button sets the core store: the lock edge turns magenta,
 * the core light turns dusk pink and the heartbeat speeds up (corePulse).
 *
 * The wrapper is a zero-size point at the well's mouth.
 * data-core-anchor marks it so the stream lines the lock up with it.
 */
export function CoreGate({ href = "#login" }: { href?: string }) {
  return (
    <div data-core-anchor className="relative size-0">
      <ButtonCore
        href={href}
        className="absolute left-0 top-[11rem] -translate-x-1/2 whitespace-nowrap"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        Enter Core
        <span aria-hidden>→</span>
      </ButtonCore>
    </div>
  );
}
