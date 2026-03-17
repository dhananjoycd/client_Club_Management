export default function TestimonialsLoading() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-36 rounded-full bg-slate-200" />
            <div className="h-12 w-3/4 rounded-full bg-slate-200" />
            <div className="h-5 w-2/3 rounded-full bg-slate-100" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-[var(--color-primary)]">Loading testimonials</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">Preparing the latest member voices and feedback from XYZ Tech Club.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="h-[28rem] animate-pulse rounded-[1.75rem] bg-slate-100" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-100" />
            <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-100" />
            <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-100 md:col-span-2" />
          </div>
        </div>
      </div>
    </main>
  );
}
