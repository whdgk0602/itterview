import { useState, type FormEvent } from 'react'
import { MessageBubble } from './MessageBubble'

export interface ChatMessageItem {
  role: 'question' | 'answer' | 'feedback'
  text: string
  isCorrect?: boolean
}

interface ChatWindowProps {
  messages: ChatMessageItem[]
  onSendAnswer: (answer: string) => void
  disabled: boolean
}

export function ChatWindow({ messages, onSendAnswer, disabled }: ChatWindowProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onSendAnswer(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} isCorrect={m.isCorrect} />
          ))}
        </div>
      </div>
      <div className="px-4 pb-8 pt-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-md"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="답변을 입력하세요"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}
