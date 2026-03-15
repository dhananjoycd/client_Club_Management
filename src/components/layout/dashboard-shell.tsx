import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

type NavigationLink = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  title: string;
  description: string;
  sidebarHeading: string;
  links: NavigationLink[];
  children: ReactNode;
};

export function DashboardShell({
  title,
  description,
  sidebarHeading,
  links,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page)] lg:flex">
      <DashboardSidebar heading={sidebarHeading} links={links} />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar title={title} description={description} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
