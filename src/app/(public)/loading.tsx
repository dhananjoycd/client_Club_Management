import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function PublicRouteLoading() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <RouteLoadingShell
          badge="Public Page"
          title="Loading club stories, events, and updates"
          description="Preparing the next public section with the latest XYZ Tech Club content, notices, and featured highlights."
        />
      </div>
    </main>
  );
}
