import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

type MemberLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const memberLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/registrations", label: "Registrations" },
];

export default function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <ProtectedArea allowedRoles={["USER", "MEMBER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]}>
      <div className="min-h-screen bg-[var(--color-page)]">
        <PublicNavbar />
        <div className="mt-2">
          <DashboardShell
            title="Account Dashboard"
            description="Manage your profile, membership progress, and event activity in one place."
            sidebarHeading="My Account"
            links={memberLinks}
          >
            {children}
          </DashboardShell>
        </div>
        <PublicFooter />
      </div>
    </ProtectedArea>
  );
}
