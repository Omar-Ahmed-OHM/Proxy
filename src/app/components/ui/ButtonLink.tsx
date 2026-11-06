import Link from "next/link";
import { buttonStyles } from "./Button";
import type { ButtonLinkProps } from "./types";

export function ButtonLink({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link {...linkProps} className={buttonStyles({ variant, size, fullWidth, className })}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
