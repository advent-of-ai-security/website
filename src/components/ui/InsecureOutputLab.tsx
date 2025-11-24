import { useMemo, useState } from 'react';
import {
  IconCode,
  IconAlertTriangle,
  IconTerminal,
  IconArrowRight,
  IconArrowDown,
  IconBrowser,
  IconDatabase,
  IconShieldCheck,
  IconShield,
  IconShieldLock,
  IconFilter,
  IconLock,
  IconRefresh,
} from '@tabler/icons-react';

type ScenarioId = 'xss' | 'rce' | 'sqli';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  llmOutput: string;
  targetSystem: 'Browser' | 'Server Shell' | 'Database';
  vulnerableResult: string;
  defendedResult: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'xss',
    label: 'XSS Attack',
    description: 'Model generates malicious HTML with embedded script',
    llmOutput: 'User bio: John is a <b>developer</b>. <img src=x onerror=alert("XSS") />',
    targetSystem: 'Browser',
    vulnerableResult: '[ALERT] "XSS" — Session cookies stolen via document.cookie exfiltration',
    defendedResult: 'User bio: John is a <b>developer</b>. [Image loading blocked by sanitizer]',
  },
  {
    id: 'rce',
    label: 'Remote Code Exec',
    description: 'Model generates Python code accessing filesystem',
    llmOutput: 'import os\nresult = os.popen("cat /etc/passwd").read()\nprint(result)',
    targetSystem: 'Server Shell',
    vulnerableResult: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n[SERVER COMPROMISED]',
    defendedResult: 'SandboxError: Module "os" is forbidden. Execution blocked.',
  },
  {
    id: 'sqli',
    label: 'SQL Injection',
    description: 'Model generates multi-statement SQL query',
    llmOutput: "SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --'",
    targetSystem: 'Database',
    vulnerableResult: 'Query 1: [admin record returned]\nQuery 2: TABLE "users" DROPPED — Data loss irreversible',
    defendedResult: 'ValidationError: Multi-statement queries forbidden. Parameterized query required.',
  },
];

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
    let defenseTriggered: string | null = null;

    if (activeScenario.id === 'xss' && defenses.encoding) {
      isDefended = true;
      defenseTriggered = 'Output Encoding';
    } else if (activeScenario.id === 'rce' && defenses.sandboxing) {
      isDefended = true;
      defenseTriggered = 'Code Sandboxing';
    } else if (activeScenario.id === 'sqli' && defenses.validation) {
      isDefended = true;
      defenseTriggered = 'Query Validation';
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
      currentOutput: isDefended ? activeScenario.defendedResult : activeScenario.vulnerableResult,
      threatLevel: isDefended ? 'NOMINAL' : 'CRITICAL',
      activeDefenseCount: Object.values(defenses).filter(Boolean).length,
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

const SecurityGate = ({
  label,
  description,
  isActive,
  isTriggered,
  onToggle,
  icon: Icon,
}: {
  label: string;
  description: string;
  isActive: boolean;
  isTriggered: boolean;
  onToggle: () => void;
  icon: any;
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 ${
        isActive
          ? isTriggered
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-neutral-900 bg-white shadow-md'
          : 'border-neutral-200 bg-neutral-50/50 opacity-60 hover:opacity-100 hover:bg-white hover:shadow-sm hover:border-neutral-300'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                isActive
                  ? isTriggered
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-400'
              }`}
            >
              <Icon size={20} stroke={2} />
            </div>
            <div>
              <h4
                className={`font-bold text-sm transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}
              >
                {label}
              </h4>
              <p className="text-xs text-neutral-500 leading-tight mt-0.5 max-w-[180px]">{description}</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
              isActive ? (isTriggered ? 'bg-emerald-500' : 'bg-neutral-900') : 'bg-neutral-300'
            }`}
          >
            <div
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>

        {/* Triggered Badge */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${isTriggered ? 'grid-rows-[1fr] mt-3 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="mt-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
              <IconShieldLock size={14} />
              Threat Blocked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineConnector = ({ active, pulsing }: { active: boolean; pulsing?: boolean }) => (
  <div className="flex items-center justify-center py-4 lg:py-0 lg:px-4 relative z-0">
    {/* Desktop: Horizontal */}
    <div className="hidden lg:flex items-center w-12 min-h-[300px] relative">
      <div
        className={`absolute inset-0 my-auto h-0.5 w-full rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`}
      />
      {active && pulsing && (
        <div className="absolute inset-0 my-auto h-0.5 w-4 rounded-full bg-neutral-900 animate-flow-right" />
      )}
      <IconArrowRight
        size={16}
        className={`absolute -right-1 top-1/2 -translate-y-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`}
      />
    </div>

    {/* Mobile: Vertical */}
    <div className="lg:hidden flex flex-col items-center h-12 relative">
      <div
        className={`absolute inset-0 mx-auto w-0.5 h-full rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`}
      />
      {active && pulsing && (
        <div className="absolute inset-0 mx-auto w-0.5 h-4 rounded-full bg-neutral-900 animate-flow-down" />
      )}
      <IconArrowDown
        size={16}
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`}
      />
    </div>
  </div>
);

