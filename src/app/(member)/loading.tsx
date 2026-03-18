import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function MemberRouteLoading() {
  return (
    <RouteLoadingShell
      badge="Member Dashboard"
      title="Loading your account workspace"
      description="Preparing your profile, membership status, registrations, and recent club activity in one place."
      compact
    />
  );
}
