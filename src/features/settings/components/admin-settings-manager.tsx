"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { WarningConfirmModal } from "@/components/shared/warning-confirm-modal";
import { EmptyState } from "@/components/feedback/empty-state";
import { FormLoadingState } from "@/components/feedback/form-loading-state";
import { faqItems } from "@/features/home/home-content";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { settingsSchema, SettingsSchema } from "@/schemas/settings.schema";
import { settingsService } from "@/services/settings.service";

const committeeIndexes = [1, 2, 3, 4, 5, 6] as const;
type SectionKey = "general" | "hero" | "about" | "stats" | "committee" | "testimonials" | "faq" | "social";

const defaultValues: SettingsSchema = {
  organizationName: "",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  aboutText: "",
  aboutMission: "",
  aboutVision: "",
  aboutCollaboration: "",
  aboutSectionPhotoUrl: "",
  facebook: "",
  linkedin: "",
  github: "",
  heroSlide1Image: "",
  heroSlide1Title: "",
  heroSlide1Description: "",
  heroSlide2Image: "",
  heroSlide2Title: "",
  heroSlide2Description: "",
  heroSlide3Image: "",
  heroSlide3Title: "",
  heroSlide3Description: "",
  activeMembersCount: "",
  eventsDeliveredCount: "",
  projectsShippedCount: "",
  mentorsAndSeniorsCount: "",
  faqs: faqItems.map((item) => ({ question: item.question, answer: item.answer })),
  testimonial1Quote: "",
  testimonial1Author: "",
  testimonial1Meta: "",
  testimonial2Quote: "",
  testimonial2Author: "",
  testimonial2Meta: "",
  testimonial3Quote: "",
  testimonial3Author: "",
  testimonial3Meta: "",
  committeeMember1Name: "",
  committeeMember1Role: "",
  committeeMember1Department: "",
  committeeMember1Bio: "",
  committeeMember1PhotoUrl: "",
  committeeMember1FacebookUrl: "",
  committeeMember1LinkedinUrl: "",
  committeeMember1Whatsapp: "",
  committeeMember1Email: "",
  committeeMember2Name: "",
  committeeMember2Role: "",
  committeeMember2Department: "",
  committeeMember2Bio: "",
  committeeMember2PhotoUrl: "",
  committeeMember2FacebookUrl: "",
  committeeMember2LinkedinUrl: "",
  committeeMember2Whatsapp: "",
  committeeMember2Email: "",
  committeeMember3Name: "",
  committeeMember3Role: "",
  committeeMember3Department: "",
  committeeMember3Bio: "",
  committeeMember3PhotoUrl: "",
  committeeMember3FacebookUrl: "",
  committeeMember3LinkedinUrl: "",
  committeeMember3Whatsapp: "",
  committeeMember3Email: "",
  committeeMember4Name: "",
  committeeMember4Role: "",
  committeeMember4Department: "",
  committeeMember4Bio: "",
  committeeMember4PhotoUrl: "",
  committeeMember4FacebookUrl: "",
  committeeMember4LinkedinUrl: "",
  committeeMember4Whatsapp: "",
  committeeMember4Email: "",
  committeeMember5Name: "",
  committeeMember5Role: "",
  committeeMember5Department: "",
  committeeMember5Bio: "",
  committeeMember5PhotoUrl: "",
  committeeMember5FacebookUrl: "",
  committeeMember5LinkedinUrl: "",
  committeeMember5Whatsapp: "",
  committeeMember5Email: "",
  committeeMember6Name: "",
  committeeMember6Role: "",
  committeeMember6Department: "",
  committeeMember6Bio: "",
  committeeMember6PhotoUrl: "",
  committeeMember6FacebookUrl: "",
  committeeMember6LinkedinUrl: "",
  committeeMember6Whatsapp: "",
  committeeMember6Email: "",
  committeeGroupPhotoUrl: "",
};

