export default function LinkedListVisualizer({ vizData, step }) {
  const currentStep = vizData.steps[step] ?? vizData.steps[0]
  const { nodes = [], pointers = {}, highlights = [] } = currentStep

  // Build lookup maps
  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  // Determine display order by traversing from the head pointer
  const headId = pointers.head ?? pointers.curr ?? pointers.current ?? nodes[0]?.id
  const order = []
  const visited = new Set()
  let cur = headId
  while (cur && nodeMap[cur] && !visited.has(cur)) {
    order.push(cur)
    visited.add(cur)
    cur = nodeMap[cur].next
  }
  // Append any disconnected nodes not reachable from head
  nodes.forEach(n => { if (!visited.has(n.id)) order.push(n.id) })

  // Map nodeId → pointer names pointing to it
  const pointersByNode = {}
  Object.entries(pointers).forEach(([name, id]) => {
    if (!id) return
    if (!pointersByNode[id]) pointersByNode[id] = []
    pointersByNode[id].push(name)
  })

  return (
    <div className="ll-viz">
      <div className="viz-test-case">{vizData.testCase}</div>
      <div className="ll-nodes">
        {order.map((id) => {
          const node = nodeMap[id]
          if (!node) return null
          const hasNext = node.next != null
          const names = pointersByNode[id]
          return (
            <div key={id} className="ll-node-group">
              <div className="ll-node-col">
                <div className="viz-pointer-label">{names?.join(', ') ?? ''}</div>
                <div className="viz-pointer-arrow">{names ? '↓' : '\u00a0'}</div>
                <div className={`ll-node${highlights.includes(id) ? ' highlighted' : ''}`}>
                  {node.val}
                </div>
              </div>
              <div className="ll-connector">
                {hasNext ? '→' : '→ NULL'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
