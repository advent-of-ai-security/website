import { useMemo, useState } from 'react';
import {
  IconBolt,
  IconCheck,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconBrowser,
  IconDatabase,
  IconCode,
  IconInfoCircle,
  IconExternalLink,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'xss' | 'rce' | 'sqli';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  llmOutput: string; // The raw text "generated" by the model
  targetSystem: 'Browser' | 'Server Shell' | 'Database';
  vulnerableResult: string; // What happens if executed directly
  defendedResult: string; // What happens if filtered/sanitized
};

const SCENARIOS: Scenario[] = [
  {
    id: 'xss',
    label: 'XSS Attack',
    description: 'Model hallucinates a malicious script tag in a summary.',
    llmOutput: 'Summary: The user is a <b>software engineer</b>. <img src=x onerror=alert("Hacked") />',
    targetSystem: 'Browser',
    vulnerableResult: '[ALERT] "Hacked"',
    defendedResult: 'Summary: The user is a <b>software engineer</b>. <img src=x onerror=alert("Hacked") /> (Rendered as text)',
  },
  {
    id: 'rce',
    label: 'Remote Code Exec',
    description: 'Model generates Python code that accesses the file system.',
    llmOutput: 'import os\nprint(os.popen("cat /etc/passwd").read())',
    targetSystem: 'Server Shell',
    vulnerableResult: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin...',
    defendedResult: 'Error: Import "os" is forbidden in sandbox environment.',
  },
  {
    id: 'sqli',
    label: 'SQL Injection',
    description: 'Model concatenates user input directly into a query string.',
    llmOutput: "SELECT * FROM users WHERE name = 'Alice'; DROP TABLE users; --'",
    targetSystem: 'Database',
    vulnerableResult: 'Query 1: Returned User(Alice)\nQuery 2: TABLE "users" DROPPED.',
    defendedResult: 'Error: Multi-statement queries not allowed. Parameterized query required.',
  },
];

// --- 2. Logic Hook ---

function useOutputSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('xss');
  const [defenses, setDefenses] = useState({
    encoding: true,
    sandboxing: true,
    validation: true,
  });

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    let isDefended = false;
    let defenseTriggered = null;

    if (activeScenario.id === 'xss') {
      if (defenses.encoding) {
        isDefended = true;
        defenseTriggered = 'Output Encoding';
      }
    } else if (activeScenario.id === 'rce') {
      if (defenses.sandboxing) {
        isDefended = true;
        defenseTriggered = 'Sandboxing';
      }
    } else if (activeScenario.id === 'sqli') {
      if (defenses.validation) {
        isDefended = true;
        defenseTriggered = 'Query Validation';
      }
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
      currentOutput: isDefended ? activeScenario.defendedResult : activeScenario.vulnerableResult,
      threatLevel: isDefended ? 'NOMINAL' : 'CRITICAL',
    };
  }, [activeScenario, defenses]);

  const toggleDefense = (k: keyof typeof defenses) => {
    setDefenses((d) => ({ ...d, [k]: !d[k] }));
  };

  return {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result: simulation,
  };
}

// --- 3. UI Components ---

