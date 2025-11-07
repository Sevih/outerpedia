'use client'

import React, { useRef } from 'react'

interface NotesEditorProps {
  notes: string
  onNotesChange: (notes: string) => void
  viewOnly?: boolean
}

export default function NotesEditor({
  notes,
  onNotesChange,
  viewOnly = false
}: NotesEditorProps) {
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Fonctions de formatage Markdown
  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = notesRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = notes.substring(start, end)
    const newText = notes.substring(0, start) + before + selectedText + after + notes.substring(end)

    onNotesChange(newText)

    // Restaurer la sélection après l'insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertLink = () => {
    const textarea = notesRef.current
    if (!textarea) return

    const url = prompt('Enter URL:')
    if (!url) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = notes.substring(start, end) || 'link text'
    const linkText = `[${selectedText}](${url})`
    const newText = notes.substring(0, start) + linkText + notes.substring(end)

    onNotesChange(newText)
    setTimeout(() => textarea.focus(), 0)
  }

  const insertList = (ordered: boolean) => {
    const textarea = notesRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const beforeText = notes.substring(0, start)
    const afterText = notes.substring(start)

    let prefix = '- '
    if (ordered) {
      const lines = beforeText.split('\n')
      const lastLine = lines[lines.length - 1]
      const match = lastLine.match(/^(\d+)\.\s/)
      const nextNumber = match ? parseInt(match[1]) + 1 : 1
      prefix = `${nextNumber}. `
    }

    // Si on est au début ou après un retour à la ligne, insérer directement
    if (start === 0 || notes[start - 1] === '\n') {
      onNotesChange(beforeText + prefix + afterText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
      }, 0)
    } else {
      // Sinon, ajouter un retour à la ligne avant
      onNotesChange(beforeText + '\n' + prefix + afterText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length)
      }, 0)
    }
  }

  if (viewOnly) {
    return null
  }

  return (
    <section className="mt-8 pt-6 border-t border-gray-700">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Notes</h3>

      {/* Formatting Toolbar */}
      <div className="flex gap-2 mb-3 p-2 bg-gray-900 border border-gray-700 rounded-lg flex-wrap">
        <button
          onClick={() => insertMarkdown('**')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('*')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm italic transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown('~~')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm line-through transition-colors"
          title="Strikethrough"
        >
          S
        </button>
        <div className="w-px bg-gray-600"></div>
        <button
          onClick={() => insertList(false)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => insertList(true)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px bg-gray-600"></div>
        <button
          onClick={insertLink}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title="Insert Link"
        >
          🔗 Link
        </button>
      </div>

      {/* Text Area */}
      <textarea
        ref={notesRef}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add your notes here... You can use this space to write team strategies, boss mechanics, rotation tips, etc."
        className="w-full min-h-[150px] max-h-[400px] p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-y"
      />

      <p className="mt-2 text-xs text-gray-500">
        Your notes will be saved in the share URL. You can use Markdown formatting (e.g., **bold**, *italic*, ~~strikethrough~~, [link](url)). Tip: Use two line breaks to exit a list.
      </p>
    </section>
  )
}
