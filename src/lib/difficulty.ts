import type { DifficultyLevel } from '../../types'

const LEVELS: DifficultyLevel[] = ['기초', '보통', '심화']

export function calculateDifficulty(
  currentLevel: DifficultyLevel,
  recentResults: boolean[],
): DifficultyLevel {
  const lastTwo = recentResults.slice(-2)
  if (lastTwo.length < 2) return currentLevel

  const [first, second] = lastTwo
  const currentIndex = LEVELS.indexOf(currentLevel)

  if (first === false && second === false) {
    return LEVELS[Math.max(currentIndex - 1, 0)]
  }
  if (first === true && second === true) {
    return LEVELS[Math.min(currentIndex + 1, LEVELS.length - 1)]
  }
  return currentLevel
}
