interface MessageBubbleProps {
  role: 'question' | 'answer' | 'feedback'
  text: string
  isCorrect?: boolean
}

const ROLE_LABEL: Record<MessageBubbleProps['role'], string> = {
  question: '면접관',
  feedback: '코치',
  answer: '나',
}

function getBubbleStyle(role: MessageBubbleProps['role'], isCorrect?: boolean): string {
  if (role === 'answer') return 'bg-indigo-600 text-white'
  if (role === 'question') return 'bg-white border border-slate-200 text-slate-800'
  return isCorrect
    ? 'bg-emerald-50 border border-emerald-100 text-emerald-900'
    : 'bg-amber-50 border border-amber-100 text-amber-900'
}

export function MessageBubble({ role, text, isCorrect }: MessageBubbleProps) {
  const isUser = role === 'answer'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="mb-1 px-1 text-xs font-medium text-slate-400">{ROLE_LABEL[role]}</span>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 shadow-sm ${getBubbleStyle(role, isCorrect)}`}
      >
        {text}
      </div>
    </div>
  )
}
