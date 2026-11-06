import Link from "next/link";
import { isActiveRoute, primaryNavigation } from "./navigation";
import { cn } from "@/lib/cn";
import type { NavLayout, NavItemsProps } from "./types";

const layoutClasses: Record<NavLayout, { list: string; link: string; active: string; idle: string }> = {
  sidebar: {
    list: "flex flex-col gap-1.5",
    link: "flex h-12 items-center gap-3.5 rounded-xl px-4 text-[0.9375rem] font-medium md:justify-center md:px-0 lg:justify-start lg:px-4",
    active: "bg-linear-to-r from-primary to-primary-end text-white shadow-glow",
    idle: "text-muted hover:bg-elevated/70 hover:text-foreground",
  },
  bar: {
    list: "grid grid-cols-5",
    link: "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-medium",
    active: "text-foreground",
    idle: "text-muted hover:text-foreground",
  },
};

export function NavItems({ layout, pathname }: NavItemsProps) {
  const styles = layoutClasses[layout];
  const items = layout === "bar" ? primaryNavigation.filter((item) => item.mobile) : primaryNavigation;

  return (
    <ul className={styles.list}>
      {items.map(({ label, href, icon: Icon }) => {
        const active = isActiveRoute(href, pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              title={layout === "sidebar" ? label : undefined}
              className={cn(styles.link, "transition-[background-color,color,box-shadow] duration-150", active ? styles.active : styles.idle)}
            >
              <Icon
                size={layout === "sidebar" ? 22 : 20}
                aria-hidden="true"
                className={cn("shrink-0", layout === "bar" && active && "text-primary-soft")}
              />
              <span className={layout === "sidebar" ? "md:sr-only lg:not-sr-only" : undefined}>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
