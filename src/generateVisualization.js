import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

function parseJSON(raw) {
  console.log('[parseJSON] raw length:', raw.length, 'preview:', raw.slice(0, 120))
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return { data: JSON.parse(jsonStr), error: null }
  } catch (e1) {
    console.warn('[parseJSON] direct parse failed:', e1.message)
    const m = jsonStr.match(/\{[\s\S]*\}/)
    if (m) {
      try { return { data: JSON.parse(m[0]), error: null } } catch (e2) {
        console.warn('[parseJSON] fallback parse failed:', e2.message)
      }
    }
    return { data: null, error: 'Failed to parse visualization data from API response' }
  }
}

export async function generateArrayVisualization(problemStatement, code) {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You trace code execution for educational array visualizations.
Return ONLY a single valid JSON object — no markdown fences, no commentary, nothing else.

Schema:
{
  "testCase": string,
  "arrays": { "<name>": number[] },
  "steps": [
    {
      "line": number,
      "description": string,
      "arrays": { "<name>": number[] },
      "pointers": { "<name>": number },
      "highlights": number[]
    }
  ]
}

Guidelines:
- Pick a simple 4–6 element test case. testCase should be a short string like "nums = [2,7,11,15], target = 9"
- Create a step for EVERY line that executes, including variable definitions and assignments
- When an index variable is assigned (e.g. left = 0, right = len-1), that line must be its own step showing the pointer above its index
- In EVERY step, include ALL currently defined index variables in "pointers" — not just the ones that changed
- Reflect any mutations (swaps, overwrites) in "arrays" at each step
- "pointers" maps variable names to array indices only (skip non-index variables like target, result)
- "highlights" lists indices being actively examined or compared
- Line numbers must be 1-indexed and match the provided code exactly (count blank lines too)
- If the code has no array mutations, keep "arrays" the same across all steps`,
    messages: [{
      role: 'user',
      content: `Problem:\n${problemStatement}\n\nCode:\n${code}`,
    }],
  })

  return parseJSON(resp.content[0].text.trim())
}

export async function generateLinkedListVisualization(problemStatement, code) {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You trace code execution for educational linked list visualizations.
Return ONLY a single valid JSON object — no markdown fences, no commentary, nothing else.

Schema:
{
  "testCase": string,
  "steps": [
    {
      "line": number,
      "description": string,
      "nodes": [{"id": string, "val": any, "next": string | null}],
      "pointers": { "<name>": string | null },
      "highlights": string[]
    }
  ]
}

Guidelines:
- Pick a simple acyclic test case with 4–5 nodes even for cycle problems (simulate the cycle with pointer behavior, not actual circular next pointers — keep "next" fields as a linear chain so JSON stays valid)
- testCase should be a short string like "head = [3,2,0,-4], pos = 1"
- Use stable node IDs like "n1", "n2", etc. — IDs must not change across steps
- Create a step for EVERY line that executes, including variable definitions and assignments
- When a pointer variable is assigned (e.g. current = head, slow = head), that line must be its own step showing the new pointer above its node
- In EVERY step, include ALL currently defined pointer variables in "pointers" — not just the ones that changed. If slow=n1 and fast=n1 were set previously, keep them in every subsequent step too
- "pointers" maps variable names to node IDs, or null for null/None assignments
- "highlights" lists node IDs being actively examined
- Line numbers must be 1-indexed and match the provided code exactly (count blank lines)`,
    messages: [{
      role: 'user',
      content: `Problem:\n${problemStatement}\n\nCode:\n${code}`,
    }],
  })

  return parseJSON(resp.content[0].text.trim())
}
