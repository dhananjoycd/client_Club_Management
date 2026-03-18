import { committeePreview } from "@/features/home/home-content";
import { PublicCommitteeView } from "@/features/committee/components/public-committee-view";
import { committeeService } from "@/services/committee.service";

export default async function CommitteePage() {
  try {
    const result = await committeeService.getPublicCommittee();
    const data = result.data;
    return <PublicCommitteeView sessions={data.sessions} initialSessionId={data.activeSession?.id ?? null} />;
  } catch {
    return <PublicCommitteeView sessions={[{ id: "fallback", label: "Current", title: "Executive Committee", description: "Fallback committee preview while the API is unavailable.", isActive: true, displayOrder: 0, assignments: committeePreview.map((member, index) => ({ ...member, id: `fallback-${index}` })) }]} initialSessionId="fallback" />;
  }
}
