import { X, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'

export default function NoteEditor({ isOpen, onClose, onSubmit, note, isLoading }) {
  const [content, setContent] = useState('')

  useEffect(() => {
    if (note) {
      setContent(note.note_text || '')
    }
  }, [note])

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(content)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{note?.note_title}</h2>
            <p className="text-sm text-slate-400 mt-1">Edit your note content</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center gap-2"
            >
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-6" data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={setContent}
            height="100%"
            preview="edit"
            hideToolbar={false}
            enableScroll={true}
            visibleDragbar={false}
            highlightEnable={false}
            textareaProps={{
              placeholder: 'Write your note content here...'
            }}
            previewOptions={{
              className: 'markdown-body'
            }}
          />
        </div>
      </div>
    </div>
  )
}
