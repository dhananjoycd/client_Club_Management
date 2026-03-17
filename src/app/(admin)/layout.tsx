import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[var(--color-page)]">
        <PublicNavbar />
        <DashboardShell
          title="Admin Dashboard"
          description="Manage operations, applications, events, notices, and platform settings."
          sidebarHeading="Admin Panel"
          links={adminLinks}
        >
          {children}
        </DashboardShell>
        <PublicFooter />
      </div>
    </ProtectedArea>
  );
}
