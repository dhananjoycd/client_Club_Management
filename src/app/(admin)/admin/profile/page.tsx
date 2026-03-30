import dynamic from "next/dynamic";
import { FormLoadingState } from "@/components/feedback/form-loading-state";

const AccountProfileManager = dynamic(
  () => import("@/features/account/components/account-profile-manager").then((mod) => mod.AccountProfileManager),
  {
    loading: () => (
      <FormLoadingState
        title="Loading profile manager"
        description="Preparing the account profile editor and related membership details."
        fields={8}
      />
    ),
  },
);

export default function AdminProfilePage() {
  return <AccountProfileManager showRegistrations={false} />;
}
