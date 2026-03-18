import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function AuthRouteLoading() {
  return (
    <RouteLoadingShell
      badge="Secure Access"
      title="Preparing your account access"
      description="Loading the sign in, registration, or verification flow with secure session checks for XYZ Tech Club."
      compact
      columns={2}
    />
  );
}
