// import { useState } from 'react'
// import useSubjectChat from '../services/aiService/hooks/useSubjectChat'

// export default function SubjectChat({ subject }) {
//   const [input, setInput] = useState('')
//   const [messages, setMessages] = useState([])
//   const mutation = useSubjectChat()

//   const send = async () => {
//     if (!input.trim()) return
//     const userMsg = input.trim()
//     setMessages((m) => [...m, { role: 'user', text: userMsg }])
//     setInput('')
//     try {
//       const res = await mutation.mutateAsync({ subjectName: subject, prompt: userMsg })
//       const reply = res?.reply || res?.data?.reply || ''
//       setMessages((m) => [...m, { role: 'assistant', text: reply }])
//     } catch (err) {
//       setMessages((m) => [...m, { role: 'assistant', text: 'Error: Unable to get reply' }])
//     }
//   }

//   return (
//     <div className="mt-6 bg-slate-900/40 border border-slate-800 p-4 rounded-lg">
//       <h4 className="text-sm text-slate-300 mb-2">AI Subject Chat — {subject}</h4>
//       <div className="max-h-48 overflow-auto space-y-2 mb-3">
//         {messages.map((m, i) => (
//           <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-indigo-700/30 text-white ml-auto max-w-[80%]' : 'bg-slate-800 text-slate-200 max-w-[80%]'}`}>
//             {m.text}
//           </div>
//         ))}
//       </div>
//       <div className="flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => { if (e.key === 'Enter') send() }}
//           placeholder={`Ask about ${subject}...`}
//           className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none"
//         />
//         <button onClick={send} disabled={mutation.isLoading} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">
//           {mutation.isLoading ? '...' : 'Send'}
//         </button>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect, useRef } from 'react'
import useSubjectChat from '../services/aiService/hooks/useSubjectChat'

export default function SubjectChat({ subject, messages: externalMessages, setMessages: externalSetMessages }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(externalMessages || [])
  const mutation = useSubjectChat()
  const messagesEndRef = useRef(null)

  // Sync with external messages if provided
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages)
    }
  }, [externalMessages])

  // Update external state when messages change
  useEffect(() => {
    if (externalSetMessages) {
      externalSetMessages(messages)
    }
  }, [messages, externalSetMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || mutation.isLoading) return
    
    const userMsg = input.trim()
    console.log('📤 Sending message:', { subject, userMsg })
    
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setInput('')
    
    try {
      const res = await mutation.mutateAsync({ 
        subjectName: subject, 
        prompt: userMsg 
      })
      
      console.log('📥 Received response:', res)
      
      // Handle different response formats
      const reply = res?.reply || res?.data?.reply || 'No response received'
      
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (err) {
      console.error('❌ Subject chat error:', err)
      const errorMsg = err?.response?.data?.message || err.message || 'Unable to get reply'
      setMessages((m) => [...m, { 
        role: 'assistant', 
        text: `⚠️ Error: ${errorMsg}` 
      }])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="mt-6 bg-slate-900/40 border border-slate-800 rounded-lg flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h4 className="text-sm text-slate-300">
          🤖 AI Subject Chat — <span className="text-indigo-400 font-medium">{subject}</span>
        </h4>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            👋 Ask me anything about {subject}!
          </div>
        )}
        
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-indigo-600/30 text-white ml-auto max-w-[80%] border border-indigo-500/30' 
                : 'bg-slate-800/70 text-slate-200 max-w-[85%] border border-slate-700/50'
            }`}
          >
            {m.text}
          </div>
        ))}
        
        {mutation.isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/70 rounded-lg max-w-[85%] border border-slate-700/50">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-slate-400">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${subject}...`}
            disabled={mutation.isLoading}
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button 
            onClick={send} 
            disabled={mutation.isLoading || !input.trim()} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isLoading ? '⏳' : '📤'}
          </button>
        </div>

        {mutation.isError && (
          <div className="mt-2 text-xs text-red-400">
            Failed to send message. Please try again.
          </div>
        )}
      </div>
    </div>
  )
}