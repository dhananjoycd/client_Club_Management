import { ProtectedNoticesList } from "@/features/notices/components/protected-notices-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export default function NoticesPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Official Notices"
          title="Read role-based notices in one place."
          description="Notice access stays connected to the backend, and each card now shows publish time plus an edited marker when an update was made later."
        />

        <SectionWrapper
          title="Recent notices"
          description="Sign in to view official announcements that are available for your account role."
        >
          <ProtectedNoticesList />
        </SectionWrapper>
      </div>
    </main>
  );
}
