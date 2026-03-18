"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { ProtectedNoticesList } from "@/features/notices/components/protected-notices-list";

export default function NoticesPage() {
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const isSignedIn = Boolean(sessionQuery.data?.data?.user);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SectionWrapper
          title="Club notices and announcements"
          description={
            isSignedIn
              ? "Read the latest updates shared by XYZ Tech Club for your account."
              : "Read the latest updates shared by XYZ Tech Club. Sign in to view notices available for your account."
          }
        >
          <ProtectedNoticesList />
        </SectionWrapper>

        <section className="surface-card-dark rounded-[2rem] p-6 text-white shadow-[0_28px_70px_rgba(8,22,49,0.2)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[rgba(164,233,240,0.72)]">Next step</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Move from updates to action.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(226,232,240,0.8)] sm:text-base">After checking the latest notices, explore upcoming events or apply for membership to stay involved with XYZ Tech Club.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/events" className="primary-button h-12 w-full px-6 text-sm sm:w-auto">Explore Events</Link>
            <MembershipApplyCta label="Join the Club" className="secondary-button h-12 w-full border-white/14 bg-white/6 px-6 text-sm text-white hover:bg-white/10 hover:text-white sm:w-auto" />
          </div>
        </section>
      </div>
    </main>
  );
}
