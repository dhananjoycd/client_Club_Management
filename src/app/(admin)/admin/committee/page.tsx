import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminCommitteeManager } from "@/features/committee/components/admin-committee-manager";

export default function AdminCommitteePage() {
  return (
    <ProtectedArea allowedRoles={["SUPER_ADMIN"]}>
      <AdminCommitteeManager />
    </ProtectedArea>
  );
}
