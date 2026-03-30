import dynamic from "next/dynamic";
import { FormLoadingState } from "@/components/feedback/form-loading-state";

const AccountProfileManager = dynamic(
  () => import("@/features/account/components/account-profile-manager").then((mod) => mod.AccountProfileManager),
  {
    loading: () => (
      <FormLoadingState
        title="Loading profile manager"
        description="Preparing your account profile, membership data, and profile editor controls."
        fields={8}
      />
    ),
  },
);

export default function MemberProfilePage() {
  return <AccountProfileManager />;
}
