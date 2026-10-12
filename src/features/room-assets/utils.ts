export function formatSavingLabel(verb: string, progress: number | null) {
  if (progress === null || progress >= 100) return `${verb}...`;
  return `Uploading ${progress}%...`;
}
