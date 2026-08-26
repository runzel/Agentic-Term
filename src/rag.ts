import Database from "@tauri-apps/plugin-sql";

// A very simplified mock of what a RAG implementation would look like in TS
// In reality, you'd likely use something like @xenova/transformers for local embeddings
// and a robust vector DB, or offload it to a local Python daemon.

export interface Document {
    id?: number;
    filename: string;
    content: string;
    // embeddings would be stored here or in a specialized vector DB extension for SQLite
}

export async function addDocument(doc: Document) {
    const db = await Database.load("sqlite:agentic.db");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);

    await db.execute(
        `INSERT INTO documents (filename, content) VALUES ($1, $2)`,
        [doc.filename, doc.content]
    );
}

export async function searchDocuments(query: string): Promise<Document[]> {
    const db = await Database.load("sqlite:agentic.db");

    // Fallback naive search if no vector extension is available
    // In a real implementation, this would use a vector similarity search (e.g. SQLite-VSS)
    const results = await db.select<Document[]>(
        `SELECT * FROM documents WHERE content LIKE $1 LIMIT 5`,
        [`%${query}%`]
    );

    return results;
}
