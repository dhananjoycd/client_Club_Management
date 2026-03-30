import dynamic from "next/dynamic";
import { ProtectedArea } from "@/components/layout/protected-area";
import { FormLoadingState } from "@/components/feedback/form-loading-state";

const AdminSettingsManager = dynamic(
  () => import("@/features/settings/components/admin-settings-manager").then((mod) => mod.AdminSettingsManager),
  {
    loading: () => (
      <FormLoadingState
        title="Loading settings editor"
        description="Preparing the XYZ Tech Club settings workspace and saved public content."
        fields={9}
      />
    ),
  },
);

export default function AdminSettingsPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminSettingsManager />
    </ProtectedArea>
  );
}
