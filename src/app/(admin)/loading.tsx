import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function AdminRouteLoading() {
  return (
    <RouteLoadingShell
      badge="Admin Workspace"
      title="Loading the admin control center"
      description="Preparing dashboard panels, moderation queues, events, notices, payments, and operational tools for the XYZ Tech Club team."
    />
  );
}
