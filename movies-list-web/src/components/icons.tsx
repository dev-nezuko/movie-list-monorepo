import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { fill: "currentColor", "aria-hidden": true, focusable: false } as const;

export const PlusIcon = (props: IconProps) => (
  <svg width="32" height="32" viewBox="0 0 32 32" {...base} {...props}>
    <path d="M17.33 9.33h-2.66v5.34H9.33v2.66h5.34v5.34h2.66v-5.34h5.34v-2.66h-5.34V9.33ZM16 2.67C8.64 2.67 2.67 8.64 2.67 16S8.64 29.33 16 29.33 29.33 23.36 29.33 16 23.36 2.67 16 2.67Zm0 24c-5.88 0-10.67-4.79-10.67-10.67S10.12 5.33 16 5.33 26.67 10.12 26.67 16 21.88 26.67 16 26.67Z" />
  </svg>
);

export const LogoutIcon = (props: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 32 32" {...base} {...props}>
    <path d="m22.67 10.67-1.88 1.88 2.1 2.12H12v2.66h10.89l-2.1 2.11 1.88 1.9L28 16l-5.33-5.33ZM6.67 6.67H16V4H6.67A2.68 2.68 0 0 0 4 6.67v18.66C4 26.8 5.2 28 6.67 28H16v-2.67H6.67V6.67Z" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...props}>
    <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2Zm-1-4-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5Z" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 21" {...base} {...props}>
    <path d="M18.15 4.71h-4.08V2.6A2.08 2.08 0 0 0 12.04.5H7.96a2.08 2.08 0 0 0-2.04 2.1v2.11H1.85a1.04 1.04 0 0 0 0 2.1h1.02v11.58c0 1.17.91 2.11 2.04 2.11h10.18c1.13 0 2.04-.94 2.04-2.1V6.81h1.02a1.04 1.04 0 0 0 0-2.1ZM7.96 2.6h4.08v2.11H7.96V2.6Zm1.02 13.69a1.03 1.03 0 1 1-2.04 0V8.92a1.03 1.03 0 1 1 2.04 0v7.37Zm4.07 0a1.03 1.03 0 1 1-2.04 0V8.92a1.03 1.03 0 1 1 2.04 0v7.37Z" />
  </svg>
);
