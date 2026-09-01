interface MessageBubbleProps {
  role: 'question' | 'answer' | 'feedback'
  text: string
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === 'answer'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 ${
          isUser ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        {text}
      </div>
    </div>
  )
}
