"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { queryKeys } from "@/lib/query-keys";
import { getDashboardRouteForRole } from "@/lib/dashboard-route";
import { authService } from "@/services/auth.service";

type ProtectedAreaProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

const getRedirectTarget = (pathname: string, search: string) => {
  const currentPath = `${pathname}${search}`;
  return `/login?redirect=${encodeURIComponent(currentPath)}`;
};

function ProtectedAreaContent({ children, allowedRoles }: ProtectedAreaProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  useEffect(() => {
    if (sessionQuery.isLoading) {
      return;
    }

    const user = sessionQuery.data?.data?.user;
    if (!user) {
      router.replace(getRedirectTarget(pathname, search ? `?${search}` : ""));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const fallback = getDashboardRouteForRole(user.role) ?? "/";
      router.replace(fallback);
    }
  }, [allowedRoles, pathname, router, search, sessionQuery.data, sessionQuery.isLoading]);

  if (sessionQuery.isLoading) {
    return <LoadingState title="Checking access" description="Verifying your session before loading this area." />;
  }

  const user = sessionQuery.data?.data?.user;
  if (!user) {
    return <LoadingState title="Redirecting to login" description="You need to sign in to access this area." />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <EmptyState title="Access restricted" description="Your current account role does not have access to this section." />;
  }

  return <>{children}</>;
}

export function ProtectedArea({ children, allowedRoles }: ProtectedAreaProps) {
  return (
    <Suspense fallback={<LoadingState title="Checking access" description="Preparing this protected area." />}>
      <ProtectedAreaContent allowedRoles={allowedRoles}>{children}</ProtectedAreaContent>
    </Suspense>
  );
}

