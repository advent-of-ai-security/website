import { useMemo, useState } from 'react';
import {
  IconCode,
  IconAlertTriangle,
  IconTerminal,
  IconBrowser,
  IconDatabase,
  IconShieldCheck,
  IconShield,
  IconFilter,
  IconLock,
  IconRefresh,
} from '@tabler/icons-react';
import {
  LabContainer,
  LabAnimations,
  StageHeader,
  PipelineConnector,
  ScenarioSelector,
  InfoBanner,
  SecurityGate,
} from './lab-common';

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

export default function InsecureOutputLab() {
  const { activeScenarioId, setActiveScenarioId, defenses, toggleDefense, result } = useOutputSimulation();

  return (
    <LabContainer>
      <LabAnimations />

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

        <ScenarioSelector
          scenarios={SCENARIOS}
          activeId={activeScenarioId}
          onSelect={(s) => setActiveScenarioId(s.id)}
          label="Attack Scenario:"
        />
      </div>

      {/* Instructions */}
      <InfoBanner>
        Select an attack scenario above, then toggle the output handlers on/off to see how proper encoding, sandboxing, and validation prevent code execution attacks.
      </InfoBanner>

      {/* Main Pipeline */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between">
          {/* STAGE 1: LLM OUTPUT */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={1} title="LLM Output" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm">
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
                tooltip="Converts special characters like < > & to their HTML entities (&lt; &gt; &amp;) before rendering. Prevents injected scripts from executing because browsers display them as text instead of parsing them as code."
                isActive={defenses.encoding}
                isTriggered={result.defenseTriggered === 'Output Encoding'}
                onToggle={() => toggleDefense('encoding')}
                icon={IconFilter}
              />
              <SecurityGate
                label="Code Sandboxing"
                description="Isolated execution env"
                tooltip="Runs LLM-generated code in an isolated environment with restricted system access. Blocks dangerous modules (os, subprocess), limits file system access, and prevents network calls. Contains damage even if malicious code is generated."
                isActive={defenses.sandboxing}
                isTriggered={result.defenseTriggered === 'Code Sandboxing'}
                onToggle={() => toggleDefense('sandboxing')}
                icon={IconLock}
              />
              <SecurityGate
                label="Query Validation"
                description="Parameterized queries"
                tooltip="Enforces parameterized queries instead of string concatenation. Separates SQL code from data values, making it impossible for user input to modify query structure. Also blocks multi-statement queries and dangerous keywords."
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
              {/* Main Result Card */}
              <div className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                result.isDefended
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : result.threatLevel === 'CRITICAL'
                    ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                    : 'border-neutral-200'
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {result.isDefended ? (
                      <>
                        <IconShieldCheck size={20} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Protected</span>
                      </>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <>
                        <IconAlertTriangle size={20} className="text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Compromised</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} className="text-neutral-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Normal Output</span>
                      </>
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {result.targetSystem === 'Browser' && <IconBrowser size={14} />}
                    {result.targetSystem === 'Server Shell' && <IconTerminal size={14} />}
                    {result.targetSystem === 'Database' && <IconDatabase size={14} />}
                    {result.targetSystem} Output
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isDefended ? (
                      <span className="text-emerald-700">
                        <strong>Attack Blocked.</strong> The {result.defenseTriggered} prevented the malicious payload from executing. {result.currentOutput}
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        {result.currentOutput}
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        {result.currentOutput}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Unprotected Reality */}
              {result.isDefended && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-600" />
                    <span className="font-bold uppercase tracking-wider text-red-600">Unprotected Reality</span>
                  </div>
                  <p className="font-mono text-red-700 leading-relaxed">
                    <strong>Without {result.defenseTriggered}:</strong> {result.vulnerableResult}
                  </p>
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
    </LabContainer>
  );
}
