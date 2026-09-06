interface MessageBubbleProps {
  role: 'question' | 'answer' | 'feedback'
  text: string
}

const ROLE_LABEL: Record<MessageBubbleProps['role'], string> = {
  question: '면접관',
  feedback: '코치',
  answer: '나',
}

const ROLE_STYLE: Record<MessageBubbleProps['role'], string> = {
  question: 'bg-white border border-slate-200 text-slate-800',
  feedback: 'bg-indigo-50 border border-indigo-100 text-indigo-900',
  answer: 'bg-indigo-600 text-white',
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === 'answer'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="mb-1 px-1 text-xs font-medium text-slate-400">{ROLE_LABEL[role]}</span>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 shadow-sm ${ROLE_STYLE[role]}`}
      >
        {text}
      </div>
    </div>
  )
}
