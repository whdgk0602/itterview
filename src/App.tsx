// src/App.tsx
import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDailyQuestion } from './hooks/useDailyQuestion'
import { useSubmitAnswer } from './hooks/useSubmitAnswer'
import { OnboardingForm } from './components/OnboardingForm'
import { StreakHeader } from './components/StreakHeader'
import { ChatWindow, type ChatMessageItem } from './components/ChatWindow'
import { BackupControls } from './components/BackupControls'

function App() {
  const { state, isCorrupted, resetCorrupted, completeOnboarding, recordAnswer, importBackup } =
    useLocalStorage()
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <p className="text-slate-700">저장된 데이터를 읽을 수 없어요. 초기화하고 다시 시작할까요?</p>
          <button
            onClick={resetCorrupted}
            className="w-full rounded-md bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700"
          >
            초기화하고 다시 시작하기
          </button>
          <BackupControls variant="inline" onImport={importBackup} />
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4">
        <OnboardingForm
          onSubmit={(targetJob, focusTopic) =>
            completeOnboarding({ targetJob, focusTopic, difficultyLevel: '보통' })
          }
        />
        <BackupControls variant="inline" onImport={importBackup} />
      </div>
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
    setMessages((prev) => [
      ...prev,
      { role: 'feedback', text: feedbackText, isCorrect: result.isCorrect },
    ])
    recordAnswer(question, result.isCorrect, result.feedback)
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white pr-3">
        <StreakHeader
          streak={state.streak}
          history={state.history}
          difficultyLevel={state.userProfile.difficultyLevel}
        />
        <BackupControls state={state} onImport={importBackup} />
      </div>
      <div className="flex-1 overflow-hidden">
        {alreadyAnsweredToday && messages.length === 0 ? (
          <div className="m-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            오늘의 미션을 이미 완료했어요. 내일 다시 만나요!
          </div>
        ) : questionLoading ? (
          <div className="m-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-500">
            질문을 불러오는 중...
          </div>
        ) : questionError ? (
          <div className="m-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{questionError}</p>
            <button
              onClick={fetchQuestion}
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            onSendAnswer={handleSendAnswer}
            disabled={gradingLoading || alreadyAnsweredToday}
          />
        )}
      </div>
      {gradingError && (
        <div className="m-4 mt-0 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-700">
          {gradingError}
        </div>
      )}
    </div>
  )
}

export default App
