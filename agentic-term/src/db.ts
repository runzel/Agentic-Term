import Database from "@tauri-apps/plugin-sql";

export async function initDb() {
  const db = await Database.load("sqlite:agentic.db");

  // Credentials & Connections
  await db.execute(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'ssh', 'local', etc.
      host TEXT,
      port INTEGER,
      username TEXT,
      credentials TEXT -- In a real app this should be encrypted in the keyring
    );
  `);

  // Agents & Configurations
  await db.execute(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      provider TEXT NOT NULL, -- 'claude', 'codex', 'unsloth'
      api_endpoint TEXT,
      api_key TEXT,
      model TEXT,
      system_prompt TEXT
    );
  `);

  // Skills
  await db.execute(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      script TEXT NOT NULL, -- Shell or Python script
      type TEXT NOT NULL -- 'shell', 'python'
    );
  `);

  // Context Workflows
  await db.execute(`
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      steps TEXT NOT NULL -- JSON array of steps
    );
  `);

  return db;
}
