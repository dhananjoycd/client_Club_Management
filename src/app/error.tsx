"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/feedback/error-screen";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      eyebrow="Page Error"
      title="This section of XYZ Tech Club could not be loaded."
      description="The page ran into a problem while loading club data, dashboard content, or account details. Try this page again, or return to the main site and continue from there."
      onRetry={reset}
      retryLabel="Reload this page"
    />
  );
}
