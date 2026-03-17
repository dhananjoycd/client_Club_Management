import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { MotionPage } from "@/components/motion/motion-shell";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <PublicNavbar />
      <div className="relative flex min-h-[calc(100vh-9rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,214,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(15,76,189,0.14),transparent_24%)]" />
        <MotionPage className="relative w-full max-w-md">
          <div className="surface-card w-full rounded-[2rem] p-6 sm:p-8">{children}</div>
        </MotionPage>
      </div>
      <PublicFooter />
    </div>
  );
}
