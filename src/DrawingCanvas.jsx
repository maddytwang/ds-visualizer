import { useRef, useState, useEffect, useCallback } from 'react'

function EraserIcon() {
  return (
    <svg viewBox="0 0 16 10" width="16" height="10" style={{ display: 'block' }}>
      <rect x="0.5" y="0.5" width="15" height="9" rx="1" fill="none" stroke="#000" strokeWidth="1" />
      <rect x="0.5" y="0.5" width="11.25" height="9" rx="1" fill="#000" />
      <line x1="11.75" y1="0.5" x2="11.75" y2="9.5" stroke="#000" strokeWidth="1" />
    </svg>
  )
}

function CursorIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" style={{ display: 'block' }}>
      <polygon points="2,1 2,13 5,10 7,15 9,14 7,9 11,9" fill="#000" stroke="#fff" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}

const TOOLS = [
  { id: 'select',  label: <CursorIcon />, title: 'Select' },
  { id: 'pencil',  label: '✏',           title: 'Pencil' },
  { id: 'eraser',  label: <EraserIcon />, title: 'Eraser' },
  { id: 'line',    label: '─',           title: 'Line' },
  { id: 'arrow',   label: <span style={{ position: 'relative', top: '-2px' }}>→</span>, title: 'Arrow' },
  { id: 'rect',    label: '□',           title: 'Rectangle' },
  { id: 'ellipse', label: '○',           title: 'Ellipse' },
  { id: 'text',    label: 'A',           title: 'Text' },
]

const PALETTE = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#FFFFFF','#C0C0C0','#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF',
  '#FF8040','#804000','#FFFF80','#80FF80','#80FFFF','#8080FF','#FF80FF','#FF0080',
]

function renderShape(ctx, shape, overlay = false) {
  ctx.save()
  if (shape.type === 'pencil') {
    if (shape.points.length < 2) { ctx.restore(); return }
    ctx.strokeStyle = shape.color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(shape.points[0].x, shape.points[0].y)
    for (let i = 1; i < shape.points.length; i++) ctx.lineTo(shape.points[i].x, shape.points[i].y)
    ctx.stroke()
  } else if (shape.type === 'eraser') {
    if (shape.points.length < 2) { ctx.restore(); return }
    if (overlay) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.strokeStyle = '#ffffff'
    }
    ctx.lineWidth = 16
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'
    ctx.beginPath()
    ctx.moveTo(shape.points[0].x, shape.points[0].y)
    for (let i = 1; i < shape.points.length; i++) ctx.lineTo(shape.points[i].x, shape.points[i].y)
    ctx.stroke()
  } else if (shape.type === 'line') {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(shape.x1, shape.y1)
    ctx.lineTo(shape.x2, shape.y2)
    ctx.stroke()
  } else if (shape.type === 'arrow') {
    const { x1, y1, x2, y2, color } = shape
    const headLen = 14
    const angle = Math.atan2(y2 - y1, x2 - x1)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  } else if (shape.type === 'rect') {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = 2
    ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
  } else if (shape.type === 'ellipse') {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(shape.cx, shape.cy, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2)
    ctx.stroke()
  } else if (shape.type === 'text') {
    ctx.fillStyle = shape.color
    ctx.font = '14px MS Sans Serif, Tahoma, sans-serif'
    ctx.fillText(shape.text, shape.x, shape.y)
  }
  ctx.restore()
}

function getShapeBounds(shape) {
  if (shape.type === 'pencil' || shape.type === 'eraser') {
    const xs = shape.points.map(p => p.x)
    const ys = shape.points.map(p => p.y)
    const pad = shape.type === 'eraser' ? 8 : 2
    return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + pad * 2 }
  } else if (shape.type === 'line' || shape.type === 'arrow') {
    return { x: Math.min(shape.x1, shape.x2) - 4, y: Math.min(shape.y1, shape.y2) - 4, w: Math.abs(shape.x2 - shape.x1) + 8, h: Math.abs(shape.y2 - shape.y1) + 8 }
  } else if (shape.type === 'rect') {
    return { x: Math.min(shape.x, shape.x + shape.w), y: Math.min(shape.y, shape.y + shape.h), w: Math.abs(shape.w), h: Math.abs(shape.h) }
  } else if (shape.type === 'ellipse') {
    return { x: shape.cx - Math.abs(shape.rx), y: shape.cy - Math.abs(shape.ry), w: Math.abs(shape.rx) * 2, h: Math.abs(shape.ry) * 2 }
  } else if (shape.type === 'text') {
    return { x: shape.x - 2, y: shape.y - 16, w: 120, h: 20 }
  }
  return { x: 0, y: 0, w: 0, h: 0 }
}

function hitTest(shape, px, py) {
  const b = getShapeBounds(shape)
  return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
}

function moveShape(shape, dx, dy) {
  if (shape.type === 'pencil' || shape.type === 'eraser') {
    shape.points = shape.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
  } else if (shape.type === 'line' || shape.type === 'arrow') {
    shape.x1 += dx; shape.y1 += dy; shape.x2 += dx; shape.y2 += dy
  } else if (shape.type === 'rect') {
    shape.x += dx; shape.y += dy
  } else if (shape.type === 'ellipse') {
    shape.cx += dx; shape.cy += dy
  } else if (shape.type === 'text') {
    shape.x += dx; shape.y += dy
  }
}

