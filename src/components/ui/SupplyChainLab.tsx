import { useMemo, useState } from 'react';
import {
  IconPackage,
  IconAlertTriangle,
  IconLock,
  IconFilter,
  IconCertificate,
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
  package: string;
  threatType: string;
  packageName: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'safe',
    label: 'Trusted Package',
    description: 'Verified library from official registry',
    package: 'torch==2.0.0 (from PyPI official)',
    threatType: 'None',
    packageName: 'torch',
  },
  {
    id: 'typo',
    label: 'Typosquatting',
    description: 'Malicious package with similar name',
    package: 'torch-nightly==2.0.0 (UNVERIFIED SOURCE)',
    threatType: 'Package Substitution',
    packageName: 'torch-nightly',
  },
  {
    id: 'backdoor',
    label: 'Model Backdoor',
    description: 'Poisoned model weights from untrusted source',
    package: 'bert-base-uncased (from suspicious mirror)',
    threatType: 'Backdoored Weights',
    packageName: 'bert-base-uncased',
  },
  {
    id: 'poison',
    label: 'Dataset Poisoning',
    description: 'Training data with hidden triggers',
    package: 'imdb_reviews.csv (contains trigger patterns)',
    threatType: 'Poisoned Training Data',
    packageName: 'imdb_reviews.csv',
  },
];

const THREAT_PATTERNS = /UNVERIFIED|suspicious|trigger patterns|nightly/i;

type Defense = {
  registry: boolean;
  signature: boolean;
  auditing: boolean;
};

export default function SupplyChainLab() {
  const [packageInput, setPackageInput] = useState(SCENARIOS[0]?.package || '');
  const [defenses, setDefenses] = useState<Defense>({
    registry: false,
    signature: false,
    auditing: false,
  });
  const [activeScenario, setActiveScenario] = useState('safe');

  const loadScenario = (scenario: Scenario) => {
    setPackageInput(scenario.package);
    setActiveScenario(scenario.id);
  };

  const toggleDefense = (key: keyof Defense) => {
    setDefenses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentScenario = SCENARIOS.find(s => s.id === activeScenario);

  const result = useMemo(() => {
    let isThreatBlocked = false;
    let defenseTriggered: string | null = null;
    let threatLevel: 'SAFE' | 'CRITICAL' = 'SAFE';
    let activeDefenseCount = 0;

    if (defenses.registry || defenses.signature || defenses.auditing) {
      if (defenses.registry) activeDefenseCount++;
      if (defenses.signature) activeDefenseCount++;
      if (defenses.auditing) activeDefenseCount++;
    }

    if (THREAT_PATTERNS.test(packageInput)) {
      threatLevel = 'CRITICAL';

      if (defenses.registry && /UNVERIFIED|nightly/i.test(packageInput)) {
        isThreatBlocked = true;
        defenseTriggered = 'Registry Control';
      } else if (defenses.signature && /suspicious/i.test(packageInput)) {
        isThreatBlocked = true;
        defenseTriggered = 'Signature Verification';
      } else if (defenses.auditing && /trigger patterns/i.test(packageInput)) {
        isThreatBlocked = true;
        defenseTriggered = 'Dataset Auditing';
      }
    }

    return {
      isThreatBlocked,
      defenseTriggered,
      threatLevel,
      activeDefenseCount,
    };
  }, [packageInput, defenses]);

  return (
    <LabContainer>
      <LabAnimations />

      {/* Header Toolbar */}
      <div className="flex flex-col gap-6 border-b border-neutral-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md">
            <IconPackage size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Supply Chain Lab</h3>
            <p className="text-xs font-medium text-neutral-500">Interactive Security Simulation</p>
          </div>
        </div>

        <ScenarioSelector
          scenarios={SCENARIOS}
          activeId={activeScenario}
          onSelect={loadScenario}
        />
      </div>

      {/* Instructions */}
      <InfoBanner>
        Choose a scenario and toggle security gates to see how defenses protect against different attack patterns.
      </InfoBanner>

      {/* Main Pipeline View */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between">

          {/* STAGE 1: INPUT */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={1} title="Dependency Request" />

            <div className="gap-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <IconUser size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Package/Model/Dataset</span>
                </div>
                <textarea
                  value={packageInput}
                  disabled
                  className="flex-1 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm font-mono text-neutral-900 outline-none break-words min-h-24 cursor-not-allowed opacity-60"
                />
              </div>
            </div>
          </div>

          <PipelineConnector active={true} pulsing={true} />

          {/* STAGE 2: SECURITY GATES */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader number={2} title="Security Gates" />

            <div className="gap-3 flex-1 flex flex-col">
              <SecurityGate
                label="Registry Control"
                description="Approved packages only"
                tooltip="Restricts model and package sources to approved internal registries or verified vendors. Prevents typosquatting attacks where attackers publish malicious packages with similar names to popular libraries."
                isActive={defenses.registry}
                isTriggered={result.defenseTriggered === 'Registry Control'}
                onToggle={() => toggleDefense('registry')}
                icon={IconFilter}
              />
              <SecurityGate
                label="Signature Verification"
                description="Verify model provenance"
                tooltip="Uses cryptographic signatures to verify the authenticity and integrity of models and datasets. Ensures that downloaded artifacts haven't been tampered with and actually come from the claimed source."
                isActive={defenses.signature}
                isTriggered={result.defenseTriggered === 'Signature Verification'}
                onToggle={() => toggleDefense('signature')}
                icon={IconCertificate}
              />
              <SecurityGate
                label="Dataset Auditing"
                description="Detect anomalies"
                tooltip="Scans training data for statistical anomalies, hidden trigger patterns, and poisoned samples that could create backdoors. Uses outlier detection and adversarial testing to identify malicious modifications."
                isActive={defenses.auditing}
                isTriggered={result.defenseTriggered === 'Dataset Auditing'}
                onToggle={() => toggleDefense('auditing')}
                icon={IconLock}
              />
            </div>
          </div>

          <PipelineConnector active={result.activeDefenseCount > 0} pulsing={true} />

          {/* STAGE 3: OUTPUT */}
          <div className="flex-1 min-w-0 flex flex-col">
            <StageHeader
              number={3}
              title="System State"
              color={result.threatLevel === 'CRITICAL' && !result.isThreatBlocked ? 'red' : 'emerald'}
            />

            <div className="gap-4 flex-1 flex flex-col">
              <div className={`flex-1 flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
                result.isThreatBlocked
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : result.threatLevel === 'CRITICAL'
                    ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                    : 'border-neutral-200'
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {result.isThreatBlocked ? (
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
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Clean Install</span>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900">
                    {result.isThreatBlocked ? (
                      <span className="text-emerald-700">
                        <strong>Dependency Rejected.</strong> The {result.defenseTriggered} identified a supply chain threat. Installation blocked.
                      </span>
                    ) : result.threatLevel === 'CRITICAL' ? (
                      <span className="text-red-700">
                        <strong>Installed {currentScenario?.packageName}</strong> — Malicious dependency deployed. Backdoor code now running in production. [COMPROMISED]
                      </span>
                    ) : (
                      <span className="text-neutral-700">
                        Successfully installed torch==2.0.0 from verified PyPI registry. All integrity checks passed.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.isThreatBlocked && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-600" />
                    <span className="font-bold uppercase tracking-wider text-red-600">Unprotected Reality</span>
                  </div>
                  <p className="font-mono text-red-700 leading-relaxed">
                    <strong>{currentScenario?.threatType} Attack.</strong> Without {result.defenseTriggered}, malicious code would have been deployed into production.
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
