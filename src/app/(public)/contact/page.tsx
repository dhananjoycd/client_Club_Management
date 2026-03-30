import dynamic from "next/dynamic";
import { LoadingState } from "@/components/feedback/loading-state";

const PublicContactView = dynamic(
  () => import("@/features/contact/components/public-contact-view").then((mod) => mod.PublicContactView),
  {
    loading: () => (
      <LoadingState
        title="Loading contact page"
        description="Preparing support details and the contact request workspace."
      />
    ),
  },
);

export default function ContactPage() {
  return <PublicContactView />;
}
