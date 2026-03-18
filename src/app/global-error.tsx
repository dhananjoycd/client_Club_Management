"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/feedback/error-screen";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorScreen
          eyebrow="Application Error"
          title="XYZ Tech Club hit an unexpected problem."
          description="A critical frontend error interrupted the app shell before the current page could finish rendering. Try loading the application again, or return home and reopen the section you need."
          onRetry={reset}
          retryLabel="Restart the app"
        />
      </body>
    </html>
  );
}
