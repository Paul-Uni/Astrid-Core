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
    "transition-[background-color,transform] duration-[var(--dur-hover)] ease-[var(--ease-out)] " +
    "hover:[&]:[background-color:rgb(111_242_230_/_0.14)] active:scale-[0.97]";
  const style = {
    color: "var(--color-vex-cyan)",
    backgroundColor: "rgb(111 242 230 / 0.06)",
    border: "1px solid rgb(111 242 230 / 0.8)",
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
