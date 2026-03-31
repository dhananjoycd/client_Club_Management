import dynamic from "next/dynamic";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";

const PublicNavbar = dynamic(
  () => import("@/components/layout/public-navbar").then((mod) => mod.PublicNavbar),
  {
    loading: () => <div className="sticky top-0 z-40 h-[4.75rem] border-b border-[var(--color-border)] bg-[rgba(249,251,254,0.78)] backdrop-blur-xl" />,
  },
);

const PublicFooter = dynamic(
  () => import("@/components/layout/public-footer").then((mod) => mod.PublicFooter),
  {
    loading: () => <div className="h-32 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#091429,#071020)]" />,
  },
);

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
    <ProtectedArea allowedRoles={["USER", "MEMBER"]}>
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

