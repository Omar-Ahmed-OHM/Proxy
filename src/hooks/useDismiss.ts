import { useEffect, useRef, type RefObject } from "react";

export type DismissReason = "outside" | "escape";

export function useDismiss(
  containerRef: RefObject<HTMLElement | null>,
  onDismiss: (reason: DismissReason) => void,
  enabled: boolean,
) {
  const handlerRef = useRef(onDismiss);

  useEffect(() => {
    handlerRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (container && event.target instanceof Node && container.contains(event.target)) return;
      handlerRef.current("outside");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      handlerRef.current("escape");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, enabled]);
}
