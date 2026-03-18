"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowDown, ArrowUp, ChevronDown, PencilLine, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { committeeService } from "@/services/committee.service";
import { CommitteeDisplayMember } from "@/types/committee.types";

type EditableCommitteeMember = CommitteeDisplayMember & {
  sessionId: string;
};

const defaultCommitteeWingOptions = ["Executive", "Operations", "Event Management", "Design", "Content", "Development", "Media", "Community"];
const wingPositionOptions: Record<string, string[]> = {
  Executive: ["President", "Vice President", "General Secretary", "Joint Secretary", "Treasurer"],
  Operations: ["Operations Lead", "Coordinator", "Support Lead"],
  "Event Management": ["Event Coordinator", "Program Lead", "Logistics Lead"],
  Design: ["Lead Designer", "UI Designer", "Graphic Designer"],
  Content: ["Content Lead", "Writer", "Documentation Lead"],
  Development: ["Developer", "Frontend Lead", "Backend Lead"],
  Media: ["Media Coordinator", "Photographer", "Video Editor"],
  Community: ["Community Lead", "Outreach Coordinator", "Member Success Lead"],
};

const getPositionOptionsForWing = (wing: string) => wingPositionOptions[wing] ?? ["Coordinator", "Lead", "Member"];
const getEffectiveWing = (wing: string, customWing?: string) => (wing === "CUSTOM" ? customWing?.trim() || "" : wing);
const getMemberInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
const normalizeCommitteePosition = (value: string) => value.trim().toLowerCase();

