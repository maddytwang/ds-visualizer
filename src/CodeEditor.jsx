import { useRef, useCallback, useEffect } from 'react'

const LINE_H = 18   // 12px font * 1.5 line-height
const PAD_TOP = 6   // textarea padding-top

export default function CodeEditor({ value, onChange, onBlur, onPaste, placeholder, highlightLine }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)
  const overlayRef = useRef(null)

  const lineCount = value ? value.split('\n').length : 1

  const syncScroll = useCallback(() => {
    const top = textareaRef.current?.scrollTop ?? 0
    if (gutterRef.current) gutterRef.current.scrollTop = top
    if (overlayRef.current) overlayRef.current.scrollTop = top
  }, [])

  // Auto-scroll to highlighted line
  useEffect(() => {
    if (!highlightLine || !textareaRef.current) return
    const el = textareaRef.current
    const lineTop = PAD_TOP + (highlightLine - 1) * LINE_H
    const lineBot = lineTop + LINE_H
    if (lineTop < el.scrollTop || lineBot > el.scrollTop + el.clientHeight) {
      el.scrollTop = lineTop - el.clientHeight / 2 + LINE_H / 2
      syncScroll()
    }
  }, [highlightLine, syncScroll])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const el = textareaRef.current
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = e.target.value.slice(0, start) + '    ' + e.target.value.slice(end)
      e.target.value = next
      el.selectionStart = el.selectionEnd = start + 4
      e.target.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }, [])

  return (
    <div className="code-editor">
      <div className="code-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={`line-number${i + 1 === highlightLine ? ' active' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="code-textarea-wrap">
        {highlightLine != null && (
          <div className="code-highlight-overlay" ref={overlayRef} aria-hidden>
            <div style={{ paddingTop: PAD_TOP }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className={`code-highlight-row${i + 1 === highlightLine ? ' active' : ''}`}
                  style={{ height: LINE_H }}
                />
              ))}
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={`text-input code-input${highlightLine != null ? ' has-highlight' : ''}`}
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
    </div>
  )
}
