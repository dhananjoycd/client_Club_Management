"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { FilterChip } from "@/components/shared/filter-chip";
import { CommitteeSessionItem } from "@/types/committee.types";

const defaultCommitteeGroupPhotoUrl = "https://media.istockphoto.com/id/1400051391/photo/portrait-of-successful-team-at-the-office.jpg?s=612x612&w=0&k=20&c=-JPTGPOpKyIgvFymzYRg1XecuUJsXgdY0k5DeDMBi30=";

type PublicCommitteeViewProps = {
  sessions: CommitteeSessionItem[];
  initialSessionId?: string | null;
};

function getSessionSortValue(label: string) {
  const match = label.match(/^(\d{4})-(\d{2})$/);
  if (!match) return Number.NEGATIVE_INFINITY;
  return Number.parseInt(match[1], 10);
}

export function PublicCommitteeView({ sessions, initialSessionId }: PublicCommitteeViewProps) {
  const orderedSessions = useMemo(() => [...sessions].sort((left, right) => {
    if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
    return getSessionSortValue(right.label) - getSessionSortValue(left.label);
  }), [sessions]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || orderedSessions[0]?.id || "");
  const selectedSession = useMemo(() => orderedSessions.find((session) => session.id === selectedSessionId) || orderedSessions[0] || null, [selectedSessionId, orderedSessions]);
  const mobileSessionSelection = useMemo(() => {
    const selectedId = selectedSession?.id ?? "";
    const recentSessions = orderedSessions.slice(0, 2);
    const visibleSessions = [...recentSessions];

    if (selectedId && !visibleSessions.some((session) => session.id === selectedId)) {
      const selectedMatch = orderedSessions.find((session) => session.id === selectedId);
      if (selectedMatch) visibleSessions.push(selectedMatch);
    }

    const uniqueVisibleSessions = visibleSessions.filter((session, index, collection) => collection.findIndex((item) => item.id === session.id) === index);
    const overflowSessions = orderedSessions.filter((session) => !uniqueVisibleSessions.some((item) => item.id === session.id));

    return { visibleSessions: uniqueVisibleSessions, overflowSessions };
  }, [orderedSessions, selectedSession]);

  const desktopSessionSelection = useMemo(() => {
    const selectedId = selectedSession?.id ?? "";
    const recentSessions = orderedSessions.slice(0, 4);
    const visibleSessions = [...recentSessions];

    if (selectedId && !visibleSessions.some((session) => session.id === selectedId)) {
      const selectedMatch = orderedSessions.find((session) => session.id === selectedId);
      if (selectedMatch) visibleSessions.push(selectedMatch);
    }

    const uniqueVisibleSessions = visibleSessions.filter((session, index, collection) => collection.findIndex((item) => item.id === session.id) === index);
    const overflowSessions = orderedSessions.filter((session) => !uniqueVisibleSessions.some((item) => item.id === session.id));

    return { visibleSessions: uniqueVisibleSessions, overflowSessions };
  }, [orderedSessions, selectedSession]);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Committee"
          title="Session-wise committee lineup of XYZ Tech Club."
          description="Explore the active committee first, then switch between previous sessions to see how leadership changed over time."
          actions={<MembershipApplyCta label="Join the Club" className="primary-button h-11 px-5 text-sm" />}
        />

        <SectionWrapper title="Committee sessions" description="Each committee is organized by academic session and controlled from the super admin panel.">
          {sessions.length ? (
            <>
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex flex-wrap gap-2">
                  {mobileSessionSelection.visibleSessions.map((session) => (
                    <FilterChip key={session.id} label={session.label} active={selectedSession?.id === session.id} onClick={() => setSelectedSessionId(session.id)} />
                  ))}
                </div>
                {mobileSessionSelection.overflowSessions.length ? (
                  <label className="grid gap-2">
                    <select
                      value={mobileSessionSelection.overflowSessions.some((session) => session.id === selectedSession?.id) ? selectedSession?.id ?? "" : ""}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        setSelectedSessionId(event.target.value);
                      }}
                      className="input-base h-11 w-full px-4 text-sm"
                    >
                      <option value="">Choose a session</option>
                      {mobileSessionSelection.overflowSessions.map((session) => (
                        <option key={session.id} value={session.id}>{session.label}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              <div className="hidden flex-col gap-3 sm:flex lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {desktopSessionSelection.visibleSessions.map((session) => (
                    <FilterChip key={session.id} label={session.label} active={selectedSession?.id === session.id} onClick={() => setSelectedSessionId(session.id)} />
                  ))}
                </div>
                {desktopSessionSelection.overflowSessions.length ? (
                  <label className="grid gap-2 lg:min-w-[220px]">
                    <select
                      value={desktopSessionSelection.overflowSessions.some((session) => session.id === selectedSession?.id) ? selectedSession?.id ?? "" : ""}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        setSelectedSessionId(event.target.value);
                      }}
                      className="input-base h-11 w-full px-4 text-sm"
                    >
                      <option value="">Choose a session</option>
                      {desktopSessionSelection.overflowSessions.map((session) => (
                        <option key={session.id} value={session.id}>{session.label}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              {selectedSession ? (
                <div className="mt-6 grid gap-6">
                  <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/60 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Committee term</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{selectedSession.title || `Committee ${selectedSession.label}`}</h2>
                        {selectedSession.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)]">{selectedSession.description}</p> : null}
                      </div>
                      {selectedSession.isActive ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Current committee</span> : null}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white/60 p-3">
                    <div className="relative aspect-[16/7] overflow-hidden rounded-[1.25rem] bg-[var(--color-page)]">
                      <Image src={selectedSession.coverImageUrl || defaultCommitteeGroupPhotoUrl} alt={`${selectedSession.label} committee group`} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 72rem" unoptimized />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {selectedSession.assignments.map((member) => <CommitteeMemberCard key={member.id || `${member.name}-${member.role}`} member={member} />)}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">No committee session is published yet.</p>
          )}
        </SectionWrapper>
      </div>
    </main>
  );
}
