import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { askAI, AIConfig } from '../ai';
import { searchDocuments } from '../rag';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'claude' | 'codex' | 'unsloth'>('unsloth');

  // Haxor Mode: Allows AI to suggest commands to execute (advanced)
  const [haxorMode, setHaxorMode] = useState(false);

  // RAG Mode: Consults local "Second Brain"
  const [ragMode, setRagMode] = useState(false);

  const [suggestedCommand, setSuggestedCommand] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Fake state to simulate reading from DB
  const [apiKey, setApiKey] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setResponse('Copied command to clipboard');
    } catch (e) {
      setResponse('Failed to copy to clipboard');
    }
  };

  const executeCommand = async () => {
    if (!suggestedCommand) return;
    setConfirmVisible(false);
    setResponse('Executing command...');
    try {
      // Route execution through Tauri backend (invoke a command named `execute_command`).
      // The Tauri side should implement the actual execution with permission controls.
      const result = await invoke('execute_command', { cmd: suggestedCommand });
      setResponse(String(result || 'Execution finished'));
    } catch (e) {
      console.error('Execution failed', e);
      setResponse('Execution failed — see logs');
    }
  };

  const handleAsk = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse('Preparing…');
    setSuggestedCommand('');

    // In a real app, load these from the secure SQLite DB
    const config: AIConfig = {
      provider,
      model:
        provider === 'unsloth'
          ? 'llama3'
          : provider === 'claude'
          ? 'claude-3-haiku'
          : 'gpt-3.5-turbo',
      apiEndpoint: 'http://localhost:11434/api/generate',
      apiKey: apiKey || 'demo_key', // Load from DB securely
    };

    let context = '';
    if (ragMode) {
      setResponse('Searching local documents…');
      try {
        const docs = await searchDocuments(prompt);
        if (docs.length > 0) {
          context =
            "Use the following context from the user's local documents:\n\n" +
            docs.map((d) => `--- File: ${d.filename} ---\n${d.content}`).join('\n\n');
        }
      } catch (e) {
        console.error('RAG search failed', e);
        setResponse('Document search failed');
      }
    }

    const enhancedPrompt = haxorMode
      ? `You are a terminal assistant. The user wants to accomplish: ${prompt}. Provide ONLY the exact shell command to achieve this inside a \`\`\`bash block. No other text.`
      : prompt;

    setResponse('Thinking…');
    const res = await askAI(config, enhancedPrompt, context);
    // askAI returns an object { content, error }
    const content = (res as any)?.content || '';
    const error = (res as any)?.error || '';
    setResponse(error || content || 'No response generated');

    if (haxorMode && typeof content === 'string') {
      const match = content.match(/```(?:bash|sh)?\n([\s\S]*?)\n```/);
      if (match && match[1]) {
        setSuggestedCommand(match[1].trim());
      }
    }

    setLoading(false);
  };

  return (
    <div className="absolute right-4 bottom-4 w-[400px] bg-[#16161e] border border-[#292e42] rounded-lg shadow-2xl p-4 flex flex-col gap-4 z-50">
      <div className="flex justify-between items-center border-b border-[#292e42] pb-2">
        <h3 className="text-[var(--color-neon-pink)] font-mono text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-neon-pink)] animate-pulse shadow-[0_0_8px_rgba(247,118,142,0.8)]" />
          AI Assistant {haxorMode ? ' · Haxor (advanced)' : ''} {ragMode ? ' · RAG' : ''}
        </h3>
        <div className="flex items-center gap-2">
          <select
            aria-label="AI provider"
            className="bg-[#1a1b26] text-[var(--color-neon-blue)] font-mono border border-[#292e42] rounded text-xs p-1 focus:outline-none"
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
          >
            <option value="unsloth">Local model (Unsloth)</option>
            <option value="claude">Claude (cloud)</option>
            <option value="codex">OpenAI (Codex / GPT)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <label className="text-xs text-[#a9b1d6] font-mono flex items-center gap-1 cursor-pointer">
          <input
            aria-label="Enable command execution (Haxor Mode)"
            type="checkbox"
            checked={haxorMode}
            onChange={(e) => setHaxorMode(e.target.checked)}
            className="accent-[var(--color-neon-orange)]"
          />
          Haxor Mode (advanced — may execute commands)
        </label>
        <label className="text-xs text-[var(--color-neon-green)] font-mono flex items-center gap-1 cursor-pointer">
          <input
            aria-label="Use local document search (Second Brain)"
            type="checkbox"
            checked={ragMode}
            onChange={(e) => setRagMode(e.target.checked)}
            className="accent-[var(--color-neon-green)]"
          />
          Use Second Brain (local RAG)
        </label>
      </div>

      {provider !== 'unsloth' && (
        <input
          type="password"
          aria-label="Provider API key"
          placeholder={`${provider} API Key (optional)`}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full bg-[#1a1b26] border border-[#292e42] rounded px-2 py-1 text-xs text-[#a9b1d6] font-mono focus:outline-none focus:border-[var(--color-neon-pink)]"
        />
      )}

      <div className="flex-1 min-h-[100px] max-h-[300px] overflow-y-auto text-xs text-[#a9b1d6] font-mono whitespace-pre-wrap selection:bg-[#414868]">
        {response ||
          'Ready to assist with workflows.\nToggle Haxor Mode to generate executable skills.\nToggle Second Brain to query local documents.'}

        {suggestedCommand && (
          <div className="mt-4 p-2 bg-[#1a1b26] border border-[#414868] rounded">
            <div className="text-[var(--color-neon-orange)] mb-1">Suggested command</div>
            <pre className="text-[var(--color-neon-green)] whitespace-pre-wrap">{suggestedCommand}</pre>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-[#292e42] hover:bg-[#414868] text-white px-2 py-1 rounded text-xs transition-colors"
                onClick={() => copyToClipboard(suggestedCommand)}
              >
                Copy
              </button>
              <button
                className="bg-[var(--color-neon-pink)] text-[#16161e] font-bold px-2 py-1 rounded text-xs transition-colors"
                onClick={() => setConfirmVisible(true)}
              >
                Execute
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={haxorMode ? 'Describe the task to generate a shell command…' : 'Ask the assistant…'}
          aria-label="Assistant prompt"
          className="flex-1 bg-[#1a1b26] border border-[#292e42] rounded px-2 py-1.5 text-sm text-[#a9b1d6] font-mono focus:outline-none focus:border-[var(--color-neon-pink)] transition-colors"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          aria-label="Send prompt"
          className="bg-[var(--color-neon-pink)] text-[#16161e] font-bold px-3 py-1.5 rounded text-sm transition-transform active:scale-95"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>

      {confirmVisible && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f1116] border border-[#292e42] rounded-lg p-4 w-[380px]">
            <h4 className="font-mono text-sm mb-2">Confirm execution</h4>
            <p className="text-xs text-[#a9b1d6] mb-2">This will run the following command on your machine. Review it carefully before continuing.</p>
            <pre className="bg-[#0b0c10] p-2 rounded text-[var(--color-neon-green)] mb-3 whitespace-pre-wrap">{suggestedCommand}</pre>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 text-xs rounded bg-[#292e42]" onClick={() => setConfirmVisible(false)}>Cancel</button>
              <button className="px-3 py-1 text-xs rounded bg-[var(--color-neon-pink)] text-[#16161e]" onClick={executeCommand}>Confirm and Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
