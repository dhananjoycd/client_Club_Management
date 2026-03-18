import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminApplicationsManager } from "@/features/applications/components/admin-applications-manager";

export default function AdminApplicationsPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminApplicationsManager />
    </ProtectedArea>
  );
}