function parseOptionalCount(value?: string) {
  if (!value?.trim()) return undefined;
  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

type SettingsSectionProps = {
  title: string;
  usage: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function SettingsSection({ title, usage, description, open, onToggle, children }: SettingsSectionProps) {
  return (
    <section className="surface-card overflow-hidden rounded-[2rem]">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6" aria-expanded={open}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">{title}</h2>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{usage}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)]">
          <ChevronDown className={cn("h-5 w-5 transition-transform", open ? "rotate-180" : "rotate-0")} />
        </span>
      </button>
      {open ? <div className="border-t border-[var(--color-border)] px-5 py-5 sm:px-6">{children}</div> : null}
    </section>
  );
}

function renderFieldError<T extends keyof SettingsSchema>(errors: any, key: T) {
  return errors[key] as any;
}

function SectionSaveButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="mt-5 flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting}
        className="primary-button h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save Section"}
      </button>
    </div>
  );
}

export function AdminSettingsManager() {
  const queryClient = useQueryClient();
  const [openSections, setOpenSections] = React.useState<Record<SectionKey, boolean>>({
    general: false,
    hero: false,
    about: false,
    stats: false,
    committee: false,
    testimonials: false,
    faq: false,
    social: false,
  });
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<SettingsSchema>({ resolver: zodResolver(settingsSchema), defaultValues });
  const faqFieldArray = useFieldArray({ control, name: "faqs" });
  const [faqIndexToDelete, setFaqIndexToDelete] = React.useState<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: settingsService.upsertSettings,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Settings saved successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.detail });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Settings update failed.")),
  });

  const toggleSection = (section: SectionKey) => setOpenSections((current) => ({ ...current, [section]: !current[section] }));

  React.useEffect(() => {
    const current = settingsQuery.data?.data;
    if (!current) return;

    const links = (current.socialLinks ?? {}) as Record<string, string>;
    const heroSlides = current.heroSlides ?? [];
    const impactStats = current.impactStats ?? {};
    const faqs = current.faqs && current.faqs.length > 0 ? current.faqs : faqItems;
    const testimonials = current.testimonials ?? [];
    const committeeMembers = current.committeeMembers ?? [];

    reset({
      organizationName: current.organizationName ?? "",
      logoUrl: current.logoUrl ?? "",
      contactEmail: current.contactEmail ?? "",
      phone: current.phone ?? "",
      aboutText: current.aboutText ?? "",
      aboutMission: current.aboutMission ?? "",
      aboutVision: current.aboutVision ?? "",
      aboutCollaboration: current.aboutCollaboration ?? "",
      aboutSectionPhotoUrl: current.aboutSectionPhotoUrl ?? "",
      facebook: links.facebook ?? "",
      linkedin: links.linkedin ?? "",
      github: links.github ?? "",
      heroSlide1Image: heroSlides[0]?.image ?? "",
      heroSlide1Title: heroSlides[0]?.title ?? "",
      heroSlide1Description: heroSlides[0]?.description ?? "",
      heroSlide2Image: heroSlides[1]?.image ?? "",
      heroSlide2Title: heroSlides[1]?.title ?? "",
      heroSlide2Description: heroSlides[1]?.description ?? "",
      heroSlide3Image: heroSlides[2]?.image ?? "",
      heroSlide3Title: heroSlides[2]?.title ?? "",
      heroSlide3Description: heroSlides[2]?.description ?? "",
      activeMembersCount: impactStats.activeMembers?.toString() ?? "",
      eventsDeliveredCount: impactStats.eventsDelivered?.toString() ?? "",
      projectsShippedCount: impactStats.projectsShipped?.toString() ?? "",
      mentorsAndSeniorsCount: impactStats.mentorsAndSeniors?.toString() ?? "",
      faqs: faqs.map((item) => ({ question: item.question, answer: item.answer })),
      testimonial1Quote: testimonials[0]?.quote ?? "",
      testimonial1Author: testimonials[0]?.author ?? "",
      testimonial1Meta: testimonials[0]?.meta ?? "",
      testimonial2Quote: testimonials[1]?.quote ?? "",
      testimonial2Author: testimonials[1]?.author ?? "",
      testimonial2Meta: testimonials[1]?.meta ?? "",
      testimonial3Quote: testimonials[2]?.quote ?? "",
      testimonial3Author: testimonials[2]?.author ?? "",
      testimonial3Meta: testimonials[2]?.meta ?? "",
      committeeMember1Name: committeeMembers[0]?.name ?? "",
      committeeMember1Role: committeeMembers[0]?.role ?? "",
      committeeMember1Department: committeeMembers[0]?.department ?? "",
      committeeMember1Bio: committeeMembers[0]?.bio ?? "",
      committeeMember1PhotoUrl: committeeMembers[0]?.photoUrl ?? "",
      committeeMember1FacebookUrl: committeeMembers[0]?.facebookUrl ?? "",
      committeeMember1LinkedinUrl: committeeMembers[0]?.linkedinUrl ?? "",
      committeeMember1Whatsapp: committeeMembers[0]?.whatsapp ?? "",
      committeeMember1Email: committeeMembers[0]?.email ?? "",
      committeeMember2Name: committeeMembers[1]?.name ?? "",
      committeeMember2Role: committeeMembers[1]?.role ?? "",
      committeeMember2Department: committeeMembers[1]?.department ?? "",
      committeeMember2Bio: committeeMembers[1]?.bio ?? "",
      committeeMember2PhotoUrl: committeeMembers[1]?.photoUrl ?? "",
      committeeMember2FacebookUrl: committeeMembers[1]?.facebookUrl ?? "",
      committeeMember2LinkedinUrl: committeeMembers[1]?.linkedinUrl ?? "",
      committeeMember2Whatsapp: committeeMembers[1]?.whatsapp ?? "",
      committeeMember2Email: committeeMembers[1]?.email ?? "",
      committeeMember3Name: committeeMembers[2]?.name ?? "",
      committeeMember3Role: committeeMembers[2]?.role ?? "",
      committeeMember3Department: committeeMembers[2]?.department ?? "",
      committeeMember3Bio: committeeMembers[2]?.bio ?? "",
      committeeMember3PhotoUrl: committeeMembers[2]?.photoUrl ?? "",
      committeeMember3FacebookUrl: committeeMembers[2]?.facebookUrl ?? "",
      committeeMember3LinkedinUrl: committeeMembers[2]?.linkedinUrl ?? "",
      committeeMember3Whatsapp: committeeMembers[2]?.whatsapp ?? "",
      committeeMember3Email: committeeMembers[2]?.email ?? "",
      committeeMember4Name: committeeMembers[3]?.name ?? "",
      committeeMember4Role: committeeMembers[3]?.role ?? "",
      committeeMember4Department: committeeMembers[3]?.department ?? "",
      committeeMember4Bio: committeeMembers[3]?.bio ?? "",
      committeeMember4PhotoUrl: committeeMembers[3]?.photoUrl ?? "",
      committeeMember4FacebookUrl: committeeMembers[3]?.facebookUrl ?? "",
      committeeMember4LinkedinUrl: committeeMembers[3]?.linkedinUrl ?? "",
      committeeMember4Whatsapp: committeeMembers[3]?.whatsapp ?? "",
      committeeMember4Email: committeeMembers[3]?.email ?? "",
      committeeMember5Name: committeeMembers[4]?.name ?? "",
      committeeMember5Role: committeeMembers[4]?.role ?? "",
      committeeMember5Department: committeeMembers[4]?.department ?? "",
      committeeMember5Bio: committeeMembers[4]?.bio ?? "",
      committeeMember5PhotoUrl: committeeMembers[4]?.photoUrl ?? "",
      committeeMember5FacebookUrl: committeeMembers[4]?.facebookUrl ?? "",
      committeeMember5LinkedinUrl: committeeMembers[4]?.linkedinUrl ?? "",
      committeeMember5Whatsapp: committeeMembers[4]?.whatsapp ?? "",
      committeeMember5Email: committeeMembers[4]?.email ?? "",
      committeeMember6Name: committeeMembers[5]?.name ?? "",
      committeeMember6Role: committeeMembers[5]?.role ?? "",
      committeeMember6Department: committeeMembers[5]?.department ?? "",
      committeeMember6Bio: committeeMembers[5]?.bio ?? "",
      committeeMember6PhotoUrl: committeeMembers[5]?.photoUrl ?? "",
      committeeMember6FacebookUrl: committeeMembers[5]?.facebookUrl ?? "",
      committeeMember6LinkedinUrl: committeeMembers[5]?.linkedinUrl ?? "",
      committeeMember6Whatsapp: committeeMembers[5]?.whatsapp ?? "",
      committeeMember6Email: committeeMembers[5]?.email ?? "",
      committeeGroupPhotoUrl: current.committeeGroupPhotoUrl ?? "",
    });
  }, [settingsQuery.data, reset]);

  if (settingsQuery.isLoading) return <FormLoadingState title="Loading club settings" description="Preparing your XYZ Tech Club site settings and public content." fields={9} />;
  if (settingsQuery.isError) return <EmptyState title="Unable to load settings" description={getApiErrorMessage(settingsQuery.error, "Please verify your admin session.")} />;

  return (
    <form
      className="grid gap-6"
      onSubmit={handleSubmit((values) => {
        const socialLinksEntries = Object.entries({ facebook: values.facebook?.trim(), linkedin: values.linkedin?.trim(), github: values.github?.trim() }).filter((entry): entry is [string, string] => Boolean(entry[1]));
        const socialLinks = Object.fromEntries(socialLinksEntries) as Record<string, string>;
        const heroSlides = [
          { image: values.heroSlide1Image?.trim(), title: values.heroSlide1Title?.trim(), description: values.heroSlide1Description?.trim(), tag: "Coding team" },
          { image: values.heroSlide2Image?.trim(), title: values.heroSlide2Title?.trim(), description: values.heroSlide2Description?.trim(), tag: "Campus lab" },
          { image: values.heroSlide3Image?.trim(), title: values.heroSlide3Title?.trim(), description: values.heroSlide3Description?.trim(), tag: "Teamwork" },
        ].filter((slide): slide is { image: string; title: string; description: string; tag: string } => Boolean(slide.image && slide.title && slide.description));
        const impactStats = {
          activeMembers: parseOptionalCount(values.activeMembersCount),
          eventsDelivered: parseOptionalCount(values.eventsDeliveredCount),
          projectsShipped: parseOptionalCount(values.projectsShippedCount),
          mentorsAndSeniors: parseOptionalCount(values.mentorsAndSeniorsCount),
        };
        const faqs = values.faqs.map((item) => ({ question: item.question.trim(), answer: item.answer.trim() })).filter((item) => item.question && item.answer);
        const testimonials = [
          { quote: values.testimonial1Quote?.trim(), author: values.testimonial1Author?.trim(), meta: values.testimonial1Meta?.trim() },
          { quote: values.testimonial2Quote?.trim(), author: values.testimonial2Author?.trim(), meta: values.testimonial2Meta?.trim() },
          { quote: values.testimonial3Quote?.trim(), author: values.testimonial3Author?.trim(), meta: values.testimonial3Meta?.trim() },
        ].filter((item): item is { quote: string; author: string; meta: string } => Boolean(item.quote && item.author && item.meta));
        const committeeMembers = committeeIndexes.map((number) => ({
          name: values[`committeeMember${number}Name` as keyof SettingsSchema]?.toString().trim() || "",
          role: values[`committeeMember${number}Role` as keyof SettingsSchema]?.toString().trim() || "",
          department: values[`committeeMember${number}Department` as keyof SettingsSchema]?.toString().trim() || "",
          bio: values[`committeeMember${number}Bio` as keyof SettingsSchema]?.toString().trim() || undefined,
          photoUrl: values[`committeeMember${number}PhotoUrl` as keyof SettingsSchema]?.toString().trim() || undefined,
          facebookUrl: values[`committeeMember${number}FacebookUrl` as keyof SettingsSchema]?.toString().trim() || undefined,
          linkedinUrl: values[`committeeMember${number}LinkedinUrl` as keyof SettingsSchema]?.toString().trim() || undefined,
          whatsapp: values[`committeeMember${number}Whatsapp` as keyof SettingsSchema]?.toString().trim() || undefined,
          email: values[`committeeMember${number}Email` as keyof SettingsSchema]?.toString().trim() || undefined,
        })).filter((member) => Boolean(member.name && member.role && member.department));
        const hasImpactStats = Object.values(impactStats).some((value) => value !== undefined);
        saveMutation.mutate({
          organizationName: values.organizationName,
          logoUrl: values.logoUrl || undefined,
          contactEmail: values.contactEmail || undefined,
          phone: values.phone || undefined,
          aboutText: values.aboutText || undefined,
          aboutMission: values.aboutMission || undefined,
          aboutVision: values.aboutVision || undefined,
          aboutCollaboration: values.aboutCollaboration || undefined,
          aboutSectionPhotoUrl: values.aboutSectionPhotoUrl || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          heroSlides: heroSlides.length > 0 ? heroSlides : undefined,
          impactStats: hasImpactStats ? impactStats : undefined,
          faqs,
          testimonials: testimonials.length > 0 ? testimonials : undefined,
          committeeMembers: committeeMembers.length > 0 ? committeeMembers : undefined,
          committeeGroupPhotoUrl: values.committeeGroupPhotoUrl?.trim() || undefined,
        });
      })}
      noValidate
    >
      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]">Settings workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Manage public club content</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)]">This page controls the static public content of XYZ Tech Club: branding, homepage slides, about copy, FAQs, and footer links.</p>
      </section>

      <SettingsSection title="General" usage="Navbar + Footer" description="Core identity and contact data used across the public site." open={openSections.general} onToggle={() => toggleSection("general")}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Organization name" error={errors.organizationName} disabled={saveMutation.isPending} {...register("organizationName")} />
          <FormField label="Logo URL" error={errors.logoUrl} disabled={saveMutation.isPending} {...register("logoUrl")} />
          <FormField label="Contact email" error={errors.contactEmail} disabled={saveMutation.isPending} {...register("contactEmail")} />
          <FormField label="Phone" error={errors.phone} disabled={saveMutation.isPending} {...register("phone")} />
        </div>
        <SectionSaveButton isSubmitting={saveMutation.isPending} />
      </SettingsSection>

      <SettingsSection title="Homepage hero" usage="Home" description="Control the image, title, and short copy for the public hero slider." open={openSections.hero} onToggle={() => toggleSection("hero")}>
        <div className="grid gap-6">
          {([1, 2, 3] as const).map((number) => (
            <div key={number} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">Slide {number}</p>
              <div className="mt-4 grid gap-4">
                <FormField label="Image URL" error={renderFieldError(errors, `heroSlide${number}Image` as keyof SettingsSchema)} disabled={saveMutation.isPending} {...register(`heroSlide${number}Image` as const)} />
                <FormField label="Title" error={renderFieldError(errors, `heroSlide${number}Title` as keyof SettingsSchema)} disabled={saveMutation.isPending} {...register(`heroSlide${number}Title` as const)} />
                <FormTextarea label="Description" error={renderFieldError(errors, `heroSlide${number}Description` as keyof SettingsSchema)} disabled={saveMutation.isPending} {...register(`heroSlide${number}Description` as const)} />
              </div>
            </div>
          ))}
        </div>
        <SectionSaveButton isSubmitting={saveMutation.isPending} />
      </SettingsSection>

      <SettingsSection title="About page" usage="About + Home" description="Mission, vision, story copy, and the supporting image used in the public about flow." open={openSections.about} onToggle={() => toggleSection("about")}>
        <div className="grid gap-4">
          <FormTextarea label="About text" error={errors.aboutText} disabled={saveMutation.isPending} {...register("aboutText")} />
          <FormTextarea label="Mission" error={errors.aboutMission} disabled={saveMutation.isPending} {...register("aboutMission")} />
          <FormTextarea label="Vision" error={errors.aboutVision} disabled={saveMutation.isPending} {...register("aboutVision")} />
          <FormTextarea label="Collaboration text" error={errors.aboutCollaboration} disabled={saveMutation.isPending} {...register("aboutCollaboration")} />
          <FormField label="About section image URL" error={errors.aboutSectionPhotoUrl} disabled={saveMutation.isPending} {...register("aboutSectionPhotoUrl")} />
        </div>
      </SettingsSection>
      <SettingsSection title="Homepage stats" usage="Home" description="Highlight counts shown on the landing page." open={openSections.stats} onToggle={() => toggleSection("stats")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField type="number" min="0" inputMode="numeric" label="Active members" error={errors.activeMembersCount} disabled={saveMutation.isPending} {...register("activeMembersCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Events delivered" error={errors.eventsDeliveredCount} disabled={saveMutation.isPending} {...register("eventsDeliveredCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Projects shipped" error={errors.projectsShippedCount} disabled={saveMutation.isPending} {...register("projectsShippedCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Mentors and seniors" error={errors.mentorsAndSeniorsCount} disabled={saveMutation.isPending} {...register("mentorsAndSeniorsCount")} />
        </div>
        <SectionSaveButton isSubmitting={saveMutation.isPending} />
      </SettingsSection>

      <SettingsSection title="FAQ" usage="Home" description="Public question-answer items for visitors, applicants, and members." open={openSections.faq} onToggle={() => toggleSection("faq")}>
        <div className="grid gap-4">
          {faqFieldArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">FAQ {index + 1}</p>
                <button type="button" onClick={() => setFaqIndexToDelete(index)} disabled={faqFieldArray.fields.length === 1 || saveMutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <Minus className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <div className="grid gap-4">
                <FormField label="Question" error={errors.faqs?.[index]?.question as any} disabled={saveMutation.isPending} {...register(`faqs.${index}.question` as const)} />
                <FormTextarea label="Answer" error={errors.faqs?.[index]?.answer as any} disabled={saveMutation.isPending} {...register(`faqs.${index}.answer` as const)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => faqFieldArray.append({ question: "", answer: "" })} disabled={faqFieldArray.fields.length >= 12 || saveMutation.isPending} className="secondary-button h-11 self-start px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </button>
        </div>
        <SectionSaveButton isSubmitting={saveMutation.isPending} />
      </SettingsSection>

      <SettingsSection title="Social links" usage="Footer" description="Public social links reused in the footer and contact areas." open={openSections.social} onToggle={() => toggleSection("social")}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Facebook" error={errors.facebook} disabled={saveMutation.isPending} {...register("facebook")} />
          <FormField label="LinkedIn" error={errors.linkedin} disabled={saveMutation.isPending} {...register("linkedin")} />
          <FormField label="GitHub" error={errors.github} disabled={saveMutation.isPending} {...register("github")} />
        </div>
        <SectionSaveButton isSubmitting={saveMutation.isPending} />
      </SettingsSection>

      <WarningConfirmModal
        open={faqIndexToDelete !== null}
        title="Delete this FAQ?"
        description="This question and answer will be removed from the public FAQ list after you save the settings."
        confirmLabel="Delete FAQ"
        cancelLabel="Keep FAQ"
        onConfirm={() => {
          if (faqIndexToDelete === null) return;
          faqFieldArray.remove(faqIndexToDelete);
          setFaqIndexToDelete(null);
        }}
        onCancel={() => setFaqIndexToDelete(null)}
      />
    </form>
  );
}




