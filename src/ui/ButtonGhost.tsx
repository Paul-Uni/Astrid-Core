import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Common = {
  children: ReactNode;
  className?: string;
};

type AnchorProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/**
 * Button/Ghost per DESIGN.md:
 * - Pixel/Label (16px), vex-cyan text
 * - 1px vex-cyan border (0.8), fill vex-cyan 0.06
 * - padding 16/24
 * - Hover (fine pointers): fill cyan 0.14
 * - Active: scale(0.97) 160ms ease-out
 * - Focus-visible: 2px vex-cyan outline, 2px offset (inherited from globals.css)
 */
export function ButtonGhost(props: AnchorProps | ButtonProps) {
  const base =
    "inline-flex items-center font-pixel text-pixel-label uppercase px-6 py-4 " +
    "text-vex-cyan border border-vex-cyan/80 bg-vex-cyan/6 hover:bg-vex-cyan/14 " +
    "transition-[background-color,transform] duration-[var(--dur-hover)] ease-[var(--ease-out)] " +
    "active:scale-[0.97]";
  const className = `${base} ${props.className ?? ""}`;

  if ("href" in props && props.href !== undefined) {
    const { children, className: _c, ...rest } = props;
    return (
      <a {...rest} className={className}>
        {children}
      </a>
    );
  }
  const { children, className: _c, ...rest } = props;
  return (
    <button type="button" {...rest} className={className}>
      {children}
    </button>
  );
}
