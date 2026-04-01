export default function ArrayVisualizer({ vizData, step }) {
  const { testCase } = vizData
  const currentStep = vizData.steps[step] ?? vizData.steps[0]
  const { pointers = {}, highlights = [] } = currentStep

  const arrayName = Object.keys(vizData.arrays ?? {})[0] ?? ''
  const currentArray = currentStep.arrays?.[arrayName] ?? vizData.arrays?.[arrayName] ?? []

  const pointersByIndex = {}
  Object.entries(pointers).forEach(([name, idx]) => {
    if (typeof idx === 'number') {
      if (!pointersByIndex[idx]) pointersByIndex[idx] = []
      pointersByIndex[idx].push(name)
    }
  })

  return (
    <div className="array-viz">
      <div className="viz-test-case">{testCase}</div>
      <div className="viz-array-cells">
        {currentArray.map((val, i) => (
          <div key={i} className="viz-cell-col">
            <div className="viz-pointer-label">
              {pointersByIndex[i]?.join(', ') ?? ''}
            </div>
            <div className="viz-pointer-arrow">
              {pointersByIndex[i] ? '↓' : '\u00a0'}
            </div>
            <div className={`viz-cell${highlights.includes(i) ? ' highlighted' : ''}`}>
              {val}
            </div>
            <div className="viz-cell-index">{i}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
