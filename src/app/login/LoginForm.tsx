"use client";

import { ButtonCore } from "@/ui/ButtonCore";

/**
 * Boxed "Enter Password" field with the boxed arrow button beneath
 * (References/"lock screen exlpl"). Submitting does nothing yet.
 */
export function LoginForm() {
  return (
    <form data-calm onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-[22rem] flex-col items-center gap-4">
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Enter Password"
        autoComplete="current-password"
        className="w-full border border-vex-cyan/60 bg-void/55 px-4 py-3.5 font-mono text-body-m text-ice backdrop-blur-sm outline-none transition-colors duration-[var(--dur-hover)] placeholder:text-ice/75 focus:border-vex-cyan"
      />
      <ButtonCore type="submit" variant="outline" aria-label="Enter" className="justify-center">
        <span aria-hidden>→</span>
      </ButtonCore>
    </form>
  );
}
