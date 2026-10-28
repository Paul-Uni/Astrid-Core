"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { Material } from "three";

/** Give up waiting after this long and just start (a driver that never reports ready). */
const MAX_WAIT = 4000;
/** Main-thread time per poll tick for first-use setup, so no tick becomes a long task (ms). */
const TICK_BUDGET = 8;

type WarmProgram = { isReady(): boolean; getUniforms(): unknown; getAttributes(): unknown };

/**
 * Compiles every shader before the first frame, without blocking the page.
 *
 * Normally three links each shader program inside the first render and the main thread waits for
 * the GPU driver (hundreds of ms on a laptop, the page freezes). Here one dry frame runs instead:
 * all useFrame callbacks and the effect composer go through their passes, but every `gl.render`
 * only creates the programs (`gl.compile`), each with the render target that pass really uses,
 * so the variants match the real frames. Then it polls until the driver reports them linked
 * (KHR_parallel_shader_compile, non-blocking) and calls `onDone`.
 *
 * Mount last inside the Canvas and hold the Canvas frameloop at "never" until `onDone`.
 */
export function Warmup({ onDone }: { onDone: () => void }) {
  // The renderer is patched for one call below: read it from the store, not as a render value.
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { gl, advance, clock } = get();
    let alive = true;
    let timer = 0;
    let rendered = false;
    const pending = new Set<Material>();
    // Reading back shader logs is a synchronous GPU round trip per program; only worth it while developing.
    gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";

    /** One frame where every gl.render only creates programs. False if nothing rendered yet. */
    const dryFrame = () => {
      const render = gl.render;
      gl.render = (scene, camera) => {
        rendered = true;
        for (const m of gl.compile(scene, camera)) pending.add(m);
      };
      try {
        // Same time as now: in "never" mode advance() sets the clock to this value.
        advance(clock.elapsedTime);
      } finally {
        gl.render = render;
      }
      return rendered;
    };

    // A linked program still costs a burst of synchronous GPU queries on first use (uniform and
    // attribute lookup). Do that here, a few programs per tick, instead of all inside frame one.
    const start = performance.now();
    const poll = () => {
      if (!alive) return;
      // The effect composer sets itself up in a state update after mount and draws nothing
      // until then: retry the dry frame until something was actually rendered.
      if (!rendered && !dryFrame() && performance.now() - start < MAX_WAIT) {
        timer = window.setTimeout(poll, 0);
        return;
      }
      const tick = performance.now();
      for (const m of pending) {
        const program = (gl.properties.get(m) as { currentProgram?: WarmProgram }).currentProgram;
        if (program && !program.isReady()) continue;
        program?.getUniforms();
        program?.getAttributes();
        pending.delete(m);
        if (performance.now() - tick > TICK_BUDGET) break;
      }
      if (pending.size === 0 || performance.now() - start > MAX_WAIT) onDone();
      else timer = window.setTimeout(poll, 10);
    };
    timer = window.setTimeout(poll, 0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [get, onDone]);

  return null;
}
