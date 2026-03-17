"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";

const restrictedRoles = new Set(["MEMBER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"]);

type MembershipApplyCtaProps = {
  label: string;
  href?: string;
  className?: string;
  onClick?: () => void;
};

export function MembershipApplyCta({
  label,
  href = "/apply",
  className,
  onClick,
}: MembershipApplyCtaProps) {
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authService.getSession,
    retry: false,
  });

  const user = sessionQuery.data?.data?.user;

  if (user && restrictedRoles.has(user.role)) {
    return null;
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}
