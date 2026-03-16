"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { faqItems } from "@/features/home/home-content";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { settingsSchema, SettingsSchema } from "@/schemas/settings.schema";
import { settingsService } from "@/services/settings.service";

const defaultValues: SettingsSchema = {
  organizationName: "",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  aboutText: "",
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

export function AdminSettingsManager() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsSchema>({ resolver: zodResolver(settingsSchema), defaultValues });
  const faqFieldArray = useFieldArray({ control, name: "faqs" });

  const saveMutation = useMutation({
    mutationFn: settingsService.upsertSettings,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Settings saved successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.detail });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Settings update failed.")),
  });

  React.useEffect(() => {
    const current = settingsQuery.data?.data;
    if (current) {
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
        aboutSectionPhotoUrl: current.aboutSectionPhotoUrl ?? "",
        facebook: links.facebook ?? "",
        linkedin: links.linkedin ?? "",
        github: links.github ?? "",
        heroSlide1Image: heroSlides[0]?.image ?? links.heroSlide1Image ?? "",
        heroSlide1Title: heroSlides[0]?.title ?? links.heroSlide1Title ?? "",
        heroSlide1Description: heroSlides[0]?.description ?? links.heroSlide1Description ?? "",
        heroSlide2Image: heroSlides[1]?.image ?? links.heroSlide2Image ?? "",
        heroSlide2Title: heroSlides[1]?.title ?? links.heroSlide2Title ?? "",
        heroSlide2Description: heroSlides[1]?.description ?? links.heroSlide2Description ?? "",
        heroSlide3Image: heroSlides[2]?.image ?? links.heroSlide3Image ?? "",
        heroSlide3Title: heroSlides[2]?.title ?? links.heroSlide3Title ?? "",
        heroSlide3Description: heroSlides[2]?.description ?? links.heroSlide3Description ?? "",
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
    }
  }, [settingsQuery.data, reset]);

  if (settingsQuery.isLoading) return <LoadingState title="Loading settings" description="Fetching site settings from the backend." />;
  if (settingsQuery.isError) return <EmptyState title="Unable to load settings" description={getApiErrorMessage(settingsQuery.error, "Please verify your admin session.")} />;

  return (
    <form
      className="grid gap-6"
      onSubmit={handleSubmit((values) => {
        const socialLinksEntries = Object.entries({
          facebook: values.facebook?.trim(),
          linkedin: values.linkedin?.trim(),
          github: values.github?.trim(),
        }).filter((entry): entry is [string, string] => Boolean(entry[1]));
        const socialLinks = Object.fromEntries(socialLinksEntries) as Record<string, string>;

        const heroSlides = [
          { image: values.heroSlide1Image?.trim(), title: values.heroSlide1Title?.trim(), description: values.heroSlide1Description?.trim(), tag: "Coding team" },
          { image: values.heroSlide2Image?.trim(), title: values.heroSlide2Title?.trim(), description: values.heroSlide2Description?.trim(), tag: "Campus lab" },
          { image: values.heroSlide3Image?.trim(), title: values.heroSlide3Title?.trim(), description: values.heroSlide3Description?.trim(), tag: "Teamwork" },
        ].filter(
          (slide): slide is { image: string; title: string; description: string; tag: string } => Boolean(slide.image && slide.title && slide.description),
        );

        const impactStats = {
          activeMembers: parseOptionalCount(values.activeMembersCount),
          eventsDelivered: parseOptionalCount(values.eventsDeliveredCount),
          projectsShipped: parseOptionalCount(values.projectsShippedCount),
          mentorsAndSeniors: parseOptionalCount(values.mentorsAndSeniorsCount),
        };

        const faqs = values.faqs
          .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
          .filter((item) => item.question && item.answer);

        const testimonials = [
          { quote: values.testimonial1Quote?.trim(), author: values.testimonial1Author?.trim(), meta: values.testimonial1Meta?.trim() },
          { quote: values.testimonial2Quote?.trim(), author: values.testimonial2Author?.trim(), meta: values.testimonial2Meta?.trim() },
          { quote: values.testimonial3Quote?.trim(), author: values.testimonial3Author?.trim(), meta: values.testimonial3Meta?.trim() },
        ].filter(
          (item): item is { quote: string; author: string; meta: string } => Boolean(item.quote && item.author && item.meta),
        );

        const committeeMembers = [
          { name: values.committeeMember1Name?.trim(), role: values.committeeMember1Role?.trim(), department: values.committeeMember1Department?.trim(), bio: values.committeeMember1Bio?.trim() || undefined, photoUrl: values.committeeMember1PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember1FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember1LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember1Whatsapp?.trim() || undefined, email: values.committeeMember1Email?.trim() || undefined },
          { name: values.committeeMember2Name?.trim(), role: values.committeeMember2Role?.trim(), department: values.committeeMember2Department?.trim(), bio: values.committeeMember2Bio?.trim() || undefined, photoUrl: values.committeeMember2PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember2FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember2LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember2Whatsapp?.trim() || undefined, email: values.committeeMember2Email?.trim() || undefined },
          { name: values.committeeMember3Name?.trim(), role: values.committeeMember3Role?.trim(), department: values.committeeMember3Department?.trim(), bio: values.committeeMember3Bio?.trim() || undefined, photoUrl: values.committeeMember3PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember3FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember3LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember3Whatsapp?.trim() || undefined, email: values.committeeMember3Email?.trim() || undefined },
          { name: values.committeeMember4Name?.trim(), role: values.committeeMember4Role?.trim(), department: values.committeeMember4Department?.trim(), bio: values.committeeMember4Bio?.trim() || undefined, photoUrl: values.committeeMember4PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember4FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember4LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember4Whatsapp?.trim() || undefined, email: values.committeeMember4Email?.trim() || undefined },
          { name: values.committeeMember5Name?.trim(), role: values.committeeMember5Role?.trim(), department: values.committeeMember5Department?.trim(), bio: values.committeeMember5Bio?.trim() || undefined, photoUrl: values.committeeMember5PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember5FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember5LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember5Whatsapp?.trim() || undefined, email: values.committeeMember5Email?.trim() || undefined },
          { name: values.committeeMember6Name?.trim(), role: values.committeeMember6Role?.trim(), department: values.committeeMember6Department?.trim(), bio: values.committeeMember6Bio?.trim() || undefined, photoUrl: values.committeeMember6PhotoUrl?.trim() || undefined, facebookUrl: values.committeeMember6FacebookUrl?.trim() || undefined, linkedinUrl: values.committeeMember6LinkedinUrl?.trim() || undefined, whatsapp: values.committeeMember6Whatsapp?.trim() || undefined, email: values.committeeMember6Email?.trim() || undefined },
        ]
          .filter((member) => Boolean(member.name && member.role && member.department))
          .map((member) => ({ name: member.name!, role: member.role!, department: member.department!, bio: member.bio, photoUrl: member.photoUrl, facebookUrl: member.facebookUrl, linkedinUrl: member.linkedinUrl, whatsapp: member.whatsapp, email: member.email }));

        const hasImpactStats = Object.values(impactStats).some((value) => value !== undefined);

        saveMutation.mutate({
          organizationName: values.organizationName,
          logoUrl: values.logoUrl || undefined,
          contactEmail: values.contactEmail || undefined,
          phone: values.phone || undefined,
          aboutText: values.aboutText || undefined,
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
      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">General settings</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Core organization details, contact data, and public profile content.</p>
        </div>
        <div className="grid gap-4">
          <FormField label="Organization name" error={errors.organizationName} disabled={saveMutation.isPending} {...register("organizationName")} />
          <FormField label="Logo URL" error={errors.logoUrl} disabled={saveMutation.isPending} {...register("logoUrl")} />
          <FormField label="Contact email" error={errors.contactEmail} disabled={saveMutation.isPending} {...register("contactEmail")} />
          <FormField label="Phone" error={errors.phone} disabled={saveMutation.isPending} {...register("phone")} />
          <FormTextarea label="About text" error={errors.aboutText} disabled={saveMutation.isPending} {...register("aboutText")} />
          <FormField label="About section image URL" error={errors.aboutSectionPhotoUrl} disabled={saveMutation.isPending} {...register("aboutSectionPhotoUrl")} />
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">FAQs</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Add, edit, or delete FAQ items that appear in the public accordion section.</p>
        </div>
        <div className="grid gap-4">
          {faqFieldArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/60 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">FAQ {index + 1}</p>
                <button
                  type="button"
                  onClick={() => faqFieldArray.remove(index)}
                  disabled={faqFieldArray.fields.length === 1 || saveMutation.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
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
          <button
            type="button"
            onClick={() => faqFieldArray.append({ question: "", answer: "" })}
            disabled={faqFieldArray.fields.length >= 12 || saveMutation.isPending}
            className="secondary-button h-11 self-start px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </button>
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Committee members</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">These profiles power the committee preview and full committee page.</p>
        </div>
        <div className="grid gap-6">
          <FormField label="Committee section photo URL" error={errors.committeeGroupPhotoUrl} disabled={saveMutation.isPending} {...register("committeeGroupPhotoUrl")} />
          {([1, 2, 3, 4, 5, 6] as const).map((number) => (
            <div key={number} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Committee member ${number} name`} error={(errors as any)[`committeeMember${number}Name`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Name` as const)} />
                <FormField label={`Committee member ${number} role`} error={(errors as any)[`committeeMember${number}Role`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Role` as const)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Committee member ${number} department`} error={(errors as any)[`committeeMember${number}Department`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Department` as const)} />
                <FormField label={`Committee member ${number} photo URL`} error={(errors as any)[`committeeMember${number}PhotoUrl`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}PhotoUrl` as const)} />
              </div>
              <FormTextarea label={`Committee member ${number} short bio`} error={(errors as any)[`committeeMember${number}Bio`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Bio` as const)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Committee member ${number} Facebook URL`} error={(errors as any)[`committeeMember${number}FacebookUrl`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}FacebookUrl` as const)} />
                <FormField label={`Committee member ${number} LinkedIn URL`} error={(errors as any)[`committeeMember${number}LinkedinUrl`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}LinkedinUrl` as const)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Committee member ${number} WhatsApp`} error={(errors as any)[`committeeMember${number}Whatsapp`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Whatsapp` as const)} />
                <FormField label={`Committee member ${number} email`} error={(errors as any)[`committeeMember${number}Email`]} disabled={saveMutation.isPending} {...register(`committeeMember${number}Email` as const)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Impact stats</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">These numbers drive the landing page stats cards and count-up presentation.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField type="number" min="0" inputMode="numeric" label="Active members" error={errors.activeMembersCount} disabled={saveMutation.isPending} {...register("activeMembersCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Events delivered" error={errors.eventsDeliveredCount} disabled={saveMutation.isPending} {...register("eventsDeliveredCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Projects shipped" error={errors.projectsShippedCount} disabled={saveMutation.isPending} {...register("projectsShippedCount")} />
          <FormField type="number" min="0" inputMode="numeric" label="Mentors and seniors" error={errors.mentorsAndSeniorsCount} disabled={saveMutation.isPending} {...register("mentorsAndSeniorsCount")} />
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Testimonials</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Keep these short, real, and specific so the public section feels credible.</p>
        </div>
        <div className="grid gap-6">
          {([1, 2, 3] as const).map((number) => (
            <div key={number} className="grid gap-4">
              <FormTextarea label={`Testimonial ${number} quote`} error={(errors as any)[`testimonial${number}Quote`]} disabled={saveMutation.isPending} {...register(`testimonial${number}Quote` as const)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`Testimonial ${number} author`} error={(errors as any)[`testimonial${number}Author`]} disabled={saveMutation.isPending} {...register(`testimonial${number}Author` as const)} />
                <FormField label={`Testimonial ${number} meta`} error={(errors as any)[`testimonial${number}Meta`]} disabled={saveMutation.isPending} {...register(`testimonial${number}Meta` as const)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Social links</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">These links appear in the public footer and contact areas.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Facebook" error={errors.facebook} disabled={saveMutation.isPending} {...register("facebook")} />
          <FormField label="LinkedIn" error={errors.linkedin} disabled={saveMutation.isPending} {...register("linkedin")} />
          <FormField label="GitHub" error={errors.github} disabled={saveMutation.isPending} {...register("github")} />
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Hero slides</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Super admin can control each carousel image, title, and description from settings.</p>
        </div>
        <div className="grid gap-6">
          {([1, 2, 3] as const).map((number) => (
            <div key={number} className="grid gap-4">
              <FormField label={`Hero slide ${number} image URL`} error={(errors as any)[`heroSlide${number}Image`]} disabled={saveMutation.isPending} {...register(`heroSlide${number}Image` as const)} />
              <FormField label={`Hero slide ${number} title`} error={(errors as any)[`heroSlide${number}Title`]} disabled={saveMutation.isPending} {...register(`heroSlide${number}Title` as const)} />
              <FormTextarea label={`Hero slide ${number} description`} error={(errors as any)[`heroSlide${number}Description`]} disabled={saveMutation.isPending} {...register(`heroSlide${number}Description` as const)} />
            </div>
          ))}
        </div>
      </div>

      <FormActions isSubmitting={saveMutation.isPending} submitLabel="Save settings" helperText="Settings update uses the backend settings module and admin authorization." />
    </form>
  );
}

