import Anthropic from '@anthropic-ai/sdk'

const SUPPORTED = ['array', 'linked list']

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Returns { structure: 'array' | 'linked list', error: null }
 * or      { structure: null, error: string }
 */
export async function inferStructure(problemStatement) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    system: `You identify the primary data structure a LeetCode problem is about.
Reply with ONLY one of these exact strings: array, linked list.
If the problem is about something else entirely (tree, graph, stack, queue, heap, trie, etc.), reply with: unsupported`,
    messages: [
      { role: 'user', content: problemStatement },
    ],
  })

  const raw = message.content[0].text.trim().toLowerCase()

  if (!SUPPORTED.includes(raw)) {
    return {
      structure: null,
      error: `"${raw}" visualizations aren't supported yet. Currently supported: Array, Linked List.`,
    }
  }

  return { structure: raw, error: null }
}
