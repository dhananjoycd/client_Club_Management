"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Mail, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AiHelpAssistant } from "@/components/ai/ai-help-assistant";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FormActions } from "@/components/forms/form-actions";
import { FormField, FormTextarea } from "@/components/forms/form-field";
import { MembershipApplyCta } from "@/components/shared/membership-apply-cta";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { contactSchema, ContactSchema } from "@/schemas/contact.schema";
import { accountService } from "@/services/account.service";
import { authService } from "@/services/auth.service";
import { contactService } from "@/services/contact.service";
import { settingsService } from "@/services/settings.service";
import { contactCategoryLabels, contactCategoryOptions, contactStatusLabels } from "@/types/contact.types";

const statusVariant = (status: string) => status === "RESOLVED" ? "active" as const : status === "IN_PROGRESS" ? "pending" as const : "inactive" as const;

export function PublicContactView() {
  const queryClient = useQueryClient();
  const [isManualSupportOpen, setIsManualSupportOpen] = useState(false);
  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    defaultValues: { category: "GENERAL", phone: "", subject: "", message: "" },
  });

  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const settingsQuery = useQuery({ queryKey: queryKeys.settings.detail, queryFn: settingsService.getSettings, retry: false });
  const profileQuery = useQuery({
    queryKey: queryKeys.account.profile,
    queryFn: accountService.getProfile,
    enabled: Boolean(sessionQuery.data?.data?.user),
    retry: false,
  });
  const myMessagesQuery = useQuery({
    queryKey: queryKeys.contacts.mine,
    queryFn: contactService.getMyMessages,
    enabled: Boolean(sessionQuery.data?.data?.user),
    retry: false,
  });

  const sendMutation = useMutation({
    mutationFn: contactService.createMessage,
    onSuccess: async (response) => {
      toast.success(response.message ?? "Message sent successfully.");
      form.reset({ category: "GENERAL", phone: profile?.phone ?? "", subject: "", message: "" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Contact request failed.")),
  });

  const user = sessionQuery.data?.data?.user;
  const profile = profileQuery.data?.data;
  const settings = settingsQuery.data?.data;
  const myMessages = myMessagesQuery.data?.data || [];
  const contactName = profile?.name ?? user?.name ?? user?.email ?? "";
  const contactEmail = user?.email ?? "";
  const contactPhone = profile?.phone ?? "";
  const supportEmail = settings?.contactEmail?.trim() || "hello@xyztechclub.org";
  const latestResolvedNote = myMessages.find((item) => item.status === "RESOLVED" && item.adminNote)?.adminNote ?? null;

  useEffect(() => {
    if (user) {
      form.setValue("phone", contactPhone, { shouldDirty: false });
    }
  }, [contactPhone, form, user]);

  useEffect(() => {
    const syncManualSupportFromHash = () => {
      if (window.location.hash === "#manual-support") {
        setIsManualSupportOpen(true);
      }
    };

    syncManualSupportFromHash();
    window.addEventListener("hashchange", syncManualSupportFromHash);
    return () => window.removeEventListener("hashchange", syncManualSupportFromHash);
  }, []);

  if (settingsQuery.isLoading || sessionQuery.isLoading || (user && profileQuery.isLoading)) {
    return <LoadingState title="Loading contact page" description="Preparing support details and your message workspace." />;
  }

  if (settingsQuery.isError) {
    return <EmptyState title="Unable to load contact page" description={getApiErrorMessage(settingsQuery.error, "Please try again in a moment.")} />;
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Contact"
          title="Reach the admin team through one tracked support channel."
          description="Start with the AI assistant for quick help. If it cannot fully solve your issue, you can contact the admin team manually right below."
          actions={<MembershipApplyCta label="Join the Club" className="primary-button h-11 px-5 text-sm" />}
        />

        <div className="app-card rounded-4xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">AI-first support</p>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)] sm:text-2xl">Try the AI assistant before sending a manual contact request</h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)]">Ask about events, notices, membership, payments, or event manager access. If the assistant cannot fully help, open the manual support section and contact the admin team directly.</p>
            </div>
          </div>
        </div>

        <SectionWrapper
          title="AI assistant for quick help"
          description="Ask quick project questions about events, notices, membership, payment flow, or event manager access before sending a support request."
        >
          <AiHelpAssistant />
        </SectionWrapper>

        <SectionWrapper
          title="Manual support and contact"
          description="Open the manual support section if you want to contact the admin team directly or review how manual follow-up works."
        >
          <div id="manual-support" className="overflow-hidden rounded-[1.5rem] app-card scroll-mt-28">
            <button
              type="button"
              onClick={() => setIsManualSupportOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--color-primary-strong)] sm:text-lg">Need manual support instead?</p>
                <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">If AI cannot fully solve it, open this section to contact admins directly.</p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isManualSupportOpen ? "rotate-180" : "rotate-0"}`} />
              </span>
            </button>

            {isManualSupportOpen ? (
              <div className="border-t border-[var(--color-border)] px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">
                  You can contact the admin team at {supportEmail}. Your request stays attached to your account so replies and resolution notes remain trackable.
                </p>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="grid gap-3 text-sm text-[var(--color-muted-foreground)]">
                    <div className="rounded-[1.25rem] app-card-soft p-4">
                      <div className="flex items-center gap-3 text-[var(--color-primary-strong)]"><Mail className="h-4 w-4" /><span className="font-medium">Contact email</span></div>
                      <p className="mt-2 break-all">{supportEmail}</p>
                    </div>
                    <div className="rounded-[1.25rem] app-card-soft p-4">
                      <div className="flex items-center gap-3 text-[var(--color-primary-strong)]"><ShieldCheck className="h-4 w-4" /><span className="font-medium">Admin visibility</span></div>
                      <p className="mt-2">Admins and super admins can review, reply with a note, and mark your request as resolved.</p>
                    </div>
                    <div className="rounded-[1.25rem] app-card-soft p-4">
                      <div className="flex items-center gap-3 text-[var(--color-primary-strong)]"><MessageSquareText className="h-4 w-4" /><span className="font-medium">Latest resolution</span></div>
                      <p className="mt-2">{latestResolvedNote ?? "Resolved admin notes will appear here once one of your messages is closed."}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] app-card p-5">
                    <div className="mb-5 space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-[var(--color-primary-strong)]">Send a manual contact request</h3>
                      <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">Use a clear subject and enough detail so the admin team can help without follow-up delay.</p>
                    </div>
                    {!user ? (
                      <div className="grid gap-4 rounded-[1.5rem] app-card-soft p-5">
                        <p className="text-sm leading-7 text-[var(--color-muted-foreground)]">Sign in first to send a tracked contact request to the admin team. Your message history and admin notes will stay linked to your account.</p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link href="/login" className="primary-button h-11 px-5 text-sm">Login</Link>
                          <Link href="/register" className="secondary-button h-11 px-5 text-sm">Create account</Link>
                        </div>
                      </div>
                    ) : (
                      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => sendMutation.mutate(values))} noValidate>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField label="Full name" value={contactName} readOnly disabled className="cursor-not-allowed bg-[var(--color-page)] text-[var(--color-muted-foreground)]" />
                          <FormField label="Email" value={contactEmail} readOnly disabled className="cursor-not-allowed bg-[var(--color-page)] text-[var(--color-muted-foreground)]" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                          <label className="grid gap-2">
                            <span className="text-sm font-medium text-[var(--color-primary-strong)]">Category</span>
                            <select className="input-base h-12 px-4 text-sm" disabled={sendMutation.isPending} {...form.register("category")}>
                              {contactCategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {form.formState.errors.category ? <span className="text-sm text-rose-600">{form.formState.errors.category.message}</span> : null}
                          </label>
                          <FormField label="Phone" error={form.formState.errors.phone} disabled={sendMutation.isPending} placeholder="Add your contact phone number" {...form.register("phone")} />
                        </div>
                        <FormField label="Subject" error={form.formState.errors.subject} disabled={sendMutation.isPending} {...form.register("subject")} />
                        <FormTextarea label="Message" error={form.formState.errors.message} disabled={sendMutation.isPending} rows={7} {...form.register("message")} />
                        <FormActions isSubmitting={sendMutation.isPending} submitLabel="Send message" />
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Your recent contact requests" description="Track status changes and admin notes without leaving the platform.">
          {!user ? (
            <EmptyState title="Login required" description="Your personal contact history will appear here once you sign in and send a message." />
          ) : myMessagesQuery.isLoading ? (
            <LoadingState title="Loading your messages" description="Preparing your recent contact requests and admin responses." />
          ) : myMessagesQuery.isError ? (
            <EmptyState title="Unable to load your messages" description={getApiErrorMessage(myMessagesQuery.error, "Please refresh and try again.")} />
          ) : myMessages.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {myMessages.map((item) => (
                <article key={item.id} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/75 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-primary-strong)]">{item.subject}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{contactCategoryLabels[item.category]}</p>
                    </div>
                    <StatusBadge label={contactStatusLabels[item.status]} variant={statusVariant(item.status)} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-foreground)]">{item.message}</p>
                  {item.adminNote ? <div className="mt-4 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-sm text-[var(--color-muted-foreground)]"><span className="font-medium text-[var(--color-primary-strong)]">Admin note:</span> {item.adminNote}</div> : null}
                  <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">Sent on {new Date(item.createdAt).toLocaleDateString("en-GB")}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No contact requests yet" description="Your messages will appear here after you send one through the form above." />
          )}
        </SectionWrapper>
      </div>
    </main>
  );
}
