"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/app/components/shared/SearchBar";
import type { HeaderSearchProps } from "./types";

export function HeaderSearch({ className }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      onSubmit={(value) => router.push(`/tasks?q=${encodeURIComponent(value)}`)}
      placeholder="Search anything…"
      aria-label="Search"
      showShortcut
      className={className}
    />
  );
}
