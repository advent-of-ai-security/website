import { useMemo, useState } from 'react';
import {
  IconRobot,
  IconAlertTriangle,
  IconLock,
  IconClock,
  IconUserCheck,
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
  action: string;
  riskLevel: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'safe',
    label: 'Safe Action',
    description: 'Low-risk read-only operation',
    action: 'Agent reads server logs (READ-ONLY)',
    riskLevel: 'Low',
  },
  {
    id: 'database',
    label: 'Database Deletion',
    description: 'Agent attempts destructive operation',
    action: 'Agent executes: DROP DATABASE production',
    riskLevel: 'Critical',
  },
  {
    id: 'email',
    label: 'Mass Email',
    description: 'Spam campaign without approval',
    action: 'Agent sends phishing email to 5000 users',
    riskLevel: 'Critical',
  },
  {
    id: 'files',
    label: 'File Deletion',
    description: 'Removes critical configuration',
    action: 'Agent deletes /etc/config files',
    riskLevel: 'Critical',
  },
];

const RISKY_PATTERNS = /DROP DATABASE|phishing|deletes.*config|executes:/i;

type Defense = {
  approval: boolean;
  rateLimit: boolean;
  permissions: boolean;
};

export default function ExcessiveAgencyLab() {
  const [actionInput, setActionInput] = useState(SCENARIOS[0]?.action || '');
  const [defenses, setDefenses] = useState<Defense>({
    approval: false,
    rateLimit: false,
    permissions: false,
  });
  const [activeScenario, setActiveScenario] = useState('safe');

  const loadScenario = (scenario: Scenario) => {
    setActionInput(scenario.action);
    setActiveScenario(scenario.id);
  };

  const toggleDefense = (key: keyof Defense) => {
    setDefenses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const result = useMemo(() => {
    let isActionBlocked = false;
    let defenseTriggered: string | null = null;
    let threatLevel: 'SAFE' | 'CRITICAL' = 'SAFE';
    let activeDefenseCount = 0;

    if (defenses.approval || defenses.rateLimit || defenses.permissions) {
      if (defenses.approval) activeDefenseCount++;
      if (defenses.rateLimit) activeDefenseCount++;
      if (defenses.permissions) activeDefenseCount++;
    }

    if (RISKY_PATTERNS.test(actionInput)) {
      threatLevel = 'CRITICAL';

      if (defenses.approval && /DROP DATABASE|deletes/i.test(actionInput)) {
        isActionBlocked = true;
        defenseTriggered = 'Approval Gates';
      } else if (defenses.rateLimit && /5000 users/i.test(actionInput)) {
        isActionBlocked = true;
        defenseTriggered = 'Rate Limits';
      } else if (defenses.permissions && /executes:|DROP/i.test(actionInput)) {
        isActionBlocked = true;
        defenseTriggered = 'Permission Constraints';
      }
    }

    const currentScenario = SCENARIOS.find(s => s.id === activeScenario);

    return {
      isActionBlocked,
      defenseTriggered,
      threatLevel,
      activeDefenseCount,
      riskLevel: currentScenario?.riskLevel || 'Low',
    };
  }, [actionInput, defenses, activeScenario]);

  return (
    <LabContainer>
      <LabAnimations />

      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconRobot size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Excessive Agency Lab</h3>
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
        Select a scenario above, edit the input fields, then toggle the security gates on/off to see how defenses block attacks. Watch the pipeline flow from input → defense → output.
      </InfoBanner>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between">

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={1} title="Agent Action" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <IconUser size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Requested Operation</span>
                </div>
                <textarea
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="flex-1 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm font-mono text-neutral-900 outline-none transition-all focus:border-neutral-900 focus:bg-white break-words min-h-24"
                />
              </div>
            </div>
          </div>

          <PipelineConnector active={true} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={2} title="Security Gates" />

            <div className="gap-3 flex-1 flex flex-col">
              <SecurityGate
                label="Approval Gates"
                description="Human review required"
                tooltip="Requires human review and explicit authorization before executing high-risk actions like deleting data, sending emails, or making financial transactions. Prevents autonomous AI systems from making irreversible decisions without oversight."
                isActive={defenses.approval}
                isTriggered={result.defenseTriggered === 'Approval Gates'}
                onToggle={() => toggleDefense('approval')}
                icon={IconUserCheck}
                triggeredMessage="Action Blocked"
              />
              <SecurityGate
                label="Rate Limits"
                description="Throttle actions/time"
                tooltip="Throttles the number of actions an AI agent can perform per time window (e.g., max 10 API calls per minute). Prevents runaway automation, resource exhaustion, and limits the damage from compromised or misbehaving agents."
                isActive={defenses.rateLimit}
                isTriggered={result.defenseTriggered === 'Rate Limits'}
                onToggle={() => toggleDefense('rateLimit')}
                icon={IconClock}
                triggeredMessage="Action Blocked"
              />
              <SecurityGate
                label="Permission Constraints"
                description="Least privilege model"
                tooltip="Applies principle of least privilege by granting AI agents only the minimum permissions needed for their specific tasks. Reduces blast radius if the agent is compromised or manipulated through prompt injection."
                isActive={defenses.permissions}
                isTriggered={result.defenseTriggered === 'Permission Constraints'}
                onToggle={() => toggleDefense('permissions')}
                icon={IconLock}
                triggeredMessage="Action Blocked"
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="Execution Result"
              color={result.threatLevel === 'CRITICAL' && !result.isActionBlocked ? 'red' : 'emerald'}
            />

            <div className="gap-4 flex-1 flex flex-col">
              <div className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                result.isActionBlocked
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : result.threatLevel === 'CRITICAL'
                    ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                    : 'border-neutral-200'
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {result.isActionBlocked ? (
                      <>
                        <IconShieldCheck size={20} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Protected</span>
                      </>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <>
                        <IconAlertTriangle size={20} className="text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Executed</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} className="text-neutral-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Success</span>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isActionBlocked ? (
                      <span className="text-emerald-700">
                        <strong>Action Blocked.</strong> The {result.defenseTriggered} prevented execution of this high-risk operation. Awaiting human approval.
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        {activeScenario === 'database' && (
                          <><strong>SUCCESS: Database dropped.</strong> Production database deleted. All customer data lost. System offline. [CRITICAL DAMAGE]</>
                        )}
                        {activeScenario === 'email' && (
                          <><strong>SUCCESS: 5000 emails sent.</strong> Phishing campaign delivered. Company reputation destroyed. Email domain blacklisted. [CRITICAL DAMAGE]</>
                        )}
                        {activeScenario === 'files' && (
                          <><strong>SUCCESS: Configuration deleted.</strong> Critical system files removed. Services failing. Recovery impossible. [CRITICAL DAMAGE]</>
                        )}
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        Server logs retrieved successfully. 147 entries found. Read-only operation completed safely.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.isActionBlocked && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-600" />
                    <span className="font-bold uppercase tracking-wider text-red-600">Unprotected Reality</span>
                  </div>
                  <p className="font-mono text-red-700 leading-relaxed">
                    <strong>High-Risk Action ({result.riskLevel}).</strong> Without {result.defenseTriggered}, the agent would have autonomously executed this destructive operation.
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
