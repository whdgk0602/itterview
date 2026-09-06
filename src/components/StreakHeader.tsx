import type { HistoryEntry } from '../../types'
import { offsetDateString, todayString } from '../lib/date'

const TOTAL_CELLS = 14

interface StreakHeaderProps {
  streak: number
  history: HistoryEntry[]
}

export function StreakHeader({ streak, history }: StreakHeaderProps) {
  const today = todayString()
  const historyByDate = new Map(history.map((entry) => [entry.date, entry]))

  const cells = Array.from({ length: TOTAL_CELLS }, (_, i) => {
    const date = offsetDateString(today, i - (TOTAL_CELLS - 1))
    const entry = historyByDate.get(date)
    return { date, entry }
  })

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-indigo-600">🔥 {streak}일 연속</span>
      <div className="flex gap-1">
        {cells.map(({ date, entry }) => (
          <span
            key={date}
            title={entry ? `${date} · ${entry.isCorrect ? '정답' : '오답'}` : date}
            className={`h-3 w-3 rounded-sm ${
              !entry
                ? 'bg-slate-200'
                : entry.isCorrect
                  ? 'bg-emerald-500'
                  : 'bg-amber-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
