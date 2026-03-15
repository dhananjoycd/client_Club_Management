import { ProtectedNoticesList } from "@/features/notices/components/protected-notices-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export default function NoticesPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Official Notices"
          title="Role-aware notice access connected to the backend notice module."
          description="The backend protects notice access by session and role, so this page now behaves like a real application rather than a static public board."
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
