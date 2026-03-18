import { ProtectedArea } from "@/components/layout/protected-area";
import { AdminTestimonialsManager } from "@/features/testimonials/components/admin-testimonials-manager";

export default function AdminTestimonialsPage() {
  return (
    <ProtectedArea allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminTestimonialsManager />
    </ProtectedArea>
  );
}
