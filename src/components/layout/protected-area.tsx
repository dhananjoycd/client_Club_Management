"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";

type ProtectedAreaProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export function ProtectedArea({ children, allowedRoles }: ProtectedAreaProps) {
  const pathname = usePathname();
  const router = useRouter();
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
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const fallback = user.role === "USER" || user.role === "MEMBER" ? "/account" : "/admin";
      router.replace(fallback);
    }
  }, [allowedRoles, pathname, router, sessionQuery.data, sessionQuery.isLoading]);

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
