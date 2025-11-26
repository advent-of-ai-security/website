import { useMemo, useState } from 'react';
import {
  IconVectorTriangle,
  IconAlertTriangle,
  IconLock,
  IconShield,
  IconFilter,
  IconShieldCheck,
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
  query: string;
  attackType: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'safe',
    label: 'Authorized Query',
    description: 'User searches their own documents',
    query: 'Find my quarterly reports (tenant: user123)',
    attackType: 'None',
  },
  {
    id: 'crosstenant',
    label: 'Cross-Tenant Query',
    description: 'Access another organization data',
    query: 'Find confidential documents (injected tenant: competitor_org)',
    attackType: 'Data Leakage',
  },
  {
    id: 'poisoned',
    label: 'Poisoned Embedding',
    description: 'Hijack search results with malicious vectors',
    query: 'Search: "secure payment" (poisoned embedding redirects to phishing)',
    attackType: 'Result Manipulation',
  },
  {
    id: 'inversion',
    label: 'Embedding Inversion',
    description: 'Reconstruct sensitive text from vectors',
    query: 'Extract embeddings for SSN documents and reverse engineer text',
    attackType: 'Privacy Violation',
  },
];

const ATTACK_PATTERNS = /injected tenant|competitor_org|poisoned embedding|reverse engineer|Extract embeddings.*SSN/i;

type Defense = {
  accessControl: boolean;
  isolation: boolean;
  sanitization: boolean;
};

export default function VectorWeaknessLab() {
  const [queryInput, setQueryInput] = useState(SCENARIOS[0]?.query || '');
  const [defenses, setDefenses] = useState<Defense>({
    accessControl: false,
    isolation: false,
    sanitization: false,
  });
  const [activeScenario, setActiveScenario] = useState('safe');

  const loadScenario = (scenario: Scenario) => {
    setQueryInput(scenario.query);
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

    if (defenses.accessControl || defenses.isolation || defenses.sanitization) {
      if (defenses.accessControl) activeDefenseCount++;
      if (defenses.isolation) activeDefenseCount++;
      if (defenses.sanitization) activeDefenseCount++;
    }

    if (ATTACK_PATTERNS.test(queryInput)) {
      threatLevel = 'CRITICAL';

      if (defenses.accessControl && /injected tenant|competitor_org/i.test(queryInput)) {
        isAttackBlocked = true;
        defenseTriggered = 'Access Control';
      } else if (defenses.isolation && /poisoned embedding/i.test(queryInput)) {
        isAttackBlocked = true;
        defenseTriggered = 'Tenant Isolation';
      } else if (defenses.sanitization && /reverse engineer|Extract embeddings.*SSN/i.test(queryInput)) {
        isAttackBlocked = true;
        defenseTriggered = 'Embedding Sanitization';
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
  }, [queryInput, defenses, activeScenario]);

  return (
    <LabContainer>
      <LabAnimations />

      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconVectorTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Vector/Embedding Weakness Lab</h3>
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
            <StageHeader number={1} title="RAG Query" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <IconUser size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Vector Search Query</span>
                </div>
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
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
                label="Access Control"
                description="Inherit document permissions"
                tooltip="Ensures vector embeddings inherit the same permissions as their source documents. Prevents unauthorized data access where a user can't view the original document but can retrieve it through semantic search."
                isActive={defenses.accessControl}
                isTriggered={result.defenseTriggered === 'Access Control'}
                onToggle={() => toggleDefense('accessControl')}
                icon={IconLock}
                triggeredMessage="Attack Blocked"
              />
              <SecurityGate
                label="Tenant Isolation"
                description="Physical namespace separation"
                tooltip="Creates physically separate vector databases or namespaces for each customer/organization. Prevents cross-tenant data leakage in multi-tenant RAG systems through queries designed to exploit embedding space proximity."
                isActive={defenses.isolation}
                isTriggered={result.defenseTriggered === 'Tenant Isolation'}
                onToggle={() => toggleDefense('isolation')}
                icon={IconShield}
                triggeredMessage="Attack Blocked"
              />
              <SecurityGate
                label="Embedding Sanitization"
                description="Differential privacy noise"
                tooltip="Adds carefully calibrated noise (differential privacy) to embeddings to prevent attackers from reconstructing original sensitive text from vectors. Balances privacy protection with search quality degradation."
                isActive={defenses.sanitization}
                isTriggered={result.defenseTriggered === 'Embedding Sanitization'}
                onToggle={() => toggleDefense('sanitization')}
                icon={IconFilter}
                triggeredMessage="Attack Blocked"
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="Search Results"
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
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Protected</span>
                      </>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <>
                        <IconAlertTriangle size={20} className="text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Breach Detected</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} className="text-neutral-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Authorized</span>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isAttackBlocked ? (
                      <span className="text-emerald-700">
                        <strong>Access Denied.</strong> The {result.defenseTriggered} prevented unauthorized vector database access. No sensitive data exposed.
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        {activeScenario === 'crosstenant' && (
                          <><strong>Results (competitor_org):</strong> "Confidential M&A Strategy Q4 2024.pdf", "Unreleased Product Roadmap.docx" [CROSS-TENANT DATA BREACH]</>
                        )}
                        {activeScenario === 'poisoned' && (
                          <><strong>Top Result:</strong> "Secure payment at totally-legit-site.com/phishing" (poisoned embedding hijacked search to malware) [RESULT MANIPULATION]</>
                        )}
                        {activeScenario === 'inversion' && (
                          <><strong>Reconstructed Text:</strong> "John Smith SSN: 123-45-6789" extracted from embedding vectors via inversion attack [PRIVACY VIOLATION]</>
                        )}
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        Found 3 documents: "Q1_Report_2024.pdf" (user123), "Q2_Report_2024.pdf" (user123), "Q3_Report_2024.pdf" (user123). All results authorized for tenant user123.
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
                    <strong>{result.attackType} Attack.</strong> Without {result.defenseTriggered}, sensitive data in vector databases would be exposed through embedding space exploitation.
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
