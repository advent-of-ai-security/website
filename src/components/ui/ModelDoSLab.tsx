import { useMemo, useState, useEffect } from 'react';
import {
  IconServer,
  IconShield,
  IconActivity,
  IconAlertTriangle,
  IconCpu,
  IconClock,
  IconDatabase,
  IconInfoCircle,
  IconExternalLink,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'flood' | 'recursive' | 'parallel';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  attackType: string;
  payload: string;
  impact: string;
  vulnerableState: string;
  defendedState: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'flood',
    label: 'Context Flood',
    description: 'Attacker sends 100k tokens of random noise to exhaust memory.',
    attackType: 'Resource Exhaustion',
    payload: '[System] Loading 50MB text file...',
    impact: 'OOM (Out of Memory) Crash',
    vulnerableState: 'Server crashed. RAM usage > 128GB.',
    defendedState: 'Request rejected. Token limit exceeded (100k > 8k).',
  },
  {
    id: 'recursive',
    label: 'Recursive Expansion',
    description: 'Prompt triggers an infinite loop of self-calling tools.',
    attackType: 'Logic Loop',
    payload: 'Task: "Analyze X, then improvements, then re-analyze..."',
    impact: 'Compute Saturation',
    vulnerableState: 'CPU 100% for 4+ hours. $5000 bill.',
    defendedState: 'Loop detected. Execution halted after 3 recursions.',
  },
  {
    id: 'parallel',
    label: 'Parallel Storm',
    description: 'Botnet sends 10,000 concurrent requests per second.',
    attackType: 'DDoS',
    payload: 'POST /api/chat (x10,000)',
    impact: 'Service Unavailable (503)',
    vulnerableState: 'All legitimate users blocked. System unresponsive.',
    defendedState: 'Traffic throttled. IP 192.168.x.x blocked.',
  },
];

// --- 2. Logic Hook ---

function useDoSSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('flood');
  const [defenses, setDefenses] = useState({
    rateLimit: true,
    contextCap: true,
    timeout: true,
  });

  // Simulation state for animations
  const [cpuLoad, setCpuLoad] = useState(10);
  const [memoryLoad, setMemoryLoad] = useState(20);
  const [isAttacking, setIsAttacking] = useState(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    let isDefended = false;
    let defenseTriggered = null;

    if (activeScenario.id === 'flood') {
      if (defenses.contextCap) {
        isDefended = true;
        defenseTriggered = 'Context Window Cap';
      }
    } else if (activeScenario.id === 'recursive') {
      if (defenses.timeout) {
        isDefended = true;
        defenseTriggered = 'Execution Timeout';
      }
    } else if (activeScenario.id === 'parallel') {
      if (defenses.rateLimit) {
        isDefended = true;
        defenseTriggered = 'Rate Limiting';
      }
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
      currentState: isDefended ? activeScenario.defendedState : activeScenario.vulnerableState,
      status: isDefended ? 'STABLE' : 'CRITICAL',
    };
  }, [activeScenario, defenses]);

  // Effect to simulate load
  useEffect(() => {
    if (!isAttacking) {
        setCpuLoad(10);
        setMemoryLoad(20);
        return;
    }

    let cpuTarget = 10;
    let memTarget = 20;

    if (simulation.status === 'CRITICAL') {
        cpuTarget = 98;
        memTarget = 95;
    } else {
        // Defended but under attack
        cpuTarget = 35;
        memTarget = 30;
    }

    const interval = setInterval(() => {
        setCpuLoad(prev => prev + (cpuTarget - prev) * 0.1);
        setMemoryLoad(prev => prev + (memTarget - prev) * 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isAttacking, simulation.status]);

  const toggleDefense = (k: keyof typeof defenses) => {
    setDefenses((d) => ({ ...d, [k]: !d[k] }));
  };

  return {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result: simulation,
    cpuLoad,
    memoryLoad,
    isAttacking,
    setIsAttacking
  };
}

// --- 3. UI Components ---

const LoadBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="w-full">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-300 ease-out ${color}`} 
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

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
      statusText = 'MITIGATING';
    } else {
      containerClass = 'border-black bg-white text-black shadow-sm';
      statusColor = 'bg-emerald-400';
      statusText = 'READY';
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

export default function ModelDoSLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result,
    cpuLoad,
    memoryLoad,
    isAttacking,
    setIsAttacking
  } = useDoSSimulation();

  return (
    <div className="w-full bg-white">
      {/* Scenarios Bar */}
      <div className="mb-0 flex flex-wrap items-center gap-2 border-b border-black/10 bg-white px-4 py-3">
        <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Scenarios:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
                setActiveScenarioId(s.id);
                setIsAttacking(false);
            }}
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
          <div>1. Generate Traffic</div>
          <div className="text-center">2. Throttling & Limits</div>
          <div>3. Resource Impact</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: ATTACK SIMULATOR */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconActivity size={16} /> Network Simulator
          </label>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-600">
               <span className="text-neutral-400 select-none">$ </span>{result.payload}
            </div>

            <div className="mt-auto">
                <button
                    onClick={() => setIsAttacking(!isAttacking)}
                    className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all ${
                        isAttacking 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                >
                    {isAttacking ? 'Stop Attack' : 'Launch Attack'}
                </button>
                <p className="mt-3 text-center text-[10px] text-neutral-400">
                    {isAttacking ? 'Traffic injection in progress...' : 'System idle. Ready for test.'}
                </p>
            </div>
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Governance Policy
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Rate Limiting"
              icon={IconClock}
              description="Caps requests per user/IP over time windows."
              intel="Implements 'leaky bucket' or fixed-window algorithms to reject excess traffic from a single source, preventing volumetric attacks."
              active={defenses.rateLimit}
              triggered={isAttacking && result.defenseTriggered === 'Rate Limiting'}
              onClick={() => toggleDefense('rateLimit')}
              learnMoreUrl="https://konghq.com/blog/how-to-design-a-scalable-rate-limiting-algorithm"
            />
            <SecurityModule
              label="Context Cap"
              icon={IconDatabase}
              description="Hard limit on input tokens per request."
              intel="Rejects any prompt exceeding N tokens (e.g., 8192) before processing, protecting the memory stack from exhaustion attempts."
              active={defenses.contextCap}
              triggered={isAttacking && result.defenseTriggered === 'Context Window Cap'}
              onClick={() => toggleDefense('contextCap')}
              learnMoreUrl="https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them"
            />
            <SecurityModule
              label="Max Timeout"
              icon={IconCpu}
              description="Terminates long-running inference or tool loops."
              intel="Sets a strict execution time limit (e.g., 30s) for agent actions. If the agent gets stuck in a logic loop, the process is killed to free up compute."
              active={defenses.timeout}
              triggered={isAttacking && result.defenseTriggered === 'Execution Timeout'}
              onClick={() => toggleDefense('timeout')}
              learnMoreUrl="https://en.wikipedia.org/wiki/Watchdog_timer"
            />
          </div>
        </div>

        {/* COL 3: SYSTEM METRICS */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconServer size={16} /> Server Status
            </div>
            {isAttacking && (
                <div className="animate-pulse flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                    <IconAlertTriangle size={12} /> Load High
                </div>
            )}
          </div>

          <div className="flex-1 space-y-8">
            
            <div className="space-y-4">
                <LoadBar 
                    label="CPU Usage" 
                    value={cpuLoad} 
                    color={cpuLoad > 80 ? 'bg-red-500' : 'bg-black'} 
                />
                <LoadBar 
                    label="Memory Usage" 
                    value={memoryLoad} 
                    color={memoryLoad > 80 ? 'bg-red-500' : 'bg-black'} 
                />
            </div>

            <div className="rounded border border-black/10 bg-white p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    System Logs
                </div>
                <div className="font-mono text-[10px] leading-relaxed min-h-[80px]">
                    {!isAttacking && <span className="text-neutral-400">Waiting for traffic...</span>}
                    {isAttacking && (
                        <>
                            <div className="text-neutral-500">[INFO] Incoming request batch (ID: 9928a)...</div>
                            <div className={`mt-1 ${result.isDefended ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}`}>
                                {result.isDefended ? `[BLOCK] ${result.currentState}` : `[CRITICAL] ${result.currentState}`}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
             {/* Idle State */}
            {!isAttacking && (
               <div className="mt-auto pt-4 text-[10px] text-neutral-400 text-center">
                  Resources stable.
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Visual simulation only. Does not generate actual network traffic.
        </p>
      </div>
    </div>
  );
}
