import Link from "next/link";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <PublicNavbar />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--color-border)] bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">404</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            The page you are looking for was not found.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            Return to the main site and continue exploring the club management platform.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
