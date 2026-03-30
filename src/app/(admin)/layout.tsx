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
  { href: "/admin/contacts", label: "Contacts", allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
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
