import { Terminal } from './components/Terminal';
import { AIAssistant } from './components/AIAssistant';
import { TerminalSquare, Plus, Code2, Database, BrainCircuit, Settings, Activity, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initDb } from './db';

function App() {
  const [tabs, setTabs] = useState([{ id: '1', title: 'bash' }]);
  const [activeTab, setActiveTab] = useState('1');
  const [activeSidebar, setActiveSidebar] = useState('terminal');
  const [dbStatus, setDbStatus] = useState('Initializing local database...');

  useEffect(() => {
    initDb().then(() => {
      setDbStatus('Local database loaded. Sync complete.');
    }).catch(e => {
      setDbStatus(`Database Error: ${e}`);
    });
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-transparent font-sans">
      {/* Titlebar/Drag area */}
      <div data-tauri-drag-region className="h-10 bg-[#16161e] border-b border-[#292e42] flex items-center px-4 select-none">
        <div className="flex gap-2 mr-6">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex items-end h-full gap-1 pt-2 pointer-events-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveSidebar('terminal'); }}
              className={`px-4 py-1.5 rounded-t-md text-xs font-mono cursor-pointer flex items-center gap-2 border-b-0 transition-colors
                ${activeTab === tab.id && activeSidebar === 'terminal'
                  ? 'bg-[#1a1b26] text-[var(--color-neon-blue)] border-t border-l border-r border-[#292e42] shadow-[0_-2px_10px_rgba(122,162,247,0.1)]'
                  : 'bg-[#16161e] text-[#565f89] hover:bg-[#1f2335] hover:text-[#a9b1d6]'}`}
            >
              <TerminalSquare size={14} className={activeTab === tab.id && activeSidebar === 'terminal' ? "text-[var(--color-neon-blue)] drop-shadow-[0_0_5px_rgba(122,162,247,0.5)]" : ""} />
              {tab.title}
            </div>
          ))}
          <div
            onClick={() => {
              const newId = String(Date.now());
              setTabs([...tabs, { id: newId, title: 'bash' }]);
              setActiveTab(newId);
              setActiveSidebar('terminal');
            }}
            className="px-2 py-1 mb-0.5 ml-1 rounded hover:bg-[#292e42] text-[#565f89] hover:text-[var(--color-neon-green)] cursor-pointer transition-colors"
          >
            <Plus size={16} />
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative bg-[#1a1b26] flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-14 border-r border-[#292e42] flex flex-col items-center py-4 gap-6 bg-[#16161e] z-20">
            <div
              className={`p-2 rounded cursor-pointer transition-all ${activeSidebar === 'terminal' ? 'bg-[#292e42] text-[var(--color-neon-blue)] shadow-[0_0_10px_rgba(122,162,247,0.2)]' : 'text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335]'}`}
              onClick={() => setActiveSidebar('terminal')}
              title="Terminals"
            >
              <TerminalSquare size={20} />
            </div>
            <div
              className={`p-2 rounded cursor-pointer transition-all ${activeSidebar === 'agents' ? 'bg-[#292e42] text-[var(--color-neon-pink)] shadow-[0_0_10px_rgba(247,118,142,0.2)]' : 'text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335]'}`}
              onClick={() => setActiveSidebar('agents')}
              title="AI Agents (Claude/Codex/Unsloth)"
            >
              <BrainCircuit size={20} />
            </div>
            <div
              className={`p-2 rounded cursor-pointer transition-all ${activeSidebar === 'skills' ? 'bg-[#292e42] text-[var(--color-neon-orange)] shadow-[0_0_10px_rgba(255,158,100,0.2)]' : 'text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335]'}`}
              onClick={() => setActiveSidebar('skills')}
              title="Haxor Skills & Workflows"
            >
              <Code2 size={20} />
            </div>
            <div
              className={`p-2 rounded cursor-pointer transition-all ${activeSidebar === 'database' ? 'bg-[#292e42] text-[var(--color-neon-green)] shadow-[0_0_10px_rgba(158,206,106,0.2)]' : 'text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335]'}`}
              onClick={() => setActiveSidebar('database')}
              title="Database & Credentials"
            >
              <Database size={20} />
            </div>
            <div
              className={`p-2 rounded cursor-pointer transition-all ${activeSidebar === 'brain' ? 'bg-[#292e42] text-[var(--color-neon-green)] shadow-[0_0_10px_rgba(158,206,106,0.2)]' : 'text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335]'}`}
              onClick={() => setActiveSidebar('brain')}
              title="Second Brain (RAG)"
            >
              <BookOpen size={20} />
            </div>

            <div className="flex-1"></div>

            <div
              className="p-2 rounded cursor-pointer text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335] transition-all"
              title="System Activity"
            >
              <Activity size={20} />
            </div>
            <div
              className="p-2 rounded cursor-pointer text-[#565f89] hover:text-[#a9b1d6] hover:bg-[#1f2335] transition-all"
              title="Settings"
            >
              <Settings size={20} />
            </div>
         </div>

         {/* Content container */}
         <div className="flex-1 relative bg-[#1a1b26]">
          {/* Terminals */}
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${activeTab === tab.id && activeSidebar === 'terminal' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {activeTab === tab.id && <Terminal id={tab.id} />}
            </div>
          ))}

          {/* Placeholder for other views */}
          {activeSidebar !== 'terminal' && (
            <div className="absolute inset-0 z-10 flex flex-col p-8 text-[var(--color-retro-fg)] overflow-y-auto">
              <h1 className="text-2xl font-mono mb-6 text-[var(--color-neon-blue)] drop-shadow-[0_0_8px_rgba(122,162,247,0.4)] border-b border-[#292e42] pb-2">
                {activeSidebar.toUpperCase()} MANAGEMENT
              </h1>
              <div className="flex-1 border border-[#292e42] rounded-lg bg-[#16161e] p-6 shadow-inner">
                <div className="mt-8 text-[var(--color-neon-green)] font-mono text-xs">
                  &gt; {dbStatus}
                </div>
              </div>
            </div>
          )}

          {activeSidebar === 'terminal' && <AIAssistant />}
         </div>
      </div>
    </div>
  );
}

export default App;
