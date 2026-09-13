export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "/";
  return redirect;
}
