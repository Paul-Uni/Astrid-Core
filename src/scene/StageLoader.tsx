"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/** Panels boot first (fonts + up to ~0.6s of power-on); the stage mounts after, so its first frame can't hold them back. */
const MOUNT_DELAY = 700;

/**
 * Mounts a stage once the page content has painted and powered on. The chunk is
 * requested right away, so the delay only holds back the (main-thread heavy)
 * WebGL setup. Without the boot (reduced motion, or a page without PanelPowerOn
 * like /login) it mounts straight away.
 */
function useAfterBoot(preload: () => Promise<unknown>) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    void preload();
    // PanelPowerOn flags `powerReady` in its own effect, which runs after this one: read it a tick later.
    let id = window.setTimeout(() => {
      id = window.setTimeout(() => setGo(true), document.documentElement.dataset.powerReady ? MOUNT_DELAY : 0);
    }, 0);
    return () => window.clearTimeout(id);
  }, [preload]);
  return go;
}

const loadStage = () => import("./Stage");
/** Loads the WebGL stage on the client only, after the DOM content has painted. */
const Stage = dynamic(loadStage, { ssr: false });

export function StageLoader() {
  const go = useAfterBoot(loadStage);
  return go ? <Stage /> : null;
}

const loadLoginStage = () => import("./LoginStage");
const LoginStage = dynamic(loadLoginStage, { ssr: false });

/** The login page's backdrop (dust, cubes, floor grid), client only. */
export function LoginStageLoader() {
  const go = useAfterBoot(loadLoginStage);
  return go ? <LoginStage /> : null;
}
