"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      duration={4000}
      expand={false}
      visibleToasts={3}
    />
  );
}
