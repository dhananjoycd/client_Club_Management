"use client";

import axios from "axios";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "@/lib/axios";

type GlobalErrorProviderProps = Readonly<{
  children: ReactNode;
}>;

const AUTH_PAGE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

let hasPendingSessionRedirect = false;

const isAuthPage = (pathname: string) =>
  AUTH_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const isAuthRequest = (url?: string) => typeof url === "string" && url.includes("/auth/");

const getPageContext = (pathname: string) => {
  if (pathname.startsWith("/admin")) {
    return {
      area: "admin workspace",
      sessionMessage: "Your admin session expired. Sign in again to continue managing club operations.",
      networkMessage: "The admin workspace could not reach the server. Check your connection and try again.",
    };
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/member")) {
    return {
      area: "member workspace",
      sessionMessage: "Your account session expired. Sign in again to continue with your profile, registrations, and club activity.",
      networkMessage: "Your account area could not reach the server. Check your connection and try again.",
    };
  }

  return {
    area: "club portal",
    sessionMessage: "Your session expired. Sign in again to continue to your dashboard and club tools.",
    networkMessage: "The club portal could not reach the server. Check your connection and try again.",
  };
};

const getLoginRedirectUrl = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (!currentPath || currentPath === "/login") {
    return "/login";
  }

  return `/login?redirect=${encodeURIComponent(currentPath)}`;
};

export function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (typeof window !== "undefined") {
          const status = error?.response?.status as number | undefined;
          const pathname = window.location.pathname;
          const context = getPageContext(pathname);

          if (!error?.response) {
            toast.error(context.networkMessage, {
              id: "global-network-error",
            });
          } else if (
            status === 401 &&
            !hasPendingSessionRedirect &&
            !isAuthPage(pathname) &&
            !isAuthRequest(error?.config?.url)
          ) {
            hasPendingSessionRedirect = true;
            toast.error(context.sessionMessage, {
              id: "global-session-error",
            });
            window.location.assign(getLoginRedirectUrl());
          }
        }

        return Promise.reject(error);
      },
    );

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const pathname = window.location.pathname;
      const context = getPageContext(pathname);

      if (axios.isAxiosError(reason)) {
        if (reason.code === "ERR_CANCELED" || reason.response) {
          return;
        }

        toast.error(`A request in the ${context.area} was interrupted before it could finish. Please try again.`, {
          id: "global-request-error",
        });
        return;
      }

      toast.error(`An unexpected client error interrupted the ${context.area}. Refresh the page and try again.`, {
        id: "global-unhandled-error",
      });
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (!event.error) {
        return;
      }

      const context = getPageContext(window.location.pathname);
      toast.error(`A screen error interrupted the ${context.area}. Refresh and try again.`, {
        id: "global-screen-error",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      api.interceptors.response.eject(responseInterceptor);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  return children;
}