const SecurityModule = ({
  label,
  description,
  intel,
  active,
  triggered,
  onClick,
  learnMoreUrl,
}: {
  label: string;
  description: string;
  intel: string;
  active: boolean;
  triggered: boolean;
  onClick: () => void;
  icon: any;
  learnMoreUrl: string;
}) => {
  const [showIntel, setShowIntel] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Dynamic Styles based on state
  let containerClass = 'border-neutral-200 bg-neutral-50 text-neutral-400';
  let statusColor = 'bg-neutral-300';
  let statusText = 'OFFLINE';

  if (active) {
    if (triggered) {
      containerClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 shadow-md';
      statusColor = 'bg-emerald-500 animate-pulse';
      statusText = 'THREAT BLOCKED';
    } else {
      containerClass = 'border-black bg-white text-black shadow-sm';
      statusColor = 'bg-emerald-400';
      statusText = 'ONLINE';
    }
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex w-full cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left transition-all duration-200 ${containerClass}`}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 font-bold uppercase tracking-wider text-xs">
          <div
            onMouseEnter={(e) => {
              e.stopPropagation();
              setShowIntel(true);
              setCursorPos({ x: e.clientX, y: e.clientY });
            }}
            onMouseMove={(e) => {
              e.stopPropagation();
              if (showIntel) {
                setCursorPos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setShowIntel(false);
            }}
            className="text-neutral-400 hover:text-black transition-colors focus:outline-none p-0.5 shrink-0 cursor-help"
            title="Hover for details"
          >
            <IconInfoCircle size={16} />
          </div>
          <span>{label}</span>
        </div>
        {/* Toggle Switch Visual */}
        <div className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${active ? 'bg-black' : 'bg-neutral-300'}`}>
          <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-transform ${active ? 'left-5' : 'left-1'}`} />
        </div>
      </div>
      
      <div className="text-[11px] opacity-80 leading-relaxed">
        {description}
      </div>

      {/* Status Footer */}
      <div className="mt-1 flex items-center justify-between border-t border-black/5 pt-3">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{statusText}</span>
        </div>
        
        <a 
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider opacity-50 hover:opacity-100 hover:underline"
          title="Read external documentation"
        >
          Source <IconExternalLink size={10} />
        </a>
      </div>

      {/* Intel Floating Tooltip */}
      {showIntel && (
        <div 
          className="fixed z-50 w-64 rounded border border-white/10 bg-neutral-900/95 p-3 text-neutral-300 shadow-xl backdrop-blur-sm pointer-events-none"
          style={{
            left: cursorPos.x + 16,
            top: cursorPos.y + 16,
          }}
        >
          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-neutral-500">Intel</div>
          <p className="text-[10px] leading-relaxed">
            {intel}
          </p>
        </div>
      )}
    </div>
  );
};

// --- 4. Main Application ---

export default function InsecureOutputLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result,
  } = useOutputSimulation();

  return (
    <div className="w-full bg-white">
      {/* Scenarios Bar */}
      <div className="mb-0 flex flex-wrap items-center gap-2 border-b border-black/10 bg-white px-4 py-3">
        <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Scenarios:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenarioId(s.id)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${ 
              activeScenarioId === s.id
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Explainer Bar */}
      <div className="border-b border-black/10 bg-neutral-50 px-6 py-2">
        <div className="grid gap-4 text-[10px] font-medium uppercase tracking-wide text-neutral-400 md:grid-cols-[1fr_280px_1fr]">
          <div>1. LLM Generates Content</div>
          <div className="text-center">2. Apply Middleware Defenses</div>
          <div>3. Execute on Target</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: LLM OUTPUT STREAM */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconCode size={16} /> Raw Model Response
          </label>
          <div className="relative flex-1 rounded-md border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-700">

            {result.llmOutput}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-3 text-[10px] text-yellow-800">
            <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p>Warning: The model has generated content that may be dangerous if interpreted as code.</p>
          </div>
        </div>

        {/* COL 2: MIDDLEWARE CONTROLS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Middleware Layer
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Output Encoding"
              icon={IconBrowser}
              description="Escapes HTML entities (< >) to prevent browser rendering."
              intel="Converts special characters into their safe HTML entity equivalents (e.g., < becomes &lt;). This neutralizes XSS attacks by ensuring the browser treats the data as text, not executable code."
              active={defenses.encoding}
              triggered={result.defenseTriggered === 'Output Encoding'}
              onClick={() => toggleDefense('encoding')}
              learnMoreUrl="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
            />
            <SecurityModule
              label="Code Sandbox"
              icon={IconTerminal}
              description="Executes code in an isolated, ephemeral environment."
              intel="Runs generated code inside a container (like gVisor or Firecracker) with no network access and read-only filesystems. Even if `rm -rf` is run, it only affects the temporary container."
              active={defenses.sandboxing}
              triggered={result.defenseTriggered === 'Sandboxing'}
              onClick={() => toggleDefense('sandboxing')}
              learnMoreUrl="https://github.com/google/gvisor"
            />
            <SecurityModule
              label="Query Validation"
              icon={IconDatabase}
              description="Enforces parameterized queries and blocks chained commands."
              intel="Uses prepared statements to treat user input strictly as data parameters, never as executable SQL commands. Also creates allow-lists for SQL verbs (e.g., allowing SELECT but blocking DROP)."
              active={defenses.validation}
              triggered={result.defenseTriggered === 'Query Validation'}
              onClick={() => toggleDefense('validation')}
              learnMoreUrl="https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
            />
          </div>

          <div className="mt-auto border-t border-black/10 pt-6">
             <div className="grid grid-cols-2 gap-2">
               <div className="rounded border border-black/5 bg-white p-2 text-center">
                 <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Risk Level</div>
                 <div className={`mt-1 text-xs font-bold ${result.threatLevel === 'CRITICAL' ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                   {result.threatLevel}
                 </div>
               </div>
               <div className="rounded border border-black/5 bg-white p-2 text-center">
                 <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Target</div>
                 <div className="mt-1 text-xs font-bold text-neutral-800">
                   {result.targetSystem}
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* COL 3: EXECUTION RESULT */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Execution Log
            </div>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
            </div>
          </div>

          <div className="flex-1 space-y-6 font-mono text-xs">
            {/* Actual Output */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">System Output</div>
              <div className={`border-l-2 pl-3 py-1 leading-relaxed ${
                  result.isDefended ? 'border-emerald-500 text-emerald-700' : 'border-red-500 text-red-700'
              }`}>
                {result.currentOutput}
              </div>
              {result.isDefended && (
                 <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                    <IconCheck size={10}/> Attack Neutralized
                 </div>
              )}
            </div>

            {/* Ghost Output (What blocked attack would have done) */}
            {result.isDefended && (
              <div className="space-y-2 pt-6 border-t border-red-200 border-dashed opacity-60">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-red-800">
                   <IconBolt size={10}/> Simulated Breach Impact
                </div>
                <div className="border-l-2 border-red-200 pl-3 py-1 text-red-800 line-through decoration-red-300 leading-relaxed">
                  {result.vulnerableResult}
                </div>
              </div>
            )}
            
            {/* Idle State */}
            {!result.isDefended && (
               <div className="mt-auto pt-12 text-[10px] text-red-800/70 text-center border-t border-red-200/50">
                  <div className="mb-2 flex justify-center"><IconAlertTriangle size={24}/></div>
                  SYSTEM COMPROMISED<br/>Malicious payload executed.
               </div>
            )}
          </div>
        </div>      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: This is a client-side simulation for educational purposes. Actual LLM behavior and defense implementation details may vary.
        </p>
      </div>
    </div>
  );
}