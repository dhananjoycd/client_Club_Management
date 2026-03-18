import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminCommitteeSessionManager } from "@/features/committee/components/admin-committee-session-manager";

type AdminCommitteeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function AdminCommitteeSessionPage({ params }: AdminCommitteeSessionPageProps) {
  const { sessionId } = await params;

  return (
    <ProtectedArea allowedRoles={["SUPER_ADMIN"]}>
      <AdminCommitteeSessionManager sessionId={sessionId} />
    </ProtectedArea>
  );
}
