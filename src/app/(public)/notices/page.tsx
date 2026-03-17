"use client";

import { useQuery } from "@tanstack/react-query";
import { SectionWrapper } from "@/components/shared/section-wrapper";
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
      </div>
    </main>
  );
}
