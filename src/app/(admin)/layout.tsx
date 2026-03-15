import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <DashboardShell
        title="Admin Dashboard"
        description="Manage operations, applications, events, notices, and platform settings."
        sidebarHeading="Admin Panel"
        links={adminLinks}
      >
        {children}
      </DashboardShell>
    </ProtectedArea>
  );
}
