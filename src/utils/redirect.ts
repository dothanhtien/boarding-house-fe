export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/";
  if (
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes("\\")
  )
    return "/";
  return redirect;
}
