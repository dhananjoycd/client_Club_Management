import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <PublicNavbar />
      <div>{children}</div>
      <PublicFooter />
    </div>
  );
}
