"use client";

import { createPortal } from "react-dom";

export function ModalPortal({ children }: { children: React.ReactNode }) {
  return typeof document === "undefined" ? null : createPortal(children, document.body);
}
