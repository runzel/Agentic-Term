export async function createAgent(payload: { name: string; provider: string; model?: string; systemPrompt?: string }) {
  const res = await fetch('http://localhost:11435/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function listAgents() {
  const res = await fetch('http://localhost:11435/agents');
  return res.json();
}

export async function runAgent(agentId: string, payload: { prompt: string; rag?: boolean }) {
  const res = await fetch(`http://localhost:11435/agents/${agentId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // return the response body as a readable stream text
  return res.body;
}
