// Simple local runner starter designed to be launched by development scripts or the Tauri backend.
// It exposes a minimal HTTP API to manage agents and stream events via Server-Sent Events (SSE).

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import { askAI } from '../src/services/ai.service';

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const agents: Record<string, any> = {};

app.post('/agents', (req, res) => {
  const id = uuid();
  const { name, provider, model, systemPrompt } = req.body;
  agents[id] = { id, name, provider, model, systemPrompt };
  res.json(agents[id]);
});

app.get('/agents', (req, res) => res.json(Object.values(agents)));

// SSE stream for running agents
app.post('/agents/:id/run', async (req, res) => {
  const { id } = req.params;
  const agent = agents[id];
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const { prompt, rag } = req.body;

  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders?.();

  // Simple single-run loop using askAI
  try {
    const context = rag ? 'LOCAL_RAG_CONTEXT_PLACEHOLDER' : undefined;
    const aiRes = await askAI({ provider: agent.provider, model: agent.model }, prompt, context as any);
    res.write(`event: content\ndata: ${JSON.stringify(aiRes.content)}\n\n`);
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify(String(e))}\n\n`);
  }

  res.write(`event: done\ndata: {}\n\n`);
  res.end();
});

const port = Number(process.env.AGENTIC_RUNNER_PORT) || 11435;
app.listen(port, () => console.log(`Agentic runner listening on http://localhost:${port}`));
