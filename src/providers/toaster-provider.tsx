"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        style: {
          border: "1px solid #d9e2ec",
        },
      }}
    />
  );
}
