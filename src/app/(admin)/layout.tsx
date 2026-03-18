import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedArea } from "@/components/layout/protected-area";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const adminLinks = [
  { href: "/admin", label: "Overview", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/profile", label: "Profile", allowedRoles: ["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"] },
  { href: "/admin/users", label: "Users", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/applications", label: "Applications", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/events", label: "Events", allowedRoles: ["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"] },
  { href: "/admin/payments", label: "Payments", allowedRoles: ["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"] },
  { href: "/admin/notices", label: "Notices", allowedRoles: ["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"] },
  { href: "/admin/testimonials", label: "Testimonials", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/admin/committee", label: "Committee", allowedRoles: ["SUPER_ADMIN"] },
  { href: "/admin/settings", label: "Settings", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]}>
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
