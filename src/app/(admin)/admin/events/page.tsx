import dynamic from "next/dynamic";
import { LoadingState } from "@/components/feedback/loading-state";

const AdminEventsManager = dynamic(
  () => import("@/features/events/components/admin-events-manager").then((mod) => mod.AdminEventsManager),
  {
    loading: () => (
      <LoadingState
        title="Loading event board"
        description="Preparing the XYZ Tech Club event manager and recent activity controls."
      />
    ),
  },
);

export default function AdminEventsPage() {
  return <AdminEventsManager />;
}
