type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
