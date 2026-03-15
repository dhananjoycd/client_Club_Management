import { DashboardShell } from "@/components/layout/dashboard-shell";

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
    <DashboardShell
      title="Admin Dashboard"
      description="Manage operations, applications, events, notices, and platform settings."
      sidebarHeading="Admin Panel"
      links={adminLinks}
    >
      {children}
    </DashboardShell>
  );
}
