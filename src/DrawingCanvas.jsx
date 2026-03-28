import { useRef, useState, useEffect, useCallback } from 'react'

function EraserIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* main body — dark navy parallelogram */}
      <polygon points="1,7 5,1 14,5 10,11" fill="#1c2444" />
      {/* erasing tip strip */}
      <polygon points="7,9 10,11 7,14 4,12" fill="#3a4470" />
      {/* pixel crumbs trailing off */}
      <rect x="11" y="12" width="2" height="2" fill="#1c2444" />
      <rect x="13" y="13" width="2" height="1" fill="#1c2444" />
      <rect x="12" y="14" width="1" height="1" fill="#1c2444" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" style={{ display: 'block' }}>
      <line x1="2" y1="14" x2="13" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polygon points="13,3 8,5 11,8" fill="currentColor" />
    </svg>
  )
}

const TOOLS = [
  { id: 'pencil',  label: '✏',           title: 'Pencil' },
  { id: 'eraser',  label: <EraserIcon />, title: 'Eraser' },
  { id: 'line',    label: '╱',           title: 'Line' },
  { id: 'arrow',   label: <ArrowIcon />, title: 'Arrow' },
  { id: 'rect',    label: '□',           title: 'Rectangle' },
  { id: 'ellipse', label: '○',           title: 'Ellipse' },
  { id: 'text',    label: 'A',           title: 'Text' },
]

const PALETTE = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#FFFFFF','#C0C0C0','#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF',
  '#FF8040','#804000','#FFFF80','#80FF80','#80FFFF','#8080FF','#FF80FF','#FF0080',
]

function drawArrow(ctx, ox, oy, x, y, color) {
  const headLen = 14
  const angle = Math.atan2(y - oy, x - ox)

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(ox, oy)
  ctx.lineTo(x, y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

const SHAPE_TOOLS = ['line', 'arrow', 'rect', 'ellipse']

export default function DrawingCanvas({ message }) {
  const canvasRef = useRef(null)
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [secondaryColor] = useState('#FFFFFF')
  const drawing = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const snapshot = useRef(null)
  const baseSnapshot = useRef(null)
  const textInputRef = useRef(null)
  const [textPos, setTextPos] = useState(null)
  const [textValue, setTextValue] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    baseSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const drawShape = useCallback((ctx, x, y) => {
    const { x: ox, y: oy } = origin.current
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    if (tool === 'line') {
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'arrow') {
      drawArrow(ctx, ox, oy, x, y, color)
    } else if (tool === 'rect') {
      ctx.strokeRect(ox, oy, x - ox, y - oy)
    } else if (tool === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(
        (ox + x) / 2, (oy + y) / 2,
        Math.abs(x - ox) / 2, Math.abs(y - oy) / 2,
        0, 0, Math.PI * 2
      )
      ctx.stroke()
    }
  }, [tool, color])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    if (tool === 'text') {
      setTextPos(pos)
      setTextValue('')
      setTimeout(() => textInputRef.current?.focus(), 0)
      return
    }

    drawing.current = true
    origin.current = pos

    if (SHAPE_TOOLS.includes(tool)) {
      snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }, [tool])

  const onMouseMove = useCallback((e) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    if (tool === 'pencil') {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 16
      ctx.lineCap = 'square'
      ctx.lineJoin = 'miter'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (SHAPE_TOOLS.includes(tool)) {
      ctx.putImageData(snapshot.current, 0, 0)
      drawShape(ctx, pos.x, pos.y)
    }
  }, [tool, color, drawShape])

  const onMouseUp = useCallback((e) => {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    if (SHAPE_TOOLS.includes(tool)) {
      ctx.putImageData(snapshot.current, 0, 0)
      drawShape(ctx, pos.x, pos.y)
      snapshot.current = null
    }
  }, [tool, drawShape])

  const commitText = useCallback(() => {
    if (!textPos || !textValue.trim()) { setTextPos(null); return }
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = color
    ctx.font = '14px MS Sans Serif, Tahoma, sans-serif'
    ctx.fillText(textValue, textPos.x, textPos.y)
    setTextPos(null)
    setTextValue('')
  }, [textPos, textValue, color])

  return (
    <div className="drawing-canvas-wrap">
      <div className="draw-toolbar">
        <div className="draw-tools-grid">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              title={t.title}
              className={`draw-tool-btn${tool === t.id ? ' active' : ''}`}
              onClick={() => setTool(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          className="clear-btn"
          title="Clear markup"
          onClick={() => {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (baseSnapshot.current) {
              ctx.putImageData(baseSnapshot.current, 0, 0)
            }
          }}
        >
          Clear
        </button>
      </div>

      <div className="draw-right">
        <div className="canvas-area">
          <canvas
            ref={canvasRef}
            className="draw-canvas"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ cursor: tool === 'text' ? 'text' : tool === 'eraser' ? 'cell' : 'crosshair' }}
          />
          {textPos && (
            <input
              ref={textInputRef}
              className="canvas-text-input"
              style={{ left: textPos.x, top: textPos.y - 14 }}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitText() }}
              onBlur={commitText}
            />
          )}
          {message && <div className="viz-message">{message}</div>}
        </div>

        <div className="draw-palette">
          <div className="color-preview">
            <div className="color-swatch secondary" style={{ background: secondaryColor }} />
            <div className="color-swatch primary" style={{ background: color }} />
          </div>
          <div className="palette-colors">
            {PALETTE.map((c) => (
              <button
                key={c}
                className="palette-swatch"
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