export function AdminCommitteeSessionManager({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [memberProfileId, setMemberProfileId] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [committeeWing, setCommitteeWing] = useState(defaultCommitteeWingOptions[0]);
  const [customCommitteeWing, setCustomCommitteeWing] = useState("");
  const [positionTitle, setPositionTitle] = useState(getPositionOptionsForWing(defaultCommitteeWingOptions[0])[0]);
  const [customPositionTitle, setCustomPositionTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<EditableCommitteeMember | null>(null);
  const [editWing, setEditWing] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editCustomPosition, setEditCustomPosition] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [editBio, setEditBio] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editFacebookUrl, setEditFacebookUrl] = useState("");
  const [editLinkedinUrl, setEditLinkedinUrl] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [sessionCoverImageUrl, setSessionCoverImageUrl] = useState("");

  const sessionsQuery = useQuery({ queryKey: queryKeys.committee.adminSessions, queryFn: committeeService.getAdminSessions, retry: false });
  const eligibleMembersQuery = useQuery({ queryKey: queryKeys.committee.eligibleMembers, queryFn: committeeService.getEligibleMembers, retry: false });

  const createAssignmentMutation = useMutation({
    mutationFn: committeeService.createAssignment,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee assignment created successfully.");
      setMemberProfileId("");
      setMemberSearchTerm("");
      setCommitteeWing(defaultCommitteeWingOptions[0]);
      setCustomCommitteeWing("");
      setPositionTitle(getPositionOptionsForWing(defaultCommitteeWingOptions[0])[0]);
      setCustomPositionTitle("");
      setSortOrder("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee assignment failed.")),
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof committeeService.updateAssignment>[1] }) => committeeService.updateAssignment(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee assignment updated successfully.");
      setEditingAssignment(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee assignment update failed.")),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof committeeService.updateSession>[1] }) => committeeService.updateSession(id, payload),
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session updated successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session update failed.")),
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: committeeService.deleteAssignment,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee assignment deleted successfully.");
      setDeleteAssignmentId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee assignment delete failed.")),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: committeeService.deleteSession,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Committee session deleted successfully.");
      setDeleteSessionId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.committee.all });
      router.push("/admin/committee");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Committee session delete failed.")),
  });

  const sessions = useMemo(() => sessionsQuery.data?.data ?? [], [sessionsQuery.data?.data]);
  const session = useMemo(() => sessions.find((item) => item.id === sessionId) ?? null, [sessionId, sessions]);
  const eligibleMembers = eligibleMembersQuery.data?.data ?? [];
  const resolvedCommitteeWing = getEffectiveWing(committeeWing, customCommitteeWing);
  const addPositionOptions = getPositionOptionsForWing(resolvedCommitteeWing);
  const editResolvedWing = getEffectiveWing(editWing);
  const editPositionOptions = getPositionOptionsForWing(editResolvedWing);

  useEffect(() => {
    setSessionCoverImageUrl(session?.coverImageUrl ?? "");
  }, [session?.coverImageUrl, session?.id]);

  const openEditModal = (member: CommitteeDisplayMember) => {
    if (!session) return;
    setEditingAssignment({ ...member, sessionId: session.id });
    setEditWing(member.wing ?? defaultCommitteeWingOptions[0]);
    const suggestedPositions = getPositionOptionsForWing(member.wing ?? defaultCommitteeWingOptions[0]);
    setEditPosition(suggestedPositions.includes(member.role ?? "") ? (member.role ?? suggestedPositions[0]) : "CUSTOM");
    setEditCustomPosition(suggestedPositions.includes(member.role ?? "") ? "" : (member.role ?? ""));
    setEditSortOrder(String(member.sortOrder ?? 0));
    setEditBio(member.bio ?? "");
    setEditPhotoUrl(member.photoUrl ?? "");
    setEditFacebookUrl(member.facebookUrl ?? "");
    setEditLinkedinUrl(member.linkedinUrl ?? "");
    setEditWhatsapp(member.whatsapp ?? "");
  };

  const handleMoveAssignment = (member: CommitteeDisplayMember, direction: -1 | 1) => {
    if (!session) return;
    const orderedAssignments = [...session.assignments].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const currentIndex = orderedAssignments.findIndex((item) => item.id === member.id);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= orderedAssignments.length) return;
    const currentSort = orderedAssignments[currentIndex].sortOrder ?? currentIndex;
    const targetSort = orderedAssignments[targetIndex].sortOrder ?? targetIndex;
    updateAssignmentMutation.mutate({ id: orderedAssignments[currentIndex].id as string, payload: { sortOrder: targetSort } });
    updateAssignmentMutation.mutate({ id: orderedAssignments[targetIndex].id as string, payload: { sortOrder: currentSort } });
  };

  if (sessionsQuery.isLoading || eligibleMembersQuery.isLoading) {
    return <LoadingState title="Loading committee workspace" description="Preparing the selected session, members, and assignment controls." />;
  }

  if (sessionsQuery.isError || eligibleMembersQuery.isError) {
    return <EmptyState title="Unable to load committee workspace" description="Please verify your super admin session and try again." />;
  }

  if (!session) {
    return <EmptyState title="Committee session not found" description="The requested session does not exist anymore or may have been deleted." />;
  }

  const orderedAssignments = [...session.assignments].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const assignedMemberIds = new Set(session.assignments.map((item) => item.memberProfileId).filter((value): value is string => Boolean(value)));
  const filteredMembers = eligibleMembers.filter((member) => {
    if (assignedMemberIds.has(member.id)) return false;
    const query = memberSearchTerm.trim().toLowerCase();
    if (!query) return true;
    return member.name.toLowerCase().includes(query) || member.membershipId.toLowerCase().includes(query);
  });
  const usedSortOrders = new Set(session.assignments.map((item) => item.sortOrder).filter((value): value is number => typeof value === "number"));
  const maxDisplayOrder = Math.max(session.assignments.length + 3, 7);

  return (
    <>
      <SectionWrapper title="Committee workspace" description={session.description || `Manage the ${session.label} committee session from one dedicated workspace.`}>
        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--color-primary-strong)]">{session.label}</h2>
            {session.isActive ? <StatusBadge label="Active" variant="active" /> : <StatusBadge label="Archived" variant="default" />}
          </div>
          {session.title ? <p className="mt-2 text-sm font-medium text-[var(--color-primary)]">{session.title}</p> : null}
          {session.description ? <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{session.description}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsModifyOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white/85 px-4 py-2.5 text-left text-sm font-medium text-[var(--color-primary-strong)] transition hover:border-[var(--color-accent)] hover:bg-white"
            >
              <span className="leading-none">{isModifyOpen ? "Hide committee tools" : "Modify committee"}</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page)] text-[var(--color-primary)]">
                <ChevronDown className={`h-4 w-4 transition-transform ${isModifyOpen ? "rotate-180" : "rotate-0"}`} />
              </span>
            </button>
            {!session.isActive ? <button type="button" onClick={() => updateSessionMutation.mutate({ id: session.id, payload: { isActive: true } })} className="primary-button h-10 px-4 text-sm">Set Active</button> : null}
            <button type="button" onClick={() => setDeleteSessionId(session.id)} className="inline-flex h-10 items-center rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700">Delete session</button>
            <Link href="/admin/committee" className="secondary-button h-10 px-4 text-sm"><ArrowLeft className="h-4 w-4" />Back</Link>
          </div>

          {isModifyOpen ? (
            <form
              className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                const resolvedWing = committeeWing === "CUSTOM" ? customCommitteeWing.trim() : committeeWing;
                const resolvedPosition = positionTitle === "CUSTOM" ? customPositionTitle.trim() : positionTitle;
                const selectedOrder = Number.parseInt(sortOrder || "", 10);
                const duplicatePosition = session.assignments.some((item) => normalizeCommitteePosition(item.role || "") === normalizeCommitteePosition(resolvedPosition));

                if (!memberProfileId) return toast.error("Select an approved member before adding to the committee.");
                if (!resolvedWing) return toast.error("Select or enter a committee wing.");
                if (!resolvedPosition) return toast.error("Select or enter a position title.");
                if (duplicatePosition) return toast.error(`${resolvedPosition} is already used in ${session.label}. Choose a different position title.`);
                if (!Number.isInteger(selectedOrder)) return toast.error("Select a valid display order.");
                if (usedSortOrders.has(selectedOrder)) return toast.error(`Display order ${selectedOrder} is already used in ${session.label}. Choose another one.`);

                createAssignmentMutation.mutate({ sessionId: session.id, memberProfileId, committeeWing: resolvedWing, positionTitle: resolvedPosition, sortOrder: selectedOrder });
              }}
            >
              <div className="grid gap-4 rounded-[1.25rem] border border-[var(--color-border)] bg-white/80 p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Session cover image</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">Update the public group image shown for {session.label} on the committee page.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--color-primary-strong)]">Cover image URL</span>
                    <input value={sessionCoverImageUrl} onChange={(event) => setSessionCoverImageUrl(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="https://example.com/committee-session-cover.jpg" />
                  </label>
                  <button
                    type="button"
                    onClick={() => updateSessionMutation.mutate({ id: session.id, payload: { coverImageUrl: sessionCoverImageUrl.trim() } })}
                    disabled={updateSessionMutation.isPending}
                    className="secondary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateSessionMutation.isPending ? "Saving..." : "Save image"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Modify committee for {session.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">Search active members by name or MEM-ID, then assign a wing, position, and open display order.</p>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-primary-strong)]">Member</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                  <input
                    list={`committee-members-${session.id}`}
                    value={memberSearchTerm}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMemberSearchTerm(value);
                      const matchedMember = eligibleMembers.find((member) => `${member.name} - ${member.membershipId}` === value);
                      setMemberProfileId(matchedMember?.id ?? "");
                    }}
                    className="input-base h-12 w-full pl-11 pr-4 text-sm"
                    placeholder="Type name or MEM-ID to find and select a member"
                  />
                  <datalist id={`committee-members-${session.id}`}>
                    {filteredMembers.map((member) => <option key={member.id} value={`${member.name} - ${member.membershipId}`} />)}
                  </datalist>
                </div>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Committee wing</span><select value={committeeWing} onChange={(event) => { const nextWing = event.target.value; setCommitteeWing(nextWing); if (nextWing !== "CUSTOM") { const nextOptions = getPositionOptionsForWing(nextWing); if (positionTitle !== "CUSTOM" && !nextOptions.includes(positionTitle)) setPositionTitle(nextOptions[0]); setCustomCommitteeWing(""); } }} className="input-base h-12 px-4 text-sm">{defaultCommitteeWingOptions.map((option) => <option key={option} value={option}>{option}</option>)}<option value="CUSTOM">Custom wing</option></select></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Position title</span><select value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} className="input-base h-12 px-4 text-sm">{addPositionOptions.map((option) => <option key={option} value={option}>{option}</option>)}<option value="CUSTOM">Custom position</option></select></label>
              </div>
              {(committeeWing === "CUSTOM" || positionTitle === "CUSTOM") ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {committeeWing === "CUSTOM" ? <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Custom wing</span><input value={customCommitteeWing} onChange={(event) => { const nextCustomWing = event.target.value; setCustomCommitteeWing(nextCustomWing); const nextOptions = getPositionOptionsForWing(nextCustomWing.trim()); if (positionTitle !== "CUSTOM" && !nextOptions.includes(positionTitle)) setPositionTitle(nextOptions[0]); }} className="input-base h-12 px-4 text-sm" placeholder="Research, Outreach, Advisory..." /></label> : <div />}
                  {positionTitle === "CUSTOM" ? <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Custom position</span><input value={customPositionTitle} onChange={(event) => setCustomPositionTitle(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="Moderator, Advisor, Team Lead..." /></label> : <div />}
                </div>
              ) : null}
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--color-primary-strong)]">Display order</span>
                  <span className="text-xs font-medium text-[var(--color-muted-foreground)]">Next available: {Array.from({ length: maxDisplayOrder }, (_, index) => index + 1).find((order) => !usedSortOrders.has(order)) ?? maxDisplayOrder + 1}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: maxDisplayOrder }, (_, index) => index + 1).map((order) => {
                    const alreadyUsed = usedSortOrders.has(order);
                    const isActive = sortOrder === String(order);
                    return (
                      <button key={order} type="button" onClick={() => { if (alreadyUsed) return toast.error(`Display order ${order} is already used in ${session.label}.`); setSortOrder(String(order)); }} className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition ${alreadyUsed ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : isActive ? "border-[var(--color-accent)] bg-[var(--color-primary)] text-white shadow-[0_12px_28px_rgba(13,64,147,0.18)]" : "border-[var(--color-border)] bg-white text-[var(--color-primary-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]"}`}>{order}</button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end"><button type="submit" disabled={createAssignmentMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{createAssignmentMutation.isPending ? "Adding..." : "Add to committee"}</button></div>
            </form>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orderedAssignments.length ? orderedAssignments.map((member, index) => (
              <div key={member.id} className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {member.photoUrl ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[var(--color-border)]">
                        <Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="48px" unoptimized />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-primary)]">{getMemberInitials(member.name)}</div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[var(--color-primary)]">{member.name}</p>
                        <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">#{member.sortOrder ?? index}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{member.role}</p>
                      {member.wing ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{member.wing}</p> : null}
                    </div>
                  </div>
                  <button type="button" onClick={() => openEditModal(member)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-secondary)]"><PencilLine className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleMoveAssignment(member, -1)} disabled={index === 0 || updateAssignmentMutation.isPending} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleMoveAssignment(member, 1)} disabled={index === orderedAssignments.length - 1 || updateAssignmentMutation.isPending} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <button type="button" onClick={() => setDeleteAssignmentId(member.id || null)} className="text-sm font-medium text-rose-600 transition hover:text-rose-700">Remove</button>
                </div>
              </div>
            )) : <p className="text-sm text-[var(--color-muted-foreground)]">No members assigned yet.</p>}
          </div>
        </div>
      </SectionWrapper>

      {editingAssignment ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="surface-card w-full max-w-3xl rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">Edit committee assignment</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{editingAssignment.name}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Update position, wing, public bio, and contact links for this committee role.</p>
              </div>
              <button type="button" onClick={() => setEditingAssignment(null)} className="secondary-button h-10 px-4 text-sm">Close</button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={(event) => {
              event.preventDefault();
              const resolvedEditPosition = editPosition === "CUSTOM" ? editCustomPosition.trim() : editPosition;
              const duplicateEditPosition = session.assignments.some((item) => item.id !== editingAssignment.id && normalizeCommitteePosition(item.role || "") === normalizeCommitteePosition(resolvedEditPosition));
              if (!resolvedEditPosition) return toast.error("Select or enter a position title.");
              if (duplicateEditPosition) return toast.error(`${resolvedEditPosition} is already used in ${session.label}. Choose a different position title.`);
              updateAssignmentMutation.mutate({
                id: editingAssignment.id as string,
                payload: {
                  committeeWing: editWing,
                  positionTitle: resolvedEditPosition,
                  sortOrder: Number.parseInt(editSortOrder || "0", 10) || 0,
                  bioOverride: editBio || undefined,
                  photoUrlOverride: editPhotoUrl || undefined,
                  facebookUrl: editFacebookUrl || undefined,
                  linkedinUrl: editLinkedinUrl || undefined,
                  whatsapp: editWhatsapp || undefined,
                },
              });
            }}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Committee wing</span><select value={editWing} onChange={(event) => { const nextWing = event.target.value; setEditWing(nextWing); const nextOptions = getPositionOptionsForWing(nextWing); if (editPosition !== "CUSTOM" && !nextOptions.includes(editPosition)) setEditPosition(nextOptions[0]); }} className="input-base h-12 px-4 text-sm">{defaultCommitteeWingOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Position</span><select value={editPosition} onChange={(event) => setEditPosition(event.target.value)} className="input-base h-12 px-4 text-sm">{editPositionOptions.map((option) => <option key={option} value={option}>{option}</option>)}<option value="CUSTOM">Custom position</option></select></label>
              </div>
              {editPosition === "CUSTOM" ? <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Custom position</span><input value={editCustomPosition} onChange={(event) => setEditCustomPosition(event.target.value)} className="input-base h-12 px-4 text-sm" placeholder="Advisor, Moderator, Team Lead..." /></label> : null}
              <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Sort order</span><input value={editSortOrder} onChange={(event) => setEditSortOrder(event.target.value)} className="input-base h-12 px-4 text-sm" inputMode="numeric" /></label>
              <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Public bio override</span><textarea value={editBio} onChange={(event) => setEditBio(event.target.value)} rows={4} className="input-base min-h-[120px] px-4 py-3 text-sm" placeholder="Optional short bio for the committee page." /></label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Photo URL override</span><input value={editPhotoUrl} onChange={(event) => setEditPhotoUrl(event.target.value)} className="input-base h-12 px-4 text-sm" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">WhatsApp</span><input value={editWhatsapp} onChange={(event) => setEditWhatsapp(event.target.value)} className="input-base h-12 px-4 text-sm" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">Facebook URL</span><input value={editFacebookUrl} onChange={(event) => setEditFacebookUrl(event.target.value)} className="input-base h-12 px-4 text-sm" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium text-[var(--color-primary-strong)]">LinkedIn URL</span><input value={editLinkedinUrl} onChange={(event) => setEditLinkedinUrl(event.target.value)} className="input-base h-12 px-4 text-sm" /></label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingAssignment(null)} className="secondary-button h-11 px-5 text-sm">Cancel</button>
                <button type="submit" disabled={updateAssignmentMutation.isPending} className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{updateAssignmentMutation.isPending ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <WarningConfirmModal
        open={deleteAssignmentId !== null}
        title="Remove this committee assignment?"
        description="The member will disappear from the selected committee session after confirmation."
        confirmLabel="Remove member"
        cancelLabel="Keep assignment"
        isLoading={deleteAssignmentMutation.isPending}
        onConfirm={() => {
          if (!deleteAssignmentId) return;
          deleteAssignmentMutation.mutate(deleteAssignmentId);
        }}
        onCancel={() => setDeleteAssignmentId(null)}
      />

      <WarningConfirmModal
        open={deleteSessionId !== null}
        title="Delete this committee session?"
        description="This will remove the session and every committee assignment inside it. This action cannot be undone."
        confirmLabel="Delete session"
        cancelLabel="Keep session"
        isLoading={deleteSessionMutation.isPending}
        onConfirm={() => {
          if (!deleteSessionId) return;
          deleteSessionMutation.mutate(deleteSessionId);
        }}
        onCancel={() => setDeleteSessionId(null)}
      />
    </>
  );
}
