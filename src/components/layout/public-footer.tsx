export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--color-muted-foreground)] sm:px-6 lg:px-8">
        <p className="font-medium text-[var(--color-primary)]">Club Management System</p>
        <p>Professional frontend foundation for public visitors, members, and administrators.</p>
      </div>
    </footer>
  );
}
