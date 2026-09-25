"use client";

import React, { ReactNode, useState } from "react";
import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";

type TooltipVariant = "default" | "dark" | "light" | "dark-plain";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  variant?: TooltipVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<TooltipVariant, string> = {
  default:
    "bg-white text-gray-700 border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700",
  dark: "bg-gray-950 text-white border border-gray-800 dark:bg-gray-800 dark:border-gray-700",
  light: "bg-white text-gray-700 shadow-lg dark:bg-gray-900 dark:text-white",
  "dark-plain": "bg-gray-950 text-white shadow-lg dark:bg-gray-800",
};

const ARROW_BORDER_CLASSES: Record<string, string> = {
  top: "border-r border-b",
  bottom: "border-l border-t",
  left: "border-r border-t",
  right: "border-l border-b",
};

const ARROW_SIZE = 12;

function getArrowStyle(
  side: string,
  x: number | undefined,
  y: number | undefined,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    transform: "rotate(45deg)",
  };
  const edgeOffset = -ARROW_SIZE / 2;

  switch (side) {
    case "top":
      return { ...base, bottom: edgeOffset, left: x != null ? x : "50%" };
    case "bottom":
      return { ...base, top: edgeOffset, left: x != null ? x : "50%" };
    case "left":
      return { ...base, right: edgeOffset, top: y != null ? y : "50%" };
    case "right":
      return { ...base, left: edgeOffset, top: y != null ? y : "50%" };
    default:
      return base;
  }
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  variant = "default",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "none" }),
      shift({ padding: 8 }),
      arrow({ element: arrowElement, padding: 8 }),
    ],
  });

  const hover = useHover(context, { move: false, delay: { open: 100 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const hasArrow = variant === "default" || variant === "dark";
  const side = context.placement.split("-")[0];
  const { x: arrowX, y: arrowY } = context.middlewareData.arrow ?? {};

  return (
    <>
      <span
        ref={setReference}
        {...getReferenceProps()}
        className={`inline-flex ${className}`}
      >
        {children}
      </span>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={`z-99999 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap shadow-md ${VARIANT_CLASSES[variant]}`}
          >
            {content}
            {hasArrow && (
              <div
                ref={setArrowElement}
                style={getArrowStyle(side, arrowX, arrowY)}
                className={`${
                  variant === "dark"
                    ? "border-gray-800 bg-gray-950 dark:border-gray-700 dark:bg-gray-800"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1E2634]"
                } ${ARROW_BORDER_CLASSES[side] ?? ""}`}
              />
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};
