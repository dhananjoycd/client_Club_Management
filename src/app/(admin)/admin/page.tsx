import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminDashboardOverview } from "@/features/dashboard/components/admin-dashboard-overview";

export default function AdminOverviewPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]}>
      <AdminDashboardOverview />
    </ProtectedArea>
  );
}
