import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminSettingsManager } from "@/features/settings/components/admin-settings-manager";

export default function AdminSettingsPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminSettingsManager />
    </ProtectedArea>
  );
}
