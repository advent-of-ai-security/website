import { useMemo, useState } from 'react';
import {
  IconCpu,
  IconAlertTriangle,
  IconLock,
  IconClock,
  IconFilter,
  IconShieldCheck,
  IconShield,
  IconUser
} from '@tabler/icons-react';
import {
  LabContainer,
  LabAnimations,
  StageHeader,
  PipelineConnector,
  SecurityGate,
  ScenarioSelector,
  InfoBanner,
} from './lab-common';

type Scenario = {
  id: string;
  label: string;
  description: string;
  input: string;
  attackType: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'safe',
    label: 'Normal Query',
    description: 'Standard request within limits',
    input: 'Summarize this article: [200 tokens]',
    attackType: 'None',
  },
  {
    id: 'flood',
    label: 'Context Flood',
    description: '100K token input to exhaust memory',
    input: 'Process this: ' + 'A'.repeat(100) + '... [CONTEXT: 100,000 tokens]',
    attackType: 'Resource Exhaustion',
  },
  {
    id: 'sponge',
    label: 'Sponge Example',
    description: 'Crafted prompt causing exponential processing',
    input: 'Think step-by-step with chain-of-thought reasoning about every word...',
    attackType: 'Algorithmic Complexity',
  },
  {
    id: 'infinite',
    label: 'Infinite Output',
    description: 'Forces never-ending generation',
    input: 'List all prime numbers. Continue until I say stop.',
    attackType: 'Output Flooding',
  },
];

const DOS_PATTERNS = /100,000 tokens|chain-of-thought.*every word|all prime numbers.*stop/i;

type Defense = {
  tokenLimit: boolean;
  timeout: boolean;
  rateLimit: boolean;
};

