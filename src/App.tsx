// src/App.tsx
import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDailyQuestion } from './hooks/useDailyQuestion'
import { useSubmitAnswer } from './hooks/useSubmitAnswer'
import { OnboardingForm } from './components/OnboardingForm'
import { StreakHeader } from './components/StreakHeader'
import { ChatWindow, type ChatMessageItem } from './components/ChatWindow'

function App() {
  const { state, isCorrupted, resetCorrupted, completeOnboarding, recordAnswer } = useLocalStorage()
  const {
    question,
    loading: questionLoading,
    error: questionError,
    fetchQuestion,
    alreadyAnsweredToday,
  } = useDailyQuestion(state)
  const { loading: gradingLoading, error: gradingError, submitAnswer } = useSubmitAnswer()
  const [messages, setMessages] = useState<ChatMessageItem[]>([])

  useEffect(() => {
    if (state && !alreadyAnsweredToday && !question) {
      fetchQuestion()
    }
  }, [state, alreadyAnsweredToday, question, fetchQuestion])

  useEffect(() => {
    if (question) {
      setMessages([{ role: 'question', text: question }])
    }
  }, [question])

  if (isCorrupted) {
    return (
      <div className="mx-auto mt-20 max-w-sm space-y-4 rounded-lg bg-white p-6 text-center shadow">
        <p className="text-slate-700">저장된 데이터를 읽을 수 없어요. 초기화하고 다시 시작할까요?</p>
        <button
          onClick={resetCorrupted}
          className="w-full rounded bg-slate-800 py-2 font-medium text-white"
        >
          초기화하고 다시 시작하기
        </button>
      </div>
    )
  }

  if (!state) {
    return (
      <OnboardingForm
        onSubmit={(targetJob, focusTopic) =>
          completeOnboarding({ targetJob, focusTopic, difficultyLevel: '보통' })
        }
      />
    )
  }

  async function handleSendAnswer(answer: string) {
    if (!question) return
    setMessages((prev) => [...prev, { role: 'answer', text: answer }])
    const result = await submitAnswer(question, answer)
    if (!result) return
    const feedbackText = [result.feedback, result.followUpQuestion, result.encouragement]
      .filter((v): v is string => Boolean(v))
      .join('\n\n')
    setMessages((prev) => [...prev, { role: 'feedback', text: feedbackText }])
    recordAnswer(question, result.isCorrect, result.feedback)
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <StreakHeader streak={state.streak} />
      <div className="flex-1 overflow-hidden">
        {alreadyAnsweredToday && messages.length === 0 ? (
          <p className="p-4 text-slate-500">오늘의 미션을 이미 완료했어요. 내일 다시 만나요!</p>
        ) : questionLoading ? (
          <p className="p-4 text-slate-500">질문을 불러오는 중...</p>
        ) : questionError ? (
          <div className="space-y-2 p-4">
            <p className="text-red-500">{questionError}</p>
            <button onClick={fetchQuestion} className="rounded bg-slate-800 px-4 py-2 text-white">
              다시 시도
            </button>
          </div>
        ) : (
          <ChatWindow messages={messages} onSendAnswer={handleSendAnswer} disabled={gradingLoading} />
        )}
      </div>
      {gradingError && <p className="p-2 text-center text-red-500">{gradingError}</p>}
    </div>
  )
}

export default App
