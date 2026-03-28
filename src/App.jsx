import { useState } from 'react'
import './App.css'

const STRUCTURES = ['Array', 'Linked List']

function App() {
  const [code, setCode] = useState('')
  const [selected, setSelected] = useState('Array')

  const handleSubmit = () => {
    // visualization logic will go here
  }

  return (
    <div className="app">
      <h1>DS Visualizer</h1>
      <div className="structure-picker">
        {STRUCTURES.map((s) => (
          <button
            key={s}
            className={`structure-btn${selected === s ? ' active' : ''}`}
            onClick={() => setSelected(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="panels">
        <div className="panel">
          <h2>Code</h2>
          <textarea
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            spellCheck={false}
          />
        </div>
        <div className="panel">
          <h2>Visualization</h2>
          <div className="viz-box" />
        </div>
      </div>
      <div className="submit-row">
        <button className="submit-btn" onClick={handleSubmit}>
          Visualize
        </button>
      </div>
    </div>
  )
}

export default App
