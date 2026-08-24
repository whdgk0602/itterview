export type DifficultyLevel = '기초' | '보통' | '심화'

export interface UserProfile {
  targetJob: string
  focusTopic: string
  difficultyLevel: DifficultyLevel
}

export interface HistoryEntry {
  date: string // YYYY-MM-DD
  question: string
  isCorrect: boolean
  feedback: string
}

export interface AppState {
  userProfile: UserProfile
  streak: number
  lastCheckIn: string // YYYY-MM-DD
  history: HistoryEntry[]
}

export interface GenerateQuestionRequest {
  targetJob: string
  focusTopic: string
  difficultyLevel: DifficultyLevel
}

export interface GenerateQuestionResponse {
  question: string
}

export interface SubmitAnswerRequest {
  question: string
  answer: string
}

export interface AIGradeResponse {
  isCorrect: boolean
  feedback: string
  followUpQuestion: string | null
  encouragement: string | null
}
