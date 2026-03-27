export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`
  return `${(ms / 3_600_000).toFixed(1)}h`
}

export function formatRelativeDate(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(diff / 3_600_000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(diff / 86_400_000)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