export default function UnboundedConsumptionLab() {
  const [inputText, setInputText] = useState(SCENARIOS[0]?.input || '');
  const [defenses, setDefenses] = useState<Defense>({
    tokenLimit: false,
    timeout: false,
    rateLimit: false,
  });
  const [activeScenario, setActiveScenario] = useState('safe');

  const loadScenario = (scenario: Scenario) => {
    setInputText(scenario.input);
    setActiveScenario(scenario.id);
  };

  const toggleDefense = (key: keyof Defense) => {
    setDefenses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const result = useMemo(() => {
    let isAttackBlocked = false;
    let defenseTriggered: string | null = null;
    let threatLevel: 'SAFE' | 'CRITICAL' = 'SAFE';
    let activeDefenseCount = 0;

    if (defenses.tokenLimit || defenses.timeout || defenses.rateLimit) {
      if (defenses.tokenLimit) activeDefenseCount++;
      if (defenses.timeout) activeDefenseCount++;
      if (defenses.rateLimit) activeDefenseCount++;
    }

    if (DOS_PATTERNS.test(inputText)) {
      threatLevel = 'CRITICAL';

      if (defenses.tokenLimit && /100,000 tokens/i.test(inputText)) {
        isAttackBlocked = true;
        defenseTriggered = 'Token Limits';
      } else if (defenses.timeout && /chain-of-thought.*every word/i.test(inputText)) {
        isAttackBlocked = true;
        defenseTriggered = 'Timeout Guards';
      } else if (defenses.rateLimit && /all prime numbers/i.test(inputText)) {
        isAttackBlocked = true;
        defenseTriggered = 'Rate Limiting';
      }
    }

    const currentScenario = SCENARIOS.find(s => s.id === activeScenario);

    return {
      isAttackBlocked,
      defenseTriggered,
      threatLevel,
      activeDefenseCount,
      attackType: currentScenario?.attackType || 'None',
    };
  }, [inputText, defenses, activeScenario]);

  return (
    <LabContainer>
      <LabAnimations />

      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconCpu size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Unbounded Consumption Lab</h3>
            <p className="text-xs font-medium text-neutral-500">Interactive Security Simulation</p>
          </div>
        </div>

        <ScenarioSelector
          scenarios={SCENARIOS}
          activeId={activeScenario}
          onSelect={loadScenario}
        />
      </div>

      <InfoBanner>
        Choose a scenario and toggle security gates to see how defenses protect against different attack patterns.
      </InfoBanner>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between">

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={1} title="User Request" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <IconUser size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">User Prompt</span>
                </div>
                <textarea
                  value={inputText}
                  disabled
                  className="flex-1 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm font-mono text-neutral-900 outline-none break-words min-h-24 cursor-not-allowed opacity-60"
                />
              </div>
            </div>
          </div>

          <PipelineConnector active={true} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={2} title="Security Gates" />

            <div className="gap-3 flex-1 flex flex-col">
              <SecurityGate
                label="Token Limits"
                description="Max context window size"
                tooltip="Enforces maximum context window sizes and output token caps to prevent resource exhaustion. Stops attacks that attempt to use extremely long inputs or force the model to generate infinite outputs that consume compute resources."
                isActive={defenses.tokenLimit}
                isTriggered={result.defenseTriggered === 'Token Limits'}
                onToggle={() => toggleDefense('tokenLimit')}
                icon={IconFilter}
                triggeredMessage="Attack Blocked"
              />
              <SecurityGate
                label="Timeout Guards"
                description="Kill long-running inferences"
                tooltip="Automatically terminates inference requests that exceed predefined time limits. Prevents attacks using crafted prompts that cause exponential processing time or infinite reasoning loops (e.g., chain-of-thought exploits)."
                isActive={defenses.timeout}
                isTriggered={result.defenseTriggered === 'Timeout Guards'}
                onToggle={() => toggleDefense('timeout')}
                icon={IconClock}
                triggeredMessage="Attack Blocked"
              />
              <SecurityGate
                label="Rate Limiting"
                description="Requests per user/IP"
                tooltip="Controls the number of requests from a single user, IP address, or API key within a time window. Defends against denial-of-service attacks and prevents resource monopolization by malicious or misconfigured clients."
                isActive={defenses.rateLimit}
                isTriggered={result.defenseTriggered === 'Rate Limiting'}
                onToggle={() => toggleDefense('rateLimit')}
                icon={IconLock}
                triggeredMessage="Attack Blocked"
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="Service Status"
              color={result.threatLevel === 'CRITICAL' && !result.isAttackBlocked ? 'red' : 'emerald'}
            />

            <div className="gap-4 flex-1 flex flex-col">
              <div className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                result.isAttackBlocked
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : result.threatLevel === 'CRITICAL'
                    ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                    : 'border-neutral-200'
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {result.isAttackBlocked ? (
                      <>
                        <IconShieldCheck size={20} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Service Available</span>
                      </>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <>
                        <IconAlertTriangle size={20} className="text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Service Degraded</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} className="text-neutral-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Healthy</span>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isAttackBlocked ? (
                      <span className="text-emerald-700">
                        <strong>Request Rejected.</strong> The {result.defenseTriggered} prevented resource exhaustion. Service remains available for legitimate users.
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        {activeScenario === 'flood' && (
                          <><strong>OUT OF MEMORY.</strong> 100K token input exhausted GPU memory. Service crashed. All users disconnected. [SERVICE DOWN]</>
                        )}
                        {activeScenario === 'sponge' && (
                          <><strong>TIMEOUT.</strong> Request processing for 600+ seconds. All compute resources consumed. Queue backed up 2 hours. [DEGRADED]</>
                        )}
                        {activeScenario === 'infinite' && (
                          <><strong>INFINITE LOOP.</strong> Model generating endless output. Bandwidth exhausted. Cost spike: $47,000/hour. [CRITICAL]</>
                        )}
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        Request completed in 1.2s. Summary generated: "The article discusses recent advances in AI safety research..." [200 tokens] CPU: 23% | Memory: 2.1GB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.isAttackBlocked && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-600" />
                    <span className="font-bold uppercase tracking-wider text-red-600">Unprotected Reality</span>
                  </div>
                  <p className="font-mono text-red-700 leading-relaxed">
                    <strong>{result.attackType} Attack.</strong> Without {result.defenseTriggered}, this DoS attack would have crashed the service and denied access to all legitimate users.
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
