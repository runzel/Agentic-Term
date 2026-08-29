import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  VITE_AI_PROVIDER: z.enum(['unsloth', 'claude', 'codex']).default('unsloth'),
  VITE_UNSLOTH_ENDPOINT: z.string().url().default('http://localhost:11434/api/generate'),
  VITE_CLAUDE_API_KEY: z.string().optional(),
  VITE_OPENAI_API_KEY: z.string().optional(),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_APP_VERSION: z.string().default('0.2.0'),
  VITE_DB_PATH: z.string().default('agentic.db'),
  VITE_RAG_EMBEDDING_MODEL: z.string().default('all-MiniLM-L6-v2'),
  VITE_RAG_VECTOR_DB: z.enum(['sqlite-vss', 'milvus']).default('sqlite-vss'),
});

type Env = z.infer<typeof envSchema>;

let validated: Env | null = null;

/**
 * Get validated environment configuration
 */
export function getEnv(): Env {
  if (!validated) {
    const env = import.meta.env as Record<string, unknown>;
    try {
      validated = envSchema.parse(env);
    } catch (error) {
      console.error('Invalid environment configuration:', error);
      throw new Error('Failed to validate environment variables');
    }
  }
  return validated;
}

/**
 * Safely get an environment variable
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key];
}
