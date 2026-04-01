// ── Test case parsers ────────────────────────────────────────────────────────

// Extract the first JSON array from a string like "[1,2,3]" or "nums=[1,2,3], target=9"
function extractArray(str) {
  const m = str.match(/\[([^\]]*)\]/)
  if (m) {
    try {
      return JSON.parse(`[${m[1]}]`)
    } catch {}
    // Handle non-JSON values like strings
    return m[1].split(',').map(s => {
      const v = s.trim()
      const n = Number(v)
      return isNaN(n) ? v.replace(/^['"]|['"]$/g, '') : n
    })
  }
  // Comma-separated fallback
  const parts = str.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length) return parts.map(p => { const n = Number(p); return isNaN(n) ? p : n })
  return []
}

// Try to detect the array variable name from the test case string
function extractArrayName(str) {
  const m = str.match(/(\w+)\s*=\s*\[/)
  return m ? m[1] : 'nums'
}

// Parse linked list input: "[1,2,3]", "1->2->3->4", "head=[1,2,3]"
function parseLinkedList(str) {
  let values = []
  const trimmed = str.trim()
  if (trimmed.includes('->')) {
    values = trimmed.replace(/.*=\s*/, '').split('->').map(s => {
      const n = Number(s.trim())
      return isNaN(n) ? s.trim() : n
    })
  } else {
    values = extractArray(trimmed)
  }
  return values.map((val, i) => ({
    id: `n${i + 1}`,
    val,
    next: i < values.length - 1 ? `n${i + 2}` : null,
  }))
}

// ── Step builder ─────────────────────────────────────────────────────────────

// Returns one step per non-blank code line. Data structure state is static
// (same at every step) — no execution tracing.
function stepsFromCode(code, stepData) {
  return code.split('\n').reduce((acc, lineText, i) => {
    if (!lineText.trim()) return acc
    acc.push({
      line: i + 1,
      description: lineText.trim(),
      pointers: {},
      highlights: [],
      ...stepData,
    })
    return acc
  }, [])
}

// ── Public API ───────────────────────────────────────────────────────────────

export function buildVisualization(code, testCaseStr, structure) {
  const input = testCaseStr.trim()

  if (structure === 'array') {
    const arrayName = extractArrayName(input) || 'nums'
    const values = extractArray(input)
    const arrays = { [arrayName]: values }
    const steps = stepsFromCode(code, { arrays })
    return { testCase: input, arrays, steps }
  }

  if (structure === 'linked list') {
    const nodes = parseLinkedList(input)
    const steps = stepsFromCode(code, { nodes })
    return { testCase: input, steps }
  }

  return null
}
