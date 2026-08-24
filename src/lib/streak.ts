function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00Z`).getTime()
  const to = new Date(`${toDate}T00:00:00Z`).getTime()
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}

export function calculateStreak(
  currentStreak: number,
  lastCheckIn: string,
  today: string,
): number {
  const diff = daysBetween(lastCheckIn, today)

  if (diff <= 0) return currentStreak
  if (diff === 1) return currentStreak + 1
  if (diff === 2) return currentStreak + 1
  return 1
}
