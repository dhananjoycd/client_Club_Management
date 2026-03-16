import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { MotionPage } from "@/components/motion/motion-shell";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <PublicNavbar />
      <MotionPage>{children}</MotionPage>
      <PublicFooter />
    </div>
  );
}
