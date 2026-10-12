"use client";

import { useEffect, useRef } from "react";

let scrollLockCount = 0;
let previousBodyOverflow = "";

const escapeStack: symbol[] = [];

export function useOverlay(isOpen: boolean, onEscape?: () => void) {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!isOpen) return;

    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;

    const id = Symbol("overlay");
    escapeStack.push(id);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (escapeStack[escapeStack.length - 1] !== id) return;
      onEscapeRef.current?.();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      escapeStack.splice(escapeStack.indexOf(id), 1);

      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [isOpen]);
}