function redrawAll(ctx, shapes, selIdx, overlay = false) {
  const { width, height } = ctx.canvas
  if (overlay) {
    ctx.clearRect(0, 0, width, height)
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  shapes.forEach(s => renderShape(ctx, s, overlay))
  if (selIdx >= 0 && selIdx < shapes.length) {
    const b = getShapeBounds(shapes[selIdx])
    ctx.save()
    ctx.strokeStyle = '#0078d7'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.strokeRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6)
    ctx.restore()
  }
}

export default function DrawingCanvas({ message, overlay = false }) {
  const canvasRef = useRef(null)
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [secondaryColor] = useState('#FFFFFF')
  const shapes = useRef([])
  const drawing = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const currentShape = useRef(null)
  const selectedIdx = useRef(-1)
  const textInputRef = useRef(null)
  const [textPos, setTextPos] = useState(null)
  const [textValue, setTextValue] = useState('')

  // Convenience wrappers that bake in overlay flag
  const redraw = useCallback((ctx, selIdx) => {
    redrawAll(ctx, shapes.current, selIdx, overlay)
  }, [overlay])

  const drawShape = useCallback((ctx, shape) => {
    renderShape(ctx, shape, overlay)
  }, [overlay])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    if (!overlay) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [overlay])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const idx = selectedIdx.current
      if (idx < 0) return
      shapes.current.splice(idx, 1)
      selectedIdx.current = -1
      redraw(canvasRef.current.getContext('2d'), -1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redraw])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)

    if (tool === 'text') {
      setTextPos(pos)
      setTextValue('')
      setTimeout(() => textInputRef.current?.focus(), 0)
      return
    }

    if (tool === 'select') {
      let found = -1
      for (let i = shapes.current.length - 1; i >= 0; i--) {
        if (hitTest(shapes.current[i], pos.x, pos.y)) { found = i; break }
      }
      selectedIdx.current = found
      drawing.current = found >= 0
      origin.current = pos
      redraw(ctx, found)
      return
    }

    drawing.current = true
    origin.current = pos
    selectedIdx.current = -1

    if (tool === 'pencil' || tool === 'eraser') {
      currentShape.current = { type: tool, points: [pos], color }
    } else if (tool === 'line') {
      currentShape.current = { type: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, color }
    } else if (tool === 'arrow') {
      currentShape.current = { type: 'arrow', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, color }
    } else if (tool === 'rect') {
      currentShape.current = { type: 'rect', x: pos.x, y: pos.y, w: 0, h: 0, color }
    } else if (tool === 'ellipse') {
      currentShape.current = { type: 'ellipse', cx: pos.x, cy: pos.y, rx: 0, ry: 0, color }
    }
  }, [tool, color, redraw])

  const onMouseMove = useCallback((e) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)

    if (tool === 'select') {
      const idx = selectedIdx.current
      if (idx < 0) return
      const dx = pos.x - origin.current.x
      const dy = pos.y - origin.current.y
      origin.current = pos
      moveShape(shapes.current[idx], dx, dy)
      redraw(ctx, idx)
      return
    }

    const s = currentShape.current
    if (!s) return

    if (tool === 'pencil' || tool === 'eraser') {
      s.points.push(pos)
      redraw(ctx, -1)
      drawShape(ctx, s)
    } else {
      if (tool === 'line' || tool === 'arrow') {
        s.x2 = pos.x; s.y2 = pos.y
      } else if (tool === 'rect') {
        s.w = pos.x - s.x; s.h = pos.y - s.y
      } else if (tool === 'ellipse') {
        const ox = origin.current.x, oy = origin.current.y
        s.cx = (ox + pos.x) / 2; s.cy = (oy + pos.y) / 2
        s.rx = Math.abs(pos.x - ox) / 2; s.ry = Math.abs(pos.y - oy) / 2
      }
      redraw(ctx, -1)
      drawShape(ctx, s)
    }
  }, [tool, color, redraw, drawShape])

  const onMouseUp = useCallback((e) => {
    if (!drawing.current) return
    drawing.current = false
    if (tool === 'select') return

    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    const s = currentShape.current
    if (!s) return

    if (tool === 'line' || tool === 'arrow') {
      s.x2 = pos.x; s.y2 = pos.y
    } else if (tool === 'rect') {
      s.w = pos.x - s.x; s.h = pos.y - s.y
    } else if (tool === 'ellipse') {
      const ox = origin.current.x, oy = origin.current.y
      s.cx = (ox + pos.x) / 2; s.cy = (oy + pos.y) / 2
      s.rx = Math.abs(pos.x - ox) / 2; s.ry = Math.abs(pos.y - oy) / 2
    }

    shapes.current.push(s)
    currentShape.current = null
    redraw(ctx, -1)
  }, [tool, redraw])

  const commitText = useCallback(() => {
    if (!textPos || !textValue.trim()) { setTextPos(null); return }
    shapes.current.push({ type: 'text', x: textPos.x, y: textPos.y, text: textValue, color })
    redraw(canvasRef.current.getContext('2d'), selectedIdx.current)
    setTextPos(null)
    setTextValue('')
  }, [textPos, textValue, color, redraw])

  const cursorStyle = tool === 'text' ? 'text' : tool === 'eraser' ? 'cell' : tool === 'select' ? 'default' : 'crosshair'

  return (
    <div className={`drawing-canvas-wrap${overlay ? ' overlay' : ''}`}>
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
            shapes.current = []
            selectedIdx.current = -1
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (overlay) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
            } else {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
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
            style={{ cursor: cursorStyle }}
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
