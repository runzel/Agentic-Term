import { useState } from 'react';
import { askAI, AIConfig } from '../ai';
import { searchDocuments } from '../rag';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'claude' | 'codex' | 'unsloth'>('unsloth');

  // Haxor Mode: Allows AI to suggest commands to execute
  const [haxorMode, setHaxorMode] = useState(false);

  // RAG Mode: Consults local Second Brain
  const [ragMode, setRagMode] = useState(false);

  const [suggestedCommand, setSuggestedCommand] = useState('');

  // Fake state to simulate reading from DB
  const [apiKey, setApiKey] = useState('');

  const handleAsk = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse('Thinking...');
    setSuggestedCommand('');

    // In a real app, load these from the SQLite DB
    const config: AIConfig = {
      provider,
      model: provider === 'unsloth' ? 'llama3' : (provider === 'claude' ? 'claude-3-haiku' : 'gpt-3.5-turbo'),
      apiEndpoint: 'http://localhost:11434/api/generate',
      apiKey: apiKey || 'demo_key' // Load from DB securely
    };

    let context = "";
    if (ragMode) {
        setResponse('Searching Second Brain...');
        try {
            const docs = await searchDocuments(prompt);
            if (docs.length > 0) {
                context = "Use the following context from the user's local documents:\n\n" +
                          docs.map(d => `--- File: ${d.filename} ---\n${d.content}`).join('\n\n');
            }
        } catch (e) {
            console.error("RAG search failed", e);
        }
    }

    const enhancedPrompt = haxorMode
        ? `You are an elite haxor terminal assistant. The user wants to accomplish: ${prompt}. Provide ONLY the exact shell command to achieve this inside a \`\`\`bash block. No other text.`
        : prompt;

    setResponse('Thinking...');
    const res = await askAI(config, enhancedPrompt, context);
    setResponse(res);

    if (haxorMode) {
        const match = res.match(/```(?:bash|sh)?\n([\s\S]*?)\n```/);
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
           <span className="w-2 h-2 rounded-full bg-[var(--color-neon-pink)] animate-pulse shadow-[0_0_8px_rgba(247,118,142,0.8)]"></span>
           AI Buddy {haxorMode ? '[HAXOR]' : ''} {ragMode ? '[RAG]' : ''}
        </h3>
        <div className="flex items-center gap-2">
            <select
              className="bg-[#1a1b26] text-[var(--color-neon-blue)] font-mono border border-[#292e42] rounded text-xs p-1 focus:outline-none"
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
            >
              <option value="unsloth">Local (Unsloth)</option>
              <option value="claude">Claude</option>
              <option value="codex">Codex</option>
            </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
          <label className="text-xs text-[#a9b1d6] font-mono flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={haxorMode} onChange={(e) => setHaxorMode(e.target.checked)} className="accent-[var(--color-neon-orange)]" />
              Haxor Mode
          </label>
          <label className="text-xs text-[var(--color-neon-green)] font-mono flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={ragMode} onChange={(e) => setRagMode(e.target.checked)} className="accent-[var(--color-neon-green)]" />
              Use Second Brain (RAG)
          </label>
      </div>

      {provider !== 'unsloth' && (
          <input
            type="password"
            placeholder={`${provider} API Key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-[#1a1b26] border border-[#292e42] rounded px-2 py-1 text-xs text-[#a9b1d6] font-mono focus:outline-none focus:border-[var(--color-neon-pink)]"
          />
      )}

      <div className="flex-1 min-h-[100px] max-h-[300px] overflow-y-auto text-xs text-[#a9b1d6] font-mono whitespace-pre-wrap selection:bg-[#414868]">
        {response || "Ready to assist with workflows...\nToggle Haxor Mode to generate executable skills.\nToggle Second Brain to query local documents."}

        {suggestedCommand && (
            <div className="mt-4 p-2 bg-[#1a1b26] border border-[#414868] rounded">
                <div className="text-[var(--color-neon-orange)] mb-1">Suggested Skill Execution:</div>
                <div className="text-[var(--color-neon-green)]">{suggestedCommand}</div>
                <button
                    className="mt-2 bg-[#292e42] hover:bg-[#414868] text-white px-2 py-1 rounded text-xs transition-colors"
                    onClick={() => {
                        console.log("Executing:", suggestedCommand);
                    }}
                >
                    Run in Terminal
                </button>
            </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={haxorMode ? "What skill should I execute?" : "Ask AI..."}
          className="flex-1 bg-[#1a1b26] border border-[#292e42] rounded px-2 py-1.5 text-sm text-[#a9b1d6] font-mono focus:outline-none focus:border-[var(--color-neon-pink)] transition-colors"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-[var(--color-neon-pink)] text-[#16161e] font-bold px-3 py-1.5 rounded text-sm transition-transform active:scale-95"
        >
          {loading ? '...' : '>_'}
        </button>
      </div>
    </div>
  );
}
