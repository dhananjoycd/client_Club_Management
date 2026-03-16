"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
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
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsSchema>({ resolver: zodResolver(settingsSchema), defaultValues });

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

      reset({
        organizationName: current.organizationName ?? "",
        logoUrl: current.logoUrl ?? "",
        contactEmail: current.contactEmail ?? "",
        phone: current.phone ?? "",
        aboutText: current.aboutText ?? "",
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
          {
            image: values.heroSlide1Image?.trim(),
            title: values.heroSlide1Title?.trim(),
            description: values.heroSlide1Description?.trim(),
            tag: "Coding team",
          },
          {
            image: values.heroSlide2Image?.trim(),
            title: values.heroSlide2Title?.trim(),
            description: values.heroSlide2Description?.trim(),
            tag: "Campus lab",
          },
          {
            image: values.heroSlide3Image?.trim(),
            title: values.heroSlide3Title?.trim(),
            description: values.heroSlide3Description?.trim(),
            tag: "Teamwork",
          },
        ].filter(
          (slide): slide is { image: string; title: string; description: string; tag: string } =>
            Boolean(slide.image && slide.title && slide.description),
        );

        const impactStats = {
          activeMembers: parseOptionalCount(values.activeMembersCount),
          eventsDelivered: parseOptionalCount(values.eventsDeliveredCount),
          projectsShipped: parseOptionalCount(values.projectsShippedCount),
          mentorsAndSeniors: parseOptionalCount(values.mentorsAndSeniorsCount),
        };

        const hasImpactStats = Object.values(impactStats).some((value) => value !== undefined);

        saveMutation.mutate({
          organizationName: values.organizationName,
          logoUrl: values.logoUrl || undefined,
          contactEmail: values.contactEmail || undefined,
          phone: values.phone || undefined,
          aboutText: values.aboutText || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          heroSlides: heroSlides.length > 0 ? heroSlides : undefined,
          impactStats: hasImpactStats ? impactStats : undefined,
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
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Hero slide 1</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Super admin can control each carousel image, title, and description from settings.</p>
        </div>
        <div className="grid gap-4">
          <FormField label="Image URL" error={errors.heroSlide1Image} disabled={saveMutation.isPending} {...register("heroSlide1Image")} />
          <FormField label="Title" error={errors.heroSlide1Title} disabled={saveMutation.isPending} {...register("heroSlide1Title")} />
          <FormTextarea label="Description" error={errors.heroSlide1Description} disabled={saveMutation.isPending} {...register("heroSlide1Description")} />
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Hero slide 2</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Super admin can control each carousel image, title, and description from settings.</p>
        </div>
        <div className="grid gap-4">
          <FormField label="Image URL" error={errors.heroSlide2Image} disabled={saveMutation.isPending} {...register("heroSlide2Image")} />
          <FormField label="Title" error={errors.heroSlide2Title} disabled={saveMutation.isPending} {...register("heroSlide2Title")} />
          <FormTextarea label="Description" error={errors.heroSlide2Description} disabled={saveMutation.isPending} {...register("heroSlide2Description")} />
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Hero slide 3</h2>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Super admin can control each carousel image, title, and description from settings.</p>
        </div>
        <div className="grid gap-4">
          <FormField label="Image URL" error={errors.heroSlide3Image} disabled={saveMutation.isPending} {...register("heroSlide3Image")} />
          <FormField label="Title" error={errors.heroSlide3Title} disabled={saveMutation.isPending} {...register("heroSlide3Title")} />
          <FormTextarea label="Description" error={errors.heroSlide3Description} disabled={saveMutation.isPending} {...register("heroSlide3Description")} />
        </div>
      </div>

      <FormActions isSubmitting={saveMutation.isPending} submitLabel="Save settings" helperText="Settings update uses the backend settings module and admin authorization." />
    </form>
  );
}
