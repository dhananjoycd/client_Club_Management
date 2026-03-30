import dynamic from "next/dynamic";
import { MotionPage } from "@/components/motion/motion-shell";

const PublicNavbar = dynamic(
  () => import("@/components/layout/public-navbar").then((mod) => mod.PublicNavbar),
  {
    loading: () => <div className="sticky top-0 z-40 h-[4.75rem] border-b border-[var(--color-border)] bg-[rgba(249,251,254,0.78)] backdrop-blur-xl" />,
  },
);

const PublicFooter = dynamic(
  () => import("@/components/layout/public-footer").then((mod) => mod.PublicFooter),
  {
    loading: () => <div className="mt-12 h-32 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#091429,#071020)] sm:mt-16" />,
  },
);

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
