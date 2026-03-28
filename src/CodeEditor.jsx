import { useRef, useCallback } from 'react'

export default function CodeEditor({ value, onChange, onBlur, onPaste, placeholder }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)

  const lineCount = value ? value.split('\n').length : 1

  const syncScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const el = textareaRef.current
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = e.target.value.slice(0, start) + '    ' + e.target.value.slice(end)
      e.target.value = next
      el.selectionStart = el.selectionEnd = start + 4
      // sync React state
      e.target.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }, [])

  return (
    <div className="code-editor">
      <div className="code-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="line-number">{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="text-input code-input"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onPaste={onPaste}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  )
}
