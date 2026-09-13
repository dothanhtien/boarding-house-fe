export const MARKER_COOKIE = "has_session";

export function setSessionMarker() {
  document.cookie = `${MARKER_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearSessionMarker() {
  document.cookie = `${MARKER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
