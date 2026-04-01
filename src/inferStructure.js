import Anthropic from '@anthropic-ai/sdk'

const SUPPORTED = ['array', 'linked list']

console.log('[inferStructure] API key defined?', !!import.meta.env.VITE_ANTHROPIC_API_KEY)
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Returns { structure: 'array' | 'linked list', error: null }
 * or      { structure: null, error: string }
 */
export async function inferStructure(problemStatement, code = '') {
  const userContent = [
    `Problem:\n${problemStatement}`,
    code.trim() ? `Code:\n${code.trim()}` : '',
  ].filter(Boolean).join('\n\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    system: `You identify the primary data structure a LeetCode problem is about.
Reply with ONLY one of these exact strings: array, linked list, unsupported

Use both the problem statement AND the code (if provided) as context.

Rules:
- Code or problem uses array, nums[], indices, or indexed sequences → array
- Code or problem uses ListNode, .next, head, linked list, or node pointers → linked list
  (Includes cycle detection, reversals, merging — if the structure is a linked list, always reply: linked list)
- Anything else (tree, graph, stack, heap, trie) → unsupported

Examples:
"rotate array to the right by k steps" → array
"detect a cycle in a linked list" → linked list
"return the node where the cycle begins" → linked list
code contains "ListNode" or ".next" → linked list`,
    messages: [
      { role: 'user', content: userContent },
    ],
  })

  const raw = message.content[0].text.trim().toLowerCase()
  console.log('[inferStructure] raw response:', JSON.stringify(raw))

  const matched = SUPPORTED.find(s => raw.includes(s))
  if (!matched) {
    return {
      structure: null,
      error: `"${raw}" visualizations aren't supported yet. Currently supported: Array, Linked List.`,
    }
  }

  return { structure: matched, error: null }
}
