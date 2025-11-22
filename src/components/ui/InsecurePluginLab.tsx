import { useMemo, useState } from 'react';
import {
  IconPlug,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconDatabase,
  IconInfoCircle,
  IconExternalLink,
  IconUserCheck,
  IconBox,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'sql' | 'email' | 'file';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  toolName: string;
  args: string;
  impact: string;
  vulnerableResult: string;
  defendedResult: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'sql',
    label: 'Unbounded SQL',
    description: 'Agent calls a generic SQL tool with a destructive query.',
    toolName: 'execute_query',
    args: 'DROP TABLE users;',
    impact: 'Data Loss',
    vulnerableResult: 'Success: Table "users" dropped.',
    defendedResult: 'Error: Permission denied. Tool "execute_query" is Read-Only.',
  },
  {
    id: 'email',
    label: 'Email Spoofing',
    description: 'Agent sends a mass email without user confirmation.',
    toolName: 'send_email',
    args: 'to="all@company.com", body="Phishing link..."',
    impact: 'Reputation Damage',
    vulnerableResult: 'Sent: Email delivered to 5,000 recipients.',
    defendedResult: 'Paused: Human approval required for tool "send_email".',
  },
  {
    id: 'file',
    label: 'Path Traversal',
    description: 'Agent reads sensitive system files via unrestricted path.',
    toolName: 'read_file',
    args: 'path="/etc/passwd"',
    impact: 'Confidentiality Breach',
    vulnerableResult: 'root:x:0:0:root:/root:/bin/bash...',
    defendedResult: 'Error: Access denied. Path must start with "/app/data/".',
  },
];

// --- 2. Logic Hook ---

function usePluginSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('sql');
  const [defenses, setDefenses] = useState({
    readonly: true,
    humanLoop: true,
    pathValidation: true,
  });

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    let isDefended = false;
    let defenseTriggered = null;

    if (activeScenario.id === 'sql') {
      if (defenses.readonly) {
        isDefended = true;
        defenseTriggered = 'Read-Only Scope';
      }
    } else if (activeScenario.id === 'email') {
      if (defenses.humanLoop) {
        isDefended = true;
        defenseTriggered = 'Human Approval';
      }
    } else if (activeScenario.id === 'file') {
      if (defenses.pathValidation) {
        isDefended = true;
        defenseTriggered = 'Input Validation';
      }
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
      currentResult: isDefended ? activeScenario.defendedResult : activeScenario.vulnerableResult,
      status: isDefended ? 'BLOCKED' : 'EXECUTED',
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

  let containerClass = 'border-neutral-200 bg-neutral-50 text-neutral-400';
  let statusColor = 'bg-neutral-300';
  let statusText = 'OFFLINE';

  if (active) {
    if (triggered) {
      containerClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 shadow-md';
      statusColor = 'bg-emerald-500 animate-pulse';
      statusText = 'INTERCEPTED';
    } else {
      containerClass = 'border-black bg-white text-black shadow-sm';
      statusColor = 'bg-emerald-400';
      statusText = 'ACTIVE';
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
        <div className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${active ? 'bg-black' : 'bg-neutral-300'}`}>
          <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-transform ${active ? 'left-5' : 'left-1'}`} />
        </div>
      </div>
      
      <div className="text-[11px] opacity-80 leading-relaxed">
        {description}
      </div>

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

export default function InsecurePluginLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result,
  } = usePluginSimulation();

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
          <div>1. Tool Invocation</div>
          <div className="text-center">2. Plugin Gateway</div>
          <div>3. Execution Status</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: TOOL CALL */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconPlug size={16} /> Agent Request
          </label>
          
          <div className="flex-1 space-y-4">
             <div className="flex flex-col gap-1 rounded border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-700">
                <div className="text-[10px] uppercase text-neutral-400">Function</div>
                <div className="font-bold text-black">{result.toolName}</div>
                <div className="text-[10px] uppercase text-neutral-400 mt-2">Arguments</div>
                <div className="break-all">{result.args}</div>
             </div>
             
             <div className="rounded border border-orange-100 bg-orange-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase text-orange-400">
                    <IconAlertTriangle size={12} /> Potential Impact
                </div>
                <div className="text-[10px] text-orange-800 opacity-80 leading-relaxed">
                   {result.impact}
                </div>
             </div>
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Access Control
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Read-Only Scope"
              icon={IconDatabase}
              description="Prevent write/delete ops on critical tables."
              intel="Connects the agent to the database using a user role that only has SELECT permissions, making DROP TABLE commands fail at the SQL engine level."
              active={defenses.readonly}
              triggered={result.defenseTriggered === 'Read-Only Scope'}
              onClick={() => toggleDefense('readonly')}
              learnMoreUrl="https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
            />
            <SecurityModule
              label="Human Approval"
              icon={IconUserCheck}
              description="Require confirmation for side-effects (email, API)."
              intel="Intercepts the tool execution loop. The agent must pause and wait for a human operator to click 'Approve' before the 'send_email' function actually runs."
              active={defenses.humanLoop}
              triggered={result.defenseTriggered === 'Human Approval'}
              onClick={() => toggleDefense('humanLoop')}
              learnMoreUrl="https://langchain-ai.github.io/langgraph/how-tos/human-in-the-loop/"
            />
            <SecurityModule
              label="Input Validation"
              icon={IconBox}
              description="Strict schema validation for file paths and URLs."
              intel="Uses a whitelist of allowed directories (e.g., /data/public/). Any path attempting to traverse out (../) or access system roots is rejected by the plugin wrapper."
              active={defenses.pathValidation}
              triggered={result.defenseTriggered === 'Input Validation'}
              onClick={() => toggleDefense('pathValidation')}
              learnMoreUrl="https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html"
            />
          </div>
        </div>

        {/* COL 3: EXECUTION LOG */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Execution Log
            </div>
            {!result.isDefended && (
                <div className="animate-pulse flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                    <IconAlertTriangle size={12} /> Unsafe Action
                </div>
            )}
          </div>

          <div className="flex-1 space-y-6 font-mono text-xs">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">System Output</div>
              <div className={`border-l-2 pl-3 py-1 leading-relaxed whitespace-pre-wrap ${
                  result.isDefended ? 'border-emerald-500 text-emerald-700' : 'border-red-500 text-red-700'
              }`}>
                {result.currentResult}
              </div>
            </div>
            
            {/* Status Indicator */}
             <div className={`mt-auto pt-12 text-center border-t border-black/5`}>
                {result.isDefended ? (
                    <div className="text-emerald-600 flex flex-col items-center gap-2">
                        <IconShield size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Action Prevented</span>
                    </div>
                ) : (
                    <div className="text-red-600 flex flex-col items-center gap-2">
                        <IconPlug size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Action Succeeded</span>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Simulation only. No actual tools are executed.
        </p>
      </div>
    </div>
  );
}
