import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Common = {
  children: ReactNode;
  className?: string;
  /** solid: the default magenta CTA. outline: magenta frame that fades to translucent pink on hover/focus (Core Gate, login arrow). */
  variant?: "solid" | "outline";
  /** outline only: solid fills instead of translucent ones (Core Gate). */
  opaque?: boolean;
  /** compact: nav size (padding 8/14) instead of 16/24. */
  compact?: boolean;
};
type AnchorProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * Button/Core per DESIGN.md:
 * - Pixel/Label (16px), ice text
 * - --cta-fill (magenta-core deepened 20% toward void, so ice text passes
 *   WCAG AA at ≈4.9:1; pure magenta-core gives 3.5:1), --glow-magenta
 * - padding 16/24
 * - Hover (fine pointers): glow grows to 36px (--glow-magenta-hover)
 * - Active: scale(0.97) 160ms ease-out
 * - Focus-visible: 2px ice outline (overrides the default cyan)
 * - Outline variant (Core Gate, login arrow): 1px magenta frame at 70%, void 55% fill,
 *   dusk-pink text. On hover/focus it fades up over 200ms (plain ease; the
 *   press scale stays 160ms) instead of
 *   snapping: frame to full magenta, fill to --cta-fill (the Enter Core pink) at 55%, translucent, the glow
 *   grows to --glow-magenta-hover, text turns ice
 */
export function ButtonCore(props: AnchorProps | ButtonProps) {
  // Full class names so Tailwind can see them.
  const fill = props.opaque
    ? "bg-void hover:bg-[var(--cta-fill)] focus-visible:bg-[var(--cta-fill)]"
    : "bg-void/55 hover:bg-[color-mix(in_srgb,var(--cta-fill)_55%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--cta-fill)_55%,transparent)]";
  const look =
    props.variant === "outline"
      ? `border border-magenta-core/70 ${fill} text-dusk-pink shadow-[var(--glow-magenta)] ` +
        "[transition:background-color_var(--dur-fade)_ease,border-color_var(--dur-fade)_ease,color_var(--dur-fade)_ease,box-shadow_var(--dur-fade)_ease,transform_var(--dur-hover)_var(--ease-out)] " +
        `hover:border-magenta-core hover:text-ice hover:shadow-[var(--glow-magenta-hover)] ` +
        `focus-visible:border-magenta-core focus-visible:text-ice focus-visible:shadow-[var(--glow-magenta-hover)]`
      : "text-ice bg-[var(--cta-fill)] shadow-[var(--glow-magenta)] hover:shadow-[var(--glow-magenta-hover)] " +
        "transition-[box-shadow,transform,background-color,color] duration-[var(--dur-hover)] ease-[var(--ease-out)]";
  const base =
    `inline-flex items-center gap-3 font-pixel text-pixel-label uppercase ${props.compact ? "px-3.5 py-2" : "px-6 py-4"} ` +
        "active:scale-[0.97] focus-visible:[outline-color:var(--color-ice)]";
  const className = `${base} ${look} ${props.className ?? ""}`;

  if ("href" in props && props.href !== undefined) {
    const { children, className: _c, variant: _v, opaque: _o, compact: _s, ...rest } = props;
    return (
      <a {...rest} className={className}>
        {children}
      </a>
    );
  }
  const { children, className: _c, variant: _v, opaque: _o, compact: _s, ...rest } = props;
  return (
    <button type="button" {...rest} className={className}>
      {children}
    </button>
  );
}
