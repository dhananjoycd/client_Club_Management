import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function PublicRouteLoading() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <RouteLoadingShell
          badge="Homepage Loading"
          title="Loading the club home page"
          description="Bringing in the latest hero content, featured events, notices, testimonials, and public updates for XYZ Tech Club."
        />
      </div>
    </main>
  );
}
