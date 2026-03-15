import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";

type MemberLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const memberLinks = [
  { href: "/member", label: "Overview" },
  { href: "/member/profile", label: "Profile" },
  { href: "/member/membership-status", label: "Membership Status" },
  { href: "/member/registrations", label: "Registrations" },
];

export default function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <ProtectedArea allowedRoles={["MEMBER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]}>
      <DashboardShell
        title="Member Dashboard"
        description="Access your club profile, registrations, and membership information."
        sidebarHeading="Member Area"
        links={memberLinks}
      >
        {children}
      </DashboardShell>
    </ProtectedArea>
  );
}