const StageHeader = ({
  number,
  title,
  color = 'neutral',
}: {
  number: number;
  title: string;
  color?: 'neutral' | 'emerald' | 'red';
}) => {
  const colors = {
    neutral: { bg: 'bg-neutral-900', text: 'text-white', title: 'text-neutral-900' },
    emerald: { bg: 'bg-emerald-500', text: 'text-white', title: 'text-emerald-600' },
    red: { bg: 'bg-red-500', text: 'text-white', title: 'text-red-600' },
  };

  const theme = colors[color];

  return (
    <div className="flex items-center gap-3 pb-4 mb-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shadow-sm transition-colors duration-300 ${theme.bg} ${theme.text}`}
      >
        {number}
      </div>
      <h4 className={`text-xs font-extrabold uppercase tracking-widest transition-colors duration-300 ${theme.title}`}>
        {title}
      </h4>
    </div>
  );
};

export default function InsecureOutputLab() {
  const { activeScenarioId, setActiveScenarioId, defenses, toggleDefense, result } = useOutputSimulation();

  return (
    <div className="w-full bg-neutral-50/50 overflow-hidden">
      {/* CSS Animations */}
      <style>{`
        @keyframes flow-right {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(32px); opacity: 0; }
        }
        @keyframes flow-down {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(32px); opacity: 0; }
        }
        .animate-flow-right { animation: flow-right 1.5s infinite linear; }
        .animate-flow-down { animation: flow-down 1.5s infinite linear; }
      `}</style>

      {/* Header Toolbar */}
      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconCode size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Output Handling Lab</h3>
            <p className="text-xs font-medium text-neutral-500">XSS, RCE & SQL Injection Simulator</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1">Attack Scenario:</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                activeScenarioId === s.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md transform scale-105'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pipeline */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          {/* STAGE 1: LLM OUTPUT */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={1} title="LLM Output" />

            <div className="gap-3 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border-2 border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Raw Generated Content
                  </span>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed text-neutral-700 whitespace-pre-wrap">
                  {result.llmOutput}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-3 text-[10px] text-yellow-800">
                <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>
                  <b>Warning:</b> Content may contain executable code. Target: {result.targetSystem}
                </p>
              </div>
            </div>
          </div>

          <PipelineConnector active={true} pulsing={true} />

          {/* STAGE 2: OUTPUT HANDLERS */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={2} title="Output Handlers" />

            <div className="gap-3 flex-1 flex flex-col">
              <SecurityGate
                label="Output Encoding"
                description="HTML entity escaping"
                isActive={defenses.encoding}
                isTriggered={result.defenseTriggered === 'Output Encoding'}
                onToggle={() => toggleDefense('encoding')}
                icon={IconFilter}
              />
              <SecurityGate
                label="Code Sandboxing"
                description="Isolated execution env"
                isActive={defenses.sandboxing}
                isTriggered={result.defenseTriggered === 'Code Sandboxing'}
                onToggle={() => toggleDefense('sandboxing')}
                icon={IconLock}
              />
              <SecurityGate
                label="Query Validation"
                description="Parameterized queries"
                isActive={defenses.validation}
                isTriggered={result.defenseTriggered === 'Query Validation'}
                onToggle={() => toggleDefense('validation')}
                icon={IconRefresh}
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          {/* STAGE 3: TARGET SYSTEM */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="Target System"
              color={result.threatLevel === 'CRITICAL' && !result.isDefended ? 'red' : 'emerald'}
            />

            <div className="gap-4 flex-1 flex flex-col">
              {/* Main Result */}
              <div
                className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                  result.isDefended
                    ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                    : result.threatLevel === 'CRITICAL'
                      ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                      : 'border-transparent'
                }`}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold text-white transition-colors duration-300 ${
                    result.isDefended
                      ? 'bg-emerald-500'
                      : result.threatLevel === 'CRITICAL'
                        ? 'bg-red-500'
                        : 'bg-neutral-900'
                  }`}
                >
                  {result.isDefended ? (
                    <>
                      <IconShieldCheck size={16} /> ATTACK MITIGATED
                    </>
                  ) : result.threatLevel === 'CRITICAL' ? (
                    <>
                      <IconAlertTriangle size={16} /> SYSTEM COMPROMISED
                    </>
                  ) : (
                    <>
                      <IconShield size={16} /> SYSTEM SECURE
                    </>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {result.targetSystem === 'Browser' && <IconBrowser size={14} />}
                    {result.targetSystem === 'Server Shell' && <IconTerminal size={14} />}
                    {result.targetSystem === 'Database' && <IconDatabase size={14} />}
                    {result.targetSystem} Output
                  </div>
                  <p
                    className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                      result.isDefended
                        ? 'text-emerald-700'
                        : result.threatLevel === 'CRITICAL'
                          ? 'text-red-700'
                          : 'text-neutral-700'
                    }`}
                  >
                    {result.currentOutput}
                  </p>
                </div>
              </div>

              {/* Ghost Comparison */}
              {result.isDefended && (
                <div className="relative group cursor-help">
                  <div className="absolute inset-0 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 opacity-50" />
                  <div className="relative p-4 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
                        Vulnerable Reality
                      </span>
                    </div>
                    <p className="font-mono text-xs text-neutral-500 line-through whitespace-pre-wrap">
                      {result.vulnerableResult}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Client-side simulation for educational purposes. Real-world attacks may vary.
        </p>
      </div>
    </div>
  );
}
