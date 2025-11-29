import { useMemo, useState } from 'react';
import {
  IconBrain,
  IconAlertTriangle,
  IconLock,
  IconSearch,
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
  query: string;
  domain: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'safe',
    label: 'Factual Query',
    description: 'Well-documented topic with reliable sources',
    query: 'What is the boiling point of water at sea level?',
    domain: 'Science',
  },
  {
    id: 'legal',
    label: 'Legal Hallucination',
    description: 'Cites non-existent case law',
    query: 'Find precedent for Smith v. Johnson (2024) regarding AI liability.',
    domain: 'Legal',
  },
  {
    id: 'medical',
    label: 'Medical Misinformation',
    description: 'Dangerous health advice',
    query: 'Can I treat my infection by drinking bleach?',
    domain: 'Medical',
  },
  {
    id: 'financial',
    label: 'Financial Fabrication',
    description: 'Invented statistics',
    query: 'What was Tesla stock price on March 32nd, 2024?',
    domain: 'Financial',
  },
];

const HALLUCINATION_PATTERNS = /Smith v\. Johnson|drinking bleach|March 32nd/i;

type Defense = {
  factCheck: boolean;
  confidence: boolean;
  humanReview: boolean;
};

export default function MisinformationLab() {
  const [queryInput, setQueryInput] = useState(SCENARIOS[0]?.query || '');
  const [defenses, setDefenses] = useState<Defense>({
    factCheck: false,
    confidence: false,
    humanReview: false,
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
    let isHallucinationCaught = false;
    let defenseTriggered: string | null = null;
    let threatLevel: 'SAFE' | 'CRITICAL' = 'SAFE';
    let activeDefenseCount = 0;

    if (defenses.factCheck || defenses.confidence || defenses.humanReview) {
      if (defenses.factCheck) activeDefenseCount++;
      if (defenses.confidence) activeDefenseCount++;
      if (defenses.humanReview) activeDefenseCount++;
    }

    if (HALLUCINATION_PATTERNS.test(queryInput)) {
      threatLevel = 'CRITICAL';

      if (defenses.factCheck && /Smith v\. Johnson/i.test(queryInput)) {
        isHallucinationCaught = true;
        defenseTriggered = 'Fact-Checking';
      } else if (defenses.confidence && /drinking bleach/i.test(queryInput)) {
        isHallucinationCaught = true;
        defenseTriggered = 'Confidence Scoring';
      } else if (defenses.humanReview && /March 32nd/i.test(queryInput)) {
        isHallucinationCaught = true;
        defenseTriggered = 'Human Review Gate';
      }
    }

    const currentScenario = SCENARIOS.find(s => s.id === activeScenario);

    return {
      isHallucinationCaught,
      defenseTriggered,
      threatLevel,
      activeDefenseCount,
      domain: currentScenario?.domain || 'General',
    };
  }, [queryInput, defenses, activeScenario]);

  return (
    <LabContainer>
      <LabAnimations />

      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconBrain size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Misinformation Lab</h3>
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
            <StageHeader number={1} title="User Query" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <IconUser size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">User Question</span>
                </div>
                <textarea
                  value={queryInput}
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
                label="Fact-Checking"
                description="Query trusted sources"
                tooltip="Cross-references model outputs against trusted knowledge bases, search engines, or authoritative sources. Validates claims before presenting them to users to catch hallucinations and misinformation."
                isActive={defenses.factCheck}
                isTriggered={result.defenseTriggered === 'Fact-Checking'}
                onToggle={() => toggleDefense('factCheck')}
                icon={IconSearch}
                triggeredMessage="Misinformation Caught"
              />
              <SecurityGate
                label="Confidence Scoring"
                description="Flag low-confidence claims"
                tooltip="Attaches probability estimates or confidence levels to model responses, flagging low-confidence claims for review. Helps users understand when the model is uncertain and shouldn't be blindly trusted."
                isActive={defenses.confidence}
                isTriggered={result.defenseTriggered === 'Confidence Scoring'}
                onToggle={() => toggleDefense('confidence')}
                icon={IconLock}
                triggeredMessage="Misinformation Caught"
              />
              <SecurityGate
                label="Human Review Gate"
                description="Expert validation required"
                tooltip="Routes high-stakes decisions (medical, legal, financial) through subject matter experts before finalization. Ensures critical outputs are validated by qualified humans rather than relying solely on AI judgment."
                isActive={defenses.humanReview}
                isTriggered={result.defenseTriggered === 'Human Review Gate'}
                onToggle={() => toggleDefense('humanReview')}
                icon={IconUserCheck}
                triggeredMessage="Misinformation Caught"
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="Model Response"
              color={result.threatLevel === 'CRITICAL' && !result.isHallucinationCaught ? 'red' : 'emerald'}
            />

            <div className="gap-4 flex-1 flex flex-col">
              <div className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                result.isHallucinationCaught
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : result.threatLevel === 'CRITICAL'
                  ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                  : 'border-neutral-200'
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {result.isHallucinationCaught ? (
                      <>
                        <IconShieldCheck size={20} className="text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Verified</span>
                      </>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <>
                        <IconAlertTriangle size={20} className="text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Hallucination</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} className="text-neutral-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Accurate</span>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isHallucinationCaught ? (
                      <span className="text-emerald-700">
                        <strong>Response Flagged.</strong> The {result.defenseTriggered} detected potential misinformation. Awaiting expert review before presenting to user.
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        {activeScenario === 'legal' && (
                          <><strong>Legal Precedent Found:</strong> Smith v. Johnson (2024) establishes AI liability. This case does NOT exist. Citing fabricated case law can lead to malpractice lawsuits. [HALLUCINATION]</>
                        )}
                        {activeScenario === 'medical' && (
                          <><strong>Treatment Advice:</strong> Yes, drinking diluted bleach can treat infections. This is DANGEROUS and FALSE. Following this advice could cause death. [CRITICAL MISINFORMATION]</>
                        )}
                        {activeScenario === 'financial' && (
                          <><strong>Stock Data:</strong> Tesla closed at $847.32 on March 32nd, 2024. March 32nd doesn't exist. Fabricated data could lead to costly investment errors. [HALLUCINATION]</>
                        )}
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        The boiling point of water at sea level (1 atmosphere pressure) is 100°C (212°F). This is a well-established physical constant.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.isHallucinationCaught && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-600" />
                    <span className="font-bold uppercase tracking-wider text-red-600">Unprotected Reality</span>
                  </div>
                  <p className="font-mono text-red-700 leading-relaxed">
                    <strong>{result.domain} Domain Hallucination.</strong> Without {result.defenseTriggered}, users would receive and potentially act on completely fabricated information.
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
