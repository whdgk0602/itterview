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

  // 이번 주 토요일에서 끝나는 4주(일~토) 블록으로 채워 그리드가 항상 꽉 찬 직사각형이 되게 한다
  const todayDow = new Date().getDay()
  const startOffset = -(todayDow + (WEEKS - 1) * DAYS_PER_WEEK)
  const cells = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const offset = startOffset + i
    const date = offsetDateString(today, offset)
    return { date, entry: historyByDate.get(date), isFuture: offset > 0 }
  })

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-indigo-600">🔥 {streak}일 연속</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[difficultyLevel]}`}
      >
        {difficultyLevel}
      </span>
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <span
            key={cell.date}
            title={cell.entry ? `${cell.date} · ${cell.entry.isCorrect ? '정답' : '오답'}` : cell.date}
            className={`h-2.5 w-2.5 rounded-sm ${
              cell.isFuture
                ? 'border border-slate-200'
                : !cell.entry
                  ? 'bg-slate-200'
                  : cell.entry.isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
