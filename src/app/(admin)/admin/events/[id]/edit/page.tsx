import { AdminEventEditPage } from "@/features/events/components/admin-event-edit-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEventEditRoute({ params }: Props) {
  const { id } = await params;
  return <AdminEventEditPage eventId={id} />;
}
