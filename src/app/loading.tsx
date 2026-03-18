import { RouteLoadingShell } from "@/components/feedback/route-loading-shell";

export default function AppLoading() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <RouteLoadingShell
          badge="Booting Portal"
          title="Preparing XYZ Tech Club"
          description="Loading the latest public content, dashboard access state, and club modules before the next screen appears."
        />
      </div>
    </main>
  );
}
