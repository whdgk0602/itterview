import type { DifficultyLevel, HistoryEntry } from '../../types'
import { offsetDateString, todayString } from '../lib/date'

const WEEKS = 4
const DAYS_PER_WEEK = 7
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK

const DIFFICULTY_STYLE: Record<DifficultyLevel, string> = {
  기초: 'bg-slate-100 text-slate-600',
  보통: 'bg-indigo-100 text-indigo-700',
  심화: 'bg-rose-100 text-rose-700',
}

interface StreakHeaderProps {
  streak: number
  history: HistoryEntry[]
  difficultyLevel: DifficultyLevel
}

export function StreakHeader({ streak, history, difficultyLevel }: StreakHeaderProps) {
  const today = todayString()
  const historyByDate = new Map(history.map((entry) => [entry.date, entry]))

  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const date = offsetDateString(today, i - (TOTAL_DAYS - 1))
    return { date, entry: historyByDate.get(date) }
  })

  const [startYear, startMonth, startDay] = days[0].date.split('-').map(Number)
  const startDow = new Date(startYear, startMonth - 1, startDay).getDay()
  const cells: ({ date: string; entry?: HistoryEntry } | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...days,
  ]

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-indigo-600">🔥 {streak}일 연속</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[difficultyLevel]}`}
      >
        {difficultyLevel}
      </span>
      <div
        className="grid grid-flow-col gap-1"
        style={{ gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, i) =>
          cell ? (
            <span
              key={cell.date}
              title={cell.entry ? `${cell.date} · ${cell.entry.isCorrect ? '정답' : '오답'}` : cell.date}
              className={`h-3 w-3 rounded-sm ${
                !cell.entry
                  ? 'bg-slate-200'
                  : cell.entry.isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
              }`}
            />
          ) : (
            <span key={`pad-${i}`} className="h-3 w-3" />
          ),
        )}
      </div>
    </div>
  )
}
