const TOTAL_CELLS = 14

interface StreakHeaderProps {
  streak: number
}

export function StreakHeader({ streak }: StreakHeaderProps) {
  const filledCount = Math.min(streak, TOTAL_CELLS)
  const cells = Array.from({ length: TOTAL_CELLS }, (_, i) => i < filledCount)

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 p-4">
      <span className="text-sm font-medium text-slate-600">🔥 {streak}일 연속</span>
      <div className="flex gap-1">
        {cells.map((filled, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-sm ${filled ? 'bg-green-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  )
}
