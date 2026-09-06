import { useState, type FormEvent } from 'react'

const TARGET_JOBS = ['프론트엔드 개발자', '백엔드 개발자', 'iOS 개발자', 'Android 개발자']
const FOCUS_TOPICS = ['운영체제(OS)', '네트워크', '자료구조', '데이터베이스', '알고리즘']

interface OnboardingFormProps {
  onSubmit: (targetJob: string, focusTopic: string) => void
}

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [targetJob, setTargetJob] = useState(TARGET_JOBS[0])
  const [focusTopic, setFocusTopic] = useState(FOCUS_TOPICS[0])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(targetJob, focusTopic)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5 rounded-xl bg-white p-8 shadow-lg"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">시작하기 전에</h1>
        <p className="text-sm text-slate-500">매일의 기술 면접 코칭을 위해 몇 가지만 알려주세요.</p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-600">목표 직무</span>
        <select
          value={targetJob}
          onChange={(e) => setTargetJob(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {TARGET_JOBS.map((job) => (
            <option key={job} value={job}>
              {job}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-600">이번 주 집중 카테고리</span>
        <select
          value={focusTopic}
          onChange={(e) => setFocusTopic(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {FOCUS_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700"
      >
        시작하기
      </button>
    </form>
  )
}
