import { useState } from "react";
import * as prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import "98.css";
import "./App.css";
import CodeEditor from "./CodeEditor";

function isPython(raw) {
  return /^\s*(def |class |import |from |elif |except |with |async def )/m.test(raw)
}

function formatPython(raw) {
  const lines = raw.split('\n').map((line) => {
    // tabs → 4 spaces, strip trailing whitespace
    return line.replace(/\t/g, '    ').trimEnd()
  })
  // strip trailing blank lines then add one newline
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  return lines.join('\n') + '\n'
}

async function formatJS(raw) {
  return prettier.format(raw, {
    parser: 'babel',
    plugins: [babelPlugin, estreePlugin],
    printWidth: 80,
    tabWidth: 2,
    semi: true,
    singleQuote: true,
  })
}

async function formatCode(raw) {
  try {
    const formatted = isPython(raw)
      ? formatPython(raw)
      : await formatJS(raw)
    return { formatted, error: false }
  } catch {
    return { formatted: raw, error: true }
  }
}

export default function App() {
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [formatError, setFormatError] = useState(false);

  const handleCodeBlur = async () => {
    if (!code.trim()) return;
    const { formatted, error } = await formatCode(code);
    setFormatError(error);
    setCode(formatted);
  };

  const handleCodePaste = async (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const { formatted, error } = await formatCode(pasted);
    setFormatError(error);
    setCode(formatted);
  };

  const handleSubmit = () => {
    // visualization logic will go here
  };

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
          {["File", "Edit", "View", "Colors", "Help"].map((item) => (
            <span key={item} className="paint-menubar-item">
              {item}
            </span>
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
                <div className="panel-label">
                  Code
                  {formatError && (
                    <span className="format-error"> — could not format</span>
                  )}
                </div>
                <div
                  className={`sunken-panel${formatError ? " format-error-border" : ""}`}
                >
                  <CodeEditor
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onBlur={handleCodeBlur}
                    onPaste={handleCodePaste}
                    placeholder="Paste your code here..."
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
          <p className="status-bar-field">
            {formatError ? "Could not format — check syntax" : "Ready"}
          </p>
          <p className="status-bar-field">
            For Help, click Help on the menu bar
          </p>
        </div>
      </div>
    </div>
  );
}
