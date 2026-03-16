type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,214,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(15,76,189,0.14),transparent_24%)]" />
      <div className="surface-card relative w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
