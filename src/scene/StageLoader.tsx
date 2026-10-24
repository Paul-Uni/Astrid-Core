"use client";

import dynamic from "next/dynamic";

/** Loads the WebGL stage on the client only, after the DOM content has painted. */
const Stage = dynamic(() => import("./Stage"), { ssr: false });

export function StageLoader() {
  return <Stage />;
}
