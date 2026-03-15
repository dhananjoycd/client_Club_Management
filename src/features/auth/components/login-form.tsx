"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormField } from "@/components/forms/form-field";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { LoginPayload } from "@/types/auth.types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectTo = searchParams.get("redirect");
  const sessionQuery = useQuery({ queryKey: queryKeys.auth.session, queryFn: authService.getSession, retry: false });
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      toast.success(response.message ?? "Login successful.");
      const user = response.data?.user;
      const fallback = user?.role === "MEMBER" ? "/member" : "/admin";
      router.push(redirectTo || fallback);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Login failed. Please try again.")),
  });

  const currentUser = sessionQuery.data?.data?.user;

  return (
    <div className="grid gap-5">
      {currentUser ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          You are already signed in as {currentUser.email}.
        </div>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit((values) => loginMutation.mutate(values))} noValidate>
        <FormField label="Email address" type="email" placeholder="member@example.com" autoComplete="email" disabled={loginMutation.isPending} error={errors.email} {...register("email")} />
        <FormField label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" disabled={loginMutation.isPending} error={errors.password} {...register("password")} />
        <label className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]"><input type="checkbox" className="h-4 w-4" disabled={loginMutation.isPending} {...register("rememberMe")} /><span>Keep me signed in on this device</span></label>
        <FormActions isSubmitting={loginMutation.isPending} submitLabel="Sign in" helperText="This form is connected to the backend auth route and uses cookie-based session authentication." secondaryAction={<p className="text-sm text-[var(--color-muted-foreground)]">Membership applicant? <Link href="/apply" className="font-medium text-[var(--color-primary)]">Apply here</Link></p>} />
      </form>
    </div>
  );
}
