import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminUsersManager } from "@/features/users/components/admin-users-manager";

export default function AdminUsersPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminUsersManager />
    </ProtectedArea>
  );
}
