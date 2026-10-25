import type { SVGProps } from "react";

type IconeProps = SVGProps<SVGSVGElement>;

const base: IconeProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const Search = (p: IconeProps) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></svg>
);
export const Heart = (p: IconeProps) => (
  <svg {...base} {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
);
export const User = (p: IconeProps) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const Cart = (p: IconeProps) => (
  <svg {...base} {...p}><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M1 2h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
);
export const Menu = (p: IconeProps) => (
  <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const Pencil = (p: IconeProps) => (
  <svg {...base} width={16} height={16} {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);
export const Trash = (p: IconeProps) => (
  <svg {...base} width={16} height={16} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
);
export const Close = (p: IconeProps) => (
  <svg {...base} width={28} height={28} {...p}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
