import type { Metadata } from "next";
import Link from "next/link";
import { LoginStageLoader } from "@/scene/StageLoader";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Enter Core — Astrid-Core",
  robots: { index: false, follow: false },
};

/**
 * Gate to the private area. The private side isn't built yet, so the form
 * is a stand-in: it accepts input and goes nowhere (PRODUCT.md, principle 3).
 */
export default function LoginPage() {
  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 sky-gradient" />
      <LoginStageLoader />
      <header className="fixed inset-x-0 top-0 z-40 px-14 pt-6 max-md:px-5 max-md:pt-4">
        <Link
          data-calm
          href="/"
          className="inline-flex h-11 items-center gap-2 font-pixel text-pixel-label text-ice transition-colors duration-[var(--dur-hover)] hover:text-vex-cyan"
        >
          <span aria-hidden>←</span>
          Go Back
        </Link>
      </header>
      <main className="flex min-h-dvh items-center justify-center px-5">
        <LoginForm />
      </main>
    </>
  );
}
