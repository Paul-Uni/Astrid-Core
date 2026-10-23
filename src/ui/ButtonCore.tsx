import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Common = {
  children: ReactNode;
  className?: string;
};
type AnchorProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * Button/Core per DESIGN.md:
 * - Pixel/Label (16px), ice text
 * - magenta-core fill, --glow-magenta box-shadow
 * - padding 16/24
 * - Hover (fine pointers): glow grows to 36px (--glow-magenta-hover)
 * - Active: scale(0.97) 160ms ease-out
 * - Focus-visible: 2px ice outline (overrides the default cyan)
 */
export function ButtonCore(props: AnchorProps | ButtonProps) {
  const base =
    "inline-flex items-center gap-3 font-pixel text-pixel-label uppercase px-6 py-4 " +
    "transition-[box-shadow,transform] duration-[var(--dur-hover)] ease-[var(--ease-out)] " +
    "hover:[box-shadow:var(--glow-magenta-hover)] active:scale-[0.97] focus-visible:[outline-color:var(--color-ice)]";
  const style = {
    color: "var(--color-ice)",
    backgroundColor: "var(--color-magenta-core)",
    boxShadow: "var(--glow-magenta)",
  } as const;
  const className = `${base} ${props.className ?? ""}`;

  if ("href" in props && props.href !== undefined) {
    const { children, className: _c, style: _s, ...rest } = props;
    return (
      <a {...rest} className={className} style={style}>
        {children}
      </a>
    );
  }
  const { children, className: _c, style: _s, ...rest } = props;
  return (
    <button type="button" {...rest} className={className} style={style}>
      {children}
    </button>
  );
}
