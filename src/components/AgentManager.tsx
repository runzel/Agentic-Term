import React, { useEffect, useState } from 'react';
import { createAgent, listAgents } from '../services/agent.service';

export function AgentManager() {
  const [agents, setAgents] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('unsloth');
  const [model, setModel] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await listAgents();
        setAgents(list || []);
      } catch (e) {
        console.error('Failed to list agents', e);
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      const a = await createAgent({ name, provider, model });
      setAgents((s) => [...s, a]);
      setName('');
      setModel('');
    } catch (e) {
      console.error('create failed', e);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Agent Manager</h2>
      <div className="flex gap-2 mb-3">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-1 rounded" />
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="border p-1 rounded">
          <option value="unsloth">Local (Unsloth)</option>
          <option value="claude">Claude</option>
          <option value="codex">Codex</option>
          <option value="cline">Cline SDK</option>
        </select>
        <input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} className="border p-1 rounded" />
        <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
      </div>

      <div>
        <h3 className="font-semibold">Existing agents</h3>
        <ul>
          {agents.map((a) => (
            <li key={a.id} className="py-1">{a.name} — {a.provider} {a.model ? `(${a.model})` : ''}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
