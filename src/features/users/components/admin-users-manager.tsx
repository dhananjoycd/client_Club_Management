"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { TableLoadingState } from "@/components/feedback/table-loading-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { UpdateUserRolePayload, UserApplicationFilter, UserDetails, UserMembershipFilter, UserRole } from "@/types/user.types";

const USERS_PER_PAGE = 10;
const roleOptions: Array<{ value: UserRole | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "USER", label: "Users" },
  { value: "MEMBER", label: "Members" },
  { value: "ADMIN", label: "Admins" },
  { value: "EVENT_MANAGER", label: "Event Managers" },
];
const allowedRoleValues: UpdateUserRolePayload["role"][] = ["USER", "MEMBER", "ADMIN", "EVENT_MANAGER"];

const roleLabel = (role: string) => role.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());
const statusVariant = (value: string | null | undefined) => {
  if (value === "ACTIVE" || value === "APPROVED" || value === "MEMBER") return "active" as const;
  if (value === "PENDING") return "pending" as const;
  if (value === "REJECTED" || value === "SUSPENDED") return "inactive" as const;
  return "default" as const;
};

export function AdminUsersManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [applicationFilter, setApplicationFilter] = useState<UserApplicationFilter | "ALL">("ALL");
  const [membershipFilter, setMembershipFilter] = useState<UserMembershipFilter | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"details" | "registrations" | null>(null);
  const [roleDraft, setRoleDraft] = useState<UpdateUserRolePayload["role"]>("USER");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(`page-${page}-search-${searchTerm}-role-${roleFilter}-application-${applicationFilter}-membership-${membershipFilter}`),
    queryFn: () => userService.getUsers({
      page,
      limit: USERS_PER_PAGE,
      searchTerm: searchTerm || undefined,
      role: roleFilter === "ALL" ? undefined : roleFilter,
      applicationStatus: applicationFilter === "ALL" ? undefined : applicationFilter,
      membershipStatus: membershipFilter === "ALL" ? undefined : membershipFilter,
    }),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const detailsQuery = useQuery({
    queryKey: detailsUserId ? queryKeys.users.detail(detailsUserId) : ["users", "detail", "idle"],
    queryFn: () => userService.getUserById(detailsUserId as string),
    enabled: Boolean(detailsUserId),
    retry: false,
  });

  const sessionUser = sessionQuery.data?.data?.user;
  const users = usersQuery.data?.data.result ?? [];
  const meta = usersQuery.data?.data.meta;
  const summary = usersQuery.data?.data.summary;
  const detailsUser: UserDetails | null = detailsQuery.data?.data ?? null;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, applicationFilter, membershipFilter]);

  useEffect(() => {
    if (!detailsUser) return;
    const normalizedRole = detailsUser.role === "SUPER_ADMIN" ? "ADMIN" : detailsUser.role;
    setRoleDraft((allowedRoleValues.includes(normalizedRole as UpdateUserRolePayload["role"]) ? normalizedRole : "USER") as UpdateUserRolePayload["role"]);
  }, [detailsUser]);

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRolePayload }) => userService.updateUserRole(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "User role updated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        detailsUserId ? queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(detailsUserId) }) : Promise.resolve(),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Role update failed.")),
  });

  const canManageRole = Boolean(
    sessionUser?.role === "SUPER_ADMIN" && detailsUser && detailsUser.role !== "SUPER_ADMIN" && sessionUser.id !== detailsUser.id,
  );

  if (!usersQuery.data && usersQuery.isLoading) {
    return <TableLoadingState title="Loading users" description="Preparing the latest XYZ Tech Club accounts for admin review." />;
  }

  if (usersQuery.isError) {
    return <EmptyState title="Unable to load users" description={getApiErrorMessage(usersQuery.error, "Please verify your admin session.")} />;
  }

  return (
    <>
      <SectionWrapper title="Users" description="Review account roles, applications, memberships, and registrations from one admin table.">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Total users</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{summary?.totalUsers ?? 0}</p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">All accounts currently stored in the platform.</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Members</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">{summary?.totalMembers ?? 0}</p>
              <p className="mt-2 text-sm text-emerald-700">Approved member profiles linked to accounts.</p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Pending applicants</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{summary?.pendingApplicants ?? 0}</p>
              <p className="mt-2 text-sm text-amber-700">Applications waiting for an admin decision.</p>
            </div>
            <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Admins</p>
              <p className="mt-2 text-3xl font-semibold text-blue-900">{summary?.admins ?? 0}</p>
              <p className="mt-2 text-sm text-blue-700">Admin and super admin accounts in the system.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Search users</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email, phone, department, session, or student ID"
                    className="input-base h-12 w-full pl-11 pr-4 text-sm"
                  />
                </div>
              </label>
              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen((current) => !current)}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] app-card-subtle px-5 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-white"
                  aria-expanded={isAdvancedOpen}
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Advanced search</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{isAdvancedOpen ? "Hide the role and status filters once your search looks right." : "Open role and status filters to narrow the users table more precisely."}</p>
                  </div>
                  <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full app-card-subtle px-4 text-base font-semibold text-[var(--color-primary)]">
                    {isAdvancedOpen ? "-" : "+"}
                  </span>
                </button>

                {isAdvancedOpen ? (
                  <div className="grid gap-4 rounded-[1.5rem] app-card-subtle p-4 sm:p-5">
                    <div className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--color-primary-strong)]">Role</span>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((option) => (
                          <FilterChip key={option.value} label={option.label} active={roleFilter === option.value} onClick={() => setRoleFilter(option.value)} />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--color-primary-strong)]">Application status</span>
                        <select
                          value={applicationFilter}
                          onChange={(event) => setApplicationFilter(event.target.value as UserApplicationFilter | "ALL")}
                          className="input-base h-12 px-4 text-sm"
                        >
                          <option value="ALL">All applications</option>
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="NONE">No application</option>
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--color-primary-strong)]">Membership status</span>
                        <select
                          value={membershipFilter}
                          onChange={(event) => setMembershipFilter(event.target.value as UserMembershipFilter | "ALL")}
                          className="input-base h-12 px-4 text-sm"
                        >
                          <option value="ALL">All membership</option>
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="NONE">No membership</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter("ALL");
                          setApplicationFilter("ALL");
                          setMembershipFilter("ALL");
                        }}
                        className="secondary-button h-10 px-4 text-sm"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {users.length ? (
            <>
              {usersQuery.isFetching ? (
                <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                  Updating users list based on the latest search and filters...
                </div>
              ) : null}
              <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/80 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                      <tr>
                        <th className="px-5 py-4 font-semibold">User</th>
                        <th className="px-5 py-4 font-semibold">Role</th>
                        <th className="px-5 py-4 font-semibold">Application</th>
                        <th className="px-5 py-4 font-semibold">Membership</th>
                        <th className="px-5 py-4 font-semibold">Registrations</th>
                        <th className="px-5 py-4 font-semibold">Joined</th>
                        <th className="px-5 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-[var(--color-border)] align-top">
                          <td className="px-5 py-4">
                            <div className="min-w-[220px]">
                              <p className="font-semibold text-[var(--color-primary)]">{user.name ?? 'Unnamed user'}</p>
                              <p className="mt-1 text-[var(--color-muted-foreground)]">{user.email}</p>
                              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                                {user.department ?? 'No department'}{user.academicSession ? ` - ${user.academicSession}` : ''}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4"><StatusBadge label={roleLabel(user.role)} variant={user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'info' : user.role === 'MEMBER' ? 'active' : 'default'} /></td>
                          <td className="px-5 py-4"><StatusBadge label={user.latestApplication?.status ? roleLabel(user.latestApplication.status) : 'No application'} variant={statusVariant(user.latestApplication?.status)} /></td>
                          <td className="px-5 py-4"><StatusBadge label={user.memberProfile?.status ? roleLabel(user.memberProfile.status) : 'No membership'} variant={statusVariant(user.memberProfile?.status)} /></td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => { setDetailsUserId(user.id); setActiveModal("registrations"); }}
                              className="secondary-button h-9 px-3 text-xs"
                            >
                              <span>See All (</span>
                              <span className="text-[var(--color-accent)]">{user.registrationsCount}</span>
                              <span>)</span>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-[var(--color-muted-foreground)]">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
                          <td className="px-5 py-4">
                            <button type="button" onClick={() => { setDetailsUserId(user.id); setActiveModal("details"); }} className="secondary-button h-10 px-4 text-sm">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No users found" description="Try another search term or filter to find the account you want to manage." />
          )}
        </div>
      </SectionWrapper>

      {detailsUserId && activeModal === "registrations" ? (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center">
            <div className="surface-card w-full max-w-4xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
              {detailsQuery.isLoading ? (
                <LoadingState title="Loading registration activity" description="Preparing the user's complete event registration history." />
              ) : detailsQuery.isError || !detailsUser ? (
                <EmptyState title="Unable to load registrations" description={getApiErrorMessage(detailsQuery.error, "Please try again.")} />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Registration activity</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{detailsUser.name ?? 'Unnamed user'}</h3>
                      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">All event registrations linked to this account.</p>
                    </div>
                    <button type="button" onClick={() => { setActiveModal(null); setDetailsUserId(null); }} className="secondary-button h-11 px-5 text-sm">Close</button>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {detailsUser.registrations.length ? detailsUser.registrations.map((registration) => (
                      <div key={registration.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-[var(--color-primary)]">{registration.event.title}</p>
                            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), 'dd MMM yyyy, hh:mm a')}</p>
                            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Registered {format(new Date(registration.registeredAt), 'dd MMM yyyy, hh:mm a')}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge label={roleLabel(registration.status)} variant={statusVariant(registration.status)} />
                            {registration.paymentStatus && registration.paymentStatus !== 'NOT_REQUIRED' ? <StatusBadge label={roleLabel(registration.paymentStatus)} variant={statusVariant(registration.paymentStatus)} /> : null}
                            {registration.paymentVerificationStatus && registration.paymentVerificationStatus !== 'NOT_APPLICABLE' ? <StatusBadge label={roleLabel(registration.paymentVerificationStatus)} variant={statusVariant(registration.paymentVerificationStatus)} /> : null}
                            {registration.event.eventType === 'PAID' ? <StatusBadge label={`${registration.event.price ?? 0} BDT`} variant="info" /> : <StatusBadge label="Free event" variant="default" />}
                          </div>
                        </div>
                      </div>
                    )) : <EmptyState title="No registrations yet" description="This account has not joined any event yet." />}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {detailsUserId && activeModal === "details" ? (
        <div className="fixed inset-0 z-[100] overflow-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center">
            <div className="surface-card w-full max-w-5xl rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-7">
              {detailsQuery.isLoading ? (
                <LoadingState title="Loading user details" description="Preparing the selected account snapshot for review." />
              ) : detailsQuery.isError || !detailsUser ? (
                <EmptyState title="Unable to load user" description={getApiErrorMessage(detailsQuery.error, "Please try again.")} />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">User details</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{detailsUser.name ?? 'Unnamed user'}</h3>
                      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{detailsUser.email}</p>
                    </div>
                    <button type="button" onClick={() => { setActiveModal(null); setDetailsUserId(null); }} className="secondary-button h-11 px-5 text-sm">Close</button>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Role</p>
                      <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{roleLabel(detailsUser.role)}</p>
                      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Profile {detailsUser.profileComplete ? 'complete' : 'incomplete'}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Membership</p>
                      <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{detailsUser.memberProfile?.membershipId ?? 'No membership ID'}</p>
                      <div className="mt-3"><StatusBadge label={detailsUser.memberProfile?.status ? roleLabel(detailsUser.memberProfile.status) : 'No membership'} variant={statusVariant(detailsUser.memberProfile?.status)} /></div>
                    </div>
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Registrations</p>
                      <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{detailsUser.registrationsCount}</p>
                      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Joined {format(new Date(detailsUser.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Profile data</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[['Phone', detailsUser.phone ?? 'Not provided'], ['Academic session', detailsUser.academicSession ?? 'Not provided'], ['Department', detailsUser.department ?? 'Not provided'], ['Student ID', detailsUser.studentId ?? 'Not provided'], ['District', detailsUser.district ?? 'Not provided'], ['Updated', format(new Date(detailsUser.updatedAt), 'dd MMM yyyy, hh:mm a')]].map(([label, value]) => (
                          <div key={label} className="rounded-[1.25rem] app-card-subtle p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
                            <p className="mt-2 text-sm font-semibold text-[var(--color-primary)] break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Role management</p>
                      {canManageRole ? (
                        <div className="mt-4 grid gap-4">
                          <label className="grid gap-2">
                            <span className="text-sm font-medium text-[var(--color-primary)]">Assign role</span>
                            <select value={roleDraft} onChange={(event) => setRoleDraft(event.target.value as UpdateUserRolePayload['role'])} className="input-base h-12 px-4 text-sm">
                              {allowedRoleValues.map((value) => (
                                <option key={value} value={value}>{roleLabel(value)}</option>
                              ))}
                            </select>
                          </label>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={updateRoleMutation.isPending || roleDraft === detailsUser.role}
                              onClick={() => updateRoleMutation.mutate({ id: detailsUser.id, payload: { role: roleDraft } })}
                              className="primary-button h-11 px-5 text-sm disabled:opacity-50"
                            >
                              {updateRoleMutation.isPending ? 'Saving...' : 'Update role'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">Only a super admin can update another user&apos;s role from this panel.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Application history</p>
                      <div className="mt-4 grid gap-3">
                        {detailsUser.applications.length ? detailsUser.applications.map((application) => (
                          <div key={application.id} className="rounded-[1.25rem] app-card-subtle p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[var(--color-primary)]">{application.department} - {application.session}</p>
                              <StatusBadge label={roleLabel(application.status)} variant={statusVariant(application.status)} />
                            </div>
                            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Student ID: {application.studentId}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Submitted {format(new Date(application.submittedAt), 'dd MMM yyyy, hh:mm a')}</p>
                            {application.reviewReason ? <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Admin note: {application.reviewReason}</p> : null}
                          </div>
                        )) : <EmptyState title="No applications yet" description="This user has not submitted any membership application." />}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Recent registrations</p>
                      <div className="mt-4 grid gap-3">
                        {detailsUser.registrations.length ? detailsUser.registrations.slice(0, 5).map((registration) => (
                          <div key={registration.id} className="rounded-[1.25rem] app-card-subtle p-4">
                            <p className="text-sm font-semibold text-[var(--color-primary)]">{registration.event.title}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{registration.event.location}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{format(new Date(registration.event.eventDate), 'dd MMM yyyy, hh:mm a')}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <StatusBadge label={roleLabel(registration.status)} variant={statusVariant(registration.status)} />
                              {registration.event.eventType === 'PAID' ? <StatusBadge label={`${registration.event.price ?? 0} BDT`} variant="info" /> : null}
                            </div>
                          </div>
                        )) : <EmptyState title="No registrations yet" description="This account has not joined any event yet." />}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

