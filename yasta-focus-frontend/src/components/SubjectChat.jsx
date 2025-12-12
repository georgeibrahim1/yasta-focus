import { useState } from 'react'
import useSubjectChat from '../services/aiService/hooks/useSubjectChat'

export default function SubjectChat({ subject }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const mutation = useSubjectChat()

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setInput('')
    try {
      const res = await mutation.mutateAsync({ subjectName: subject, prompt: userMsg })
      const reply = res?.reply || res?.data?.reply || ''
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error: Unable to get reply' }])
    }
  }

  return (
    <div className="mt-6 bg-slate-900/40 border border-slate-800 p-4 rounded-lg">
      <h4 className="text-sm text-slate-300 mb-2">AI Subject Chat — {subject}</h4>
      <div className="max-h-48 overflow-auto space-y-2 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-indigo-700/30 text-white ml-auto max-w-[80%]' : 'bg-slate-800 text-slate-200 max-w-[80%]'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          placeholder={`Ask about ${subject}...`}
          className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none"
        />
        <button onClick={send} disabled={mutation.isLoading} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">
          {mutation.isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
