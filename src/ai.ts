export interface AIConfig {
  provider: 'claude' | 'codex' | 'unsloth';
  apiKey?: string;
  apiEndpoint?: string;
  model: string;
}

export async function askAI(config: AIConfig, prompt: string, context: string = ""): Promise<string> {
  const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;

  if (config.provider === 'unsloth') {
    // Unsloth local API (e.g., Ollama or custom endpoint)
    try {
      const response = await fetch(config.apiEndpoint || 'http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          prompt: fullPrompt,
          stream: false
        })
      });
      const data = await response.json();
      return data.response || "No response generated.";
    } catch (e) {
      return `Error connecting to local Unsloth buddy: ${e}`;
    }
  } else if (config.provider === 'claude') {
    // Claude API via Anthropic Messages API
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerously-allow-browser': 'true' // For demo purposes; in prod, route through Tauri backend
        },
        body: JSON.stringify({
          model: config.model || "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{ role: "user", content: fullPrompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.content[0].text;
    } catch (e) {
      return `Claude Error: ${e}`;
    }
  } else if (config.provider === 'codex') {
    // OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || "gpt-3.5-turbo",
          messages: [{ role: "user", content: fullPrompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices[0].message.content;
    } catch (e) {
      return `Codex Error: ${e}`;
    }
  }

  return "Unknown AI provider.";
}
