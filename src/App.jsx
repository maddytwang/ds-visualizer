import { useState } from 'react'
import '98.css'
import './App.css'
export default function App() {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = () => {
    // visualization logic will go here
  }

  return (
    <div className="desktop">
      <div className="window main-window">
        {/* Title bar */}
        <div className="title-bar">
          <div className="title-bar-text">untitled - DS Visualizer</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>

        {/* Menu bar */}
        <div className="paint-menubar">
          {['File', 'Edit', 'View', 'Colors', 'Help'].map((item) => (
            <span key={item} className="paint-menubar-item">{item}</span>
          ))}
        </div>

        <div className="window-body paint-body">
          {/* Main content */}
          <div className="main-content">
            {/* Top: inputs side by side */}
            <div className="input-row">
              <div className="panel">
                <div className="panel-label">Problem Statement</div>
                <div className="sunken-panel">
                  <textarea
                    className="text-input"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Paste the problem statement here..."
                    spellCheck={false}
                  />
                </div>
              </div>
              <div className="panel">
                <div className="panel-label">Code</div>
                <div className="sunken-panel">
                  <textarea
                    className="text-input code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="submit-row">
              <button onClick={handleSubmit}>Visualize</button>
            </div>

            {/* Bottom: visualization */}
            <div className="panel">
              <div className="panel-label">Visualization</div>
              <div className="sunken-panel viz-box" />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <p className="status-bar-field">Ready</p>
<p className="status-bar-field">For Help, click Help on the menu bar</p>
        </div>
      </div>
    </div>
  )
}
