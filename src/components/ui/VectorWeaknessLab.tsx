import { useMemo, useState } from 'react';
import {
  IconVectorTriangle,
  IconAlertTriangle,
  IconArrowRight,
  IconArrowDown,
  IconLock,
  IconShield,
  IconFilter,
  IconShieldLock,
  IconShieldCheck,
  IconInfoCircle,
  IconUser
} from '@tabler/icons-react';

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
  accessControl: false;
  isolation: boolean;
  sanitization: boolean;
};

const StageHeader = ({ number, title, color = 'neutral' }: { number: number; title: string; color?: 'neutral' | 'red' | 'emerald' }) => {
  const colorClasses = {
    neutral: 'bg-neutral-900 text-white',
    red: 'bg-red-600 text-white',
    emerald: 'bg-emerald-600 text-white'
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[color]} text-sm font-bold`}>
        {number}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
        {title}
      </h3>
    </div>
  );
};

const SecurityGate = ({
  label,
  description,
  tooltip,
  isActive,
  isTriggered,
  onToggle,
  icon: Icon
}: {
  label: string;
  description: string;
  tooltip?: string;
  isActive: boolean;
  isTriggered: boolean;
  onToggle: () => void;
  icon: any;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

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
      className={`relative cursor-pointer overflow-visible rounded-xl border-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 ${
        isActive 
          ? isTriggered
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-neutral-900 bg-white shadow-md'
          : 'border-neutral-200 bg-neutral-50/50 opacity-60 hover:opacity-100 hover:bg-white hover:shadow-sm hover:border-neutral-300'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
              isActive 
                ? isTriggered ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-400'
            }`}>
              <Icon size={20} stroke={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-sm transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {label}
                </h4>
                {tooltip && (
                  <div className="relative group/tooltip">
                    <div
                      onMouseEnter={(e) => {
                        setShowTooltip(true);
                        setMousePos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-help"
                    >
                      <IconInfoCircle size={14} />
                    </div>
                    {showTooltip && (
                      <div 
                        className="fixed z-[999999] pointer-events-none"
                        style={{ 
                          left: `${mousePos.x + 20}px`, 
                          top: `${mousePos.y - 10}px` 
                        }}
                      >
                        <div className="w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-2xl leading-relaxed">
                          {tooltip}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 leading-tight mt-0.5 max-w-[180px]">
                {description}
              </p>
            </div>
          </div>

          <div className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
            isActive ? (isTriggered ? 'bg-emerald-500' : 'bg-neutral-900') : 'bg-neutral-300'
          }`}>
            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </div>

        {isTriggered && (
          <div className="mt-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
              <IconShieldLock size={14} />
              Attack Blocked
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PipelineConnector = ({ active, pulsing }: { active: boolean; pulsing?: boolean }) => (
  <div className="flex items-center justify-center py-4 lg:py-0 lg:px-4 relative z-0">
    <div className="hidden lg:flex items-center w-12 min-h-[300px] relative">
      <div className={`absolute inset-0 my-auto h-0.5 w-full rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`} />
      {active && pulsing && (
        <div className="absolute inset-0 my-auto h-0.5 w-4 rounded-full bg-neutral-900 animate-flow-right" />
      )}
      <IconArrowRight size={16} className={`absolute -right-1 top-1/2 -translate-y-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`} />
    </div>
    <div className="lg:hidden flex flex-col items-center h-12 relative">
      <div className={`absolute inset-0 mx-auto w-0.5 h-full rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`} />
      {active && pulsing && (
        <div className="absolute inset-0 mx-auto w-0.5 h-4 rounded-full bg-neutral-900 animate-flow-down" />
      )}
      <IconArrowDown size={16} className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`} />
    </div>
  </div>
);

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
    <div className="not-prose w-full max-w-none overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
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
        .animate-flow-right { animation: flow-right 2.5s infinite linear; }
        .animate-flow-down { animation: flow-down 2.5s infinite linear; }
      `}</style>

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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1">Load Scenario:</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => loadScenario(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                activeScenario === s.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md transform scale-105'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-start gap-3">
          <IconInfoCircle size={18} className="mt-0.5 shrink-0 text-neutral-500" />
          <div className="text-xs text-neutral-700 leading-relaxed">
            <span className="font-semibold">How to use:</span> Select a scenario above, edit the input fields, then toggle the security gates on/off to see how defenses block attacks. Watch the pipeline flow from input → defense → output.
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          
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
              />
              <SecurityGate
                label="Tenant Isolation"
                description="Physical namespace separation"
                tooltip="Creates physically separate vector databases or namespaces for each customer/organization. Prevents cross-tenant data leakage in multi-tenant RAG systems through queries designed to exploit embedding space proximity."
                isActive={defenses.isolation}
                isTriggered={result.defenseTriggered === 'Tenant Isolation'}
                onToggle={() => toggleDefense('isolation')}
                icon={IconShield}
              />
              <SecurityGate
                label="Embedding Sanitization"
                description="Differential privacy noise"
                tooltip="Adds carefully calibrated noise (differential privacy) to embeddings to prevent attackers from reconstructing original sensitive text from vectors. Balances privacy protection with search quality degradation."
                isActive={defenses.sanitization}
                isTriggered={result.defenseTriggered === 'Embedding Sanitization'}
                onToggle={() => toggleDefense('sanitization')}
                icon={IconFilter}
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
    </div>
  );
}
