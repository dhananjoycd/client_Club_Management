export function getDashboardRouteForRole(role?: string | null) {
  if (role === "USER" || role === "MEMBER") {
    return "/account";
  }

  if (role === "EVENT_MANAGER") {
    return "/admin/events";
  }

  if (role) {
    return "/admin";
  }

  return null;
}
