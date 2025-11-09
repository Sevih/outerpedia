'use client'

import React, { useRef } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'

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
  const { t } = useI18n()
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const [showSizeMenu, setShowSizeMenu] = React.useState(false)
  const [showColorMenu, setShowColorMenu] = React.useState(false)

  // Fermer les menus quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowSizeMenu(false)
      setShowColorMenu(false)
    }
    if (showSizeMenu || showColorMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSizeMenu, showColorMenu])

  // Presets pour les tailles
  const sizePresets = [
    { label: t('teamPlanner.notes.sizes.verySmall'), value: 12 },
    { label: t('teamPlanner.notes.sizes.small'), value: 14 },
    { label: t('teamPlanner.notes.sizes.normal'), value: 18 },
    { label: t('teamPlanner.notes.sizes.large'), value: 24 },
    { label: t('teamPlanner.notes.sizes.veryLarge'), value: 32 }
  ]

  // Presets pour les couleurs
  const colorPresets = [
    { label: t('teamPlanner.notes.colors.white'), value: '#ffffff' },
    { label: t('teamPlanner.notes.colors.lightGray'), value: '#d1d5db' },
    { label: t('teamPlanner.notes.colors.cyan'), value: '#22d3ee' },
    { label: t('teamPlanner.notes.colors.blue'), value: '#3b82f6' },
    { label: t('teamPlanner.notes.colors.green'), value: '#10b981' },
    { label: t('teamPlanner.notes.colors.yellow'), value: '#fbbf24' },
    { label: t('teamPlanner.notes.colors.orange'), value: '#f97316' },
    { label: t('teamPlanner.notes.colors.red'), value: '#ef4444' },
    { label: t('teamPlanner.notes.colors.pink'), value: '#ec4899' },
    { label: t('teamPlanner.notes.colors.purple'), value: '#a855f7' }
  ]

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

    const url = prompt(t('teamPlanner.notes.linkPrompt'))
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

  const insertSize = (size: number) => {
    const textarea = notesRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = notes.substring(start, end) || 'text'
    const sizeTag = `<size=${size}>${selectedText}</size>`
    const newText = notes.substring(0, start) + sizeTag + notes.substring(end)

    onNotesChange(newText)
    setShowSizeMenu(false)
    setTimeout(() => textarea.focus(), 0)
  }

  const insertColor = (color: string) => {
    const textarea = notesRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = notes.substring(start, end) || 'text'
    const colorTag = `<color=${color}>${selectedText}</color>`
    const newText = notes.substring(0, start) + colorTag + notes.substring(end)

    onNotesChange(newText)
    setShowColorMenu(false)
    setTimeout(() => textarea.focus(), 0)
  }

  if (viewOnly) {
    return null
  }

  return (
    <section className="mt-8 pt-6 border-t border-gray-700">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">{t('teamPlanner.notes.title')}</h3>

      {/* Formatting Toolbar */}
      <div className="flex gap-2 mb-3 p-2 bg-gray-900 border border-gray-700 rounded-lg flex-wrap">
        <button
          onClick={() => insertMarkdown('**')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold transition-colors"
          title={t('teamPlanner.notes.toolbar.bold')}
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('*')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm italic transition-colors"
          title={t('teamPlanner.notes.toolbar.italic')}
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown('~~')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm line-through transition-colors"
          title={t('teamPlanner.notes.toolbar.strikethrough')}
        >
          S
        </button>
        <div className="w-px bg-gray-600"></div>

        {/* Size Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSizeMenu(!showSizeMenu)
              setShowColorMenu(false)
            }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-1"
            title={t('teamPlanner.notes.toolbar.size')}
          >
            📏 {t('teamPlanner.notes.toolbar.size')}
          </button>
          {showSizeMenu && (
            <div className="absolute top-full mt-1 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
              {sizePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => insertSize(preset.value)}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  style={{ fontSize: `${Math.min(preset.value, 16)}px` }}
                >
                  {preset.label} ({preset.value}px)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowColorMenu(!showColorMenu)
              setShowSizeMenu(false)
            }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-1"
            title={t('teamPlanner.notes.toolbar.color')}
          >
            🎨 {t('teamPlanner.notes.toolbar.color')}
          </button>
          {showColorMenu && (
            <div className="absolute top-full mt-1 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
              {colorPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => insertColor(preset.value)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                >
                  <span
                    className="w-4 h-4 rounded border border-gray-600"
                    style={{ backgroundColor: preset.value }}
                  ></span>
                  <span style={{ color: preset.value }}>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px bg-gray-600"></div>
        <button
          onClick={() => insertList(false)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title={t('teamPlanner.notes.toolbar.bulletList')}
        >
          • List
        </button>
        <button
          onClick={() => insertList(true)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title={t('teamPlanner.notes.toolbar.numberedList')}
        >
          1. List
        </button>
        <div className="w-px bg-gray-600"></div>
        <button
          onClick={insertLink}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title={t('teamPlanner.notes.toolbar.link')}
        >
          🔗 {t('teamPlanner.notes.toolbar.link')}
        </button>
      </div>

      {/* Text Area */}
      <textarea
        ref={notesRef}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder={t('teamPlanner.notes.placeholder')}
        className="w-full min-h-[150px] max-h-[400px] p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-y"
      />

      <p className="mt-2 text-xs text-gray-500">
        {t('teamPlanner.notes.help')}
      </p>
    </section>
  )
}
