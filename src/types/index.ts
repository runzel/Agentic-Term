/**
 * Core type definitions for Agentic Term
 */

export interface AIConfig {
  provider: 'claude' | 'codex' | 'unsloth';
  apiKey?: string;
  apiEndpoint?: string;
  model: string;
}

export interface AIResponse {
  content: string;
  tokens?: {
    input: number;
    output: number;
  };
  error?: string;
}

export interface Skill {
  id?: number;
  name: string;
  description: string;
  script: string;
  type: 'shell' | 'python';
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowStep {
  id: string;
  type: 'execute_skill' | 'ask_ai' | 'wait_for_output' | 'conditional';
  skillId?: number;
  aiPrompt?: string;
  condition?: string;
  timeout?: number;
}

export interface Workflow {
  id?: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id?: number;
  filename: string;
  content: string;
  embedding?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RAGSearchResult {
  document: Document;
  similarity: number;
  relevance: number;
}

export interface Connection {
  id?: number;
  name: string;
  type: 'ssh' | 'local' | 'remote';
  host?: string;
  port?: number;
  username?: string;
  credentialId?: number;
}

export interface AppError extends Error {
  code: string;
  context?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}
