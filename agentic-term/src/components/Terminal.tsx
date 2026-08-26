import { useEffect, useRef } from 'react';
import { Terminal as GhosttyTerminal } from 'ghostty-web';

interface TerminalProps {
  id: string;
}

export function Terminal({ id }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const ghosttyRef = useRef<GhosttyTerminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // We fetch the WASM from the public directory
    const initTerminal = async () => {
      try {
        const term = new GhosttyTerminal({
          fontSize: 14,
          fontFamily: 'monospace'
        });

        term.open(terminalRef.current!);

        // Simulating some retro/haxor output
        term.write('\x1b[38;2;122;162;247mAgentic Term\x1b[0m v0.1.0\r\n');
        term.write('Ghostty WASM Backend initialized.\r\n');
        term.write('\x1b[38;2;158;206;106m$ \x1b[0m');

        ghosttyRef.current = term;

        // Basic echo for demo
        term.attachCustomKeyEventHandler((e) => {
            if (e.type === 'keydown') {
                if (e.key === 'Enter') {
                    term.write('\r\n\x1b[38;2;158;206;106m$ \x1b[0m');
                    return true;
                } else if (e.key === 'Backspace') {
                    term.write('\b \b');
                    return true;
                } else if (e.key.length === 1) {
                    term.write(e.key);
                    return true;
                }
            }
            return false;
        });

      } catch (e) {
        console.error("Failed to initialize terminal", e);
      }
    };

    initTerminal();

    return () => {
      if (ghosttyRef.current) {
        ghosttyRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full p-2 bg-[#1a1b26] overflow-hidden" ref={terminalRef} id={`terminal-${id}`}>
    </div>
  );
}
