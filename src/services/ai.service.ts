/**
 * Small AI service logging improvement and safety reminders.
 * Keep provider calls routed through a secure backend (Tauri) in production.
 */

import type { AIConfig, AIResponse } from '@/types';
import { logger } from '@/utils/logger';
import { createError } from '@/utils/errors';
import { getEnvVar } from '@/utils/env';

/**
 * Call AI provider through secure Tauri backend
 * @param config - AI provider configuration
 * @param prompt - User prompt
 * @param context - Optional context for RAG
 * @returns AI response with token counts
 */
export async function askAI(
  config: AIConfig,
  prompt: string,
  context?: string
): Promise<AIResponse> {
  try {
    // Avoid logging full prompt content; log length and provider info only.
    logger.debug('Calling AI provider', { provider: config.provider, model: config.model, promptLength: prompt.length });

    // In production, this should call a Tauri command that performs the network request securely:
    // const response = await invoke('ai_generate', { config, prompt, context });

    // For now, fall back to in-renderer calls (placeholder)
    if (config.provider === 'unsloth') {
      return callUnsloth(config, prompt, context);
    } else if (config.provider === 'claude') {
      return callClaude(config, prompt, context);
    } else if (config.provider === 'codex') {
      return callOpenAI(config, prompt, context);
    }

    throw createError('UNKNOWN_PROVIDER', 'Unknown AI provider', { provider: config.provider });
  } catch (error) {
    logger.error('AI call failed', error);
    if (error instanceof Error && 'message' in error) {
      return { content: '', error: error.message };
    }
    return { content: '', error: 'Failed to call AI provider' };
  }
}

/* The provider-specific implementations are unchanged except for clearer errors and comments. */

async function callUnsloth(
  config: AIConfig,
  prompt: string,
  context?: string
): Promise<AIResponse> {
  const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
  const endpoint = config.apiEndpoint || getEnvVar('VITE_UNSLOTH_ENDPOINT');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw createError('UNSLOTH_ERROR', `Unsloth error: ${response.statusText}`, { status: response.status });
    }

    const data = (await response.json()) as { response?: string };
    return {
      content: data.response || 'No response generated',
    };
  } catch (error) {
    throw createError('UNSLOTH_CONNECTION', 'Failed to connect to Unsloth endpoint', {
      endpoint,
    });
  }
}

async function callClaude(
  config: AIConfig,
  prompt: string,
  context?: string
): Promise<AIResponse> {
  const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
  const apiKey = config.apiKey || getEnvVar('VITE_CLAUDE_API_KEY');

  if (!apiKey) {
    throw createError('MISSING_API_KEY', 'Claude API key not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw createError('CLAUDE_ERROR', error.error?.message || 'Claude API error');
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    const content = data.content?.[0]?.text || 'No response generated';
    return { content };
  } catch (error) {
    if (error instanceof Error && 'message' in error) throw error;
    throw createError('CLAUDE_CALL_FAILED', 'Failed to call Claude API');
  }
}

async function callOpenAI(
  config: AIConfig,
  prompt: string,
  context?: string
): Promise<AIResponse> {
  const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
  const apiKey = config.apiKey || getEnvVar('VITE_OPENAI_API_KEY');

  if (!apiKey) {
    throw createError('MISSING_API_KEY', 'OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      throw createError('OPENAI_ERROR', error.error?.message || 'OpenAI API error');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || 'No response generated';
    return { content };
  } catch (error) {
    if (error instanceof Error && 'message' in error) throw error;
    throw createError('OPENAI_CALL_FAILED', 'Failed to call OpenAI API');
  }
}
