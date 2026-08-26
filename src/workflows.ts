import Database from "@tauri-apps/plugin-sql";

export interface Skill {
    id?: number;
    name: string;
    description: string;
    script: string;
    type: 'shell' | 'python';
}

export interface WorkflowStep {
    skillId?: number;
    aiPrompt?: string;
    action: 'execute_skill' | 'ask_ai' | 'wait_for_output';
}

export interface Workflow {
    id?: number;
    name: string;
    description: string;
    steps: WorkflowStep[];
}

export async function addSkill(skill: Skill) {
    const db = await Database.load("sqlite:agentic.db");
    await db.execute(
        `INSERT INTO skills (name, description, script, type) VALUES ($1, $2, $3, $4)`,
        [skill.name, skill.description, skill.script, skill.type]
    );
}

export async function getSkills(): Promise<Skill[]> {
    const db = await Database.load("sqlite:agentic.db");
    return await db.select<Skill[]>(`SELECT * FROM skills`);
}

export async function executeWorkflow(workflow: Workflow, terminalRef: any) {
    // In a real implementation, this would:
    // 1. Iterate through workflow.steps
    // 2. If 'execute_skill', fetch the skill script from DB and send it to the terminal via Tauri backend PTY
    // 3. If 'ask_ai', pass the current terminal context to the AI buddy
    // 4. If 'wait_for_output', pause execution until a regex matches in the terminal output

    console.log("Executing workflow:", workflow.name);
    if (terminalRef && terminalRef.current) {
        terminalRef.current.write(`\r\n\x1b[38;2;255;158;100m[Workflow Engine]\x1b[0m Starting workflow: ${workflow.name}\r\n`);
    }
}
