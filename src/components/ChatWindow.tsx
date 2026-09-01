import { useState, type FormEvent } from 'react'
import { MessageBubble } from './MessageBubble'

export interface ChatMessageItem {
  role: 'question' | 'answer' | 'feedback'
  text: string
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
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="답변을 입력하세요"
          className="flex-1 rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded bg-slate-800 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  )
}
