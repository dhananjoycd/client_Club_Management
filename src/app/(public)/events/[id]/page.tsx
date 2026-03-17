import { PublicEventDetails } from "@/features/events/components/public-event-details";

type EventDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;
  return <PublicEventDetails eventId={id} />;
}
