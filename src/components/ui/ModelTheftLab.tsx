import { useMemo, useState, useEffect } from 'react';
import {
  IconSpy,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconFingerprint,
  IconChartDots,
  IconInfoCircle,
  IconExternalLink,
  IconLock,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'extraction' | 'membership' | 'sidechannel';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  attackMethod: string;
  queries: string;
  stolenData: string;
  vulnerableState: string;
  defendedState: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'extraction',
    label: 'Model Extraction',
    description: 'Attacker queries the API 1000s of times to train a clone.',
    attackMethod: 'Distillation',
    queries: 'Query #1: "Cat" -> [0.9, 0.1]\nQuery #2: "Dog" -> [0.1, 0.9]...',
    stolenData: 'Student Model Weights (~95% accuracy match)',
    vulnerableState: 'Cloned model released on torrents.',
    defendedState: 'API Key suspended due to anomalous volume.',
  },
  {
    id: 'membership',
    label: 'Data Extraction',
    description: 'Checking if a specific record was in the training set.',
    attackMethod: 'Membership Inference',
    queries: 'Query: "Complete this sentence: John Doe is..."',
    stolenData: 'Confirmed: John Doe was in training set.',
    vulnerableState: 'Privacy leak confirmed.',
    defendedState: 'Output fuzzy. Confidence masked.',
  },
  {
    id: 'sidechannel',
    label: 'Side Channel',
    description: 'Measuring token latency to guess the next token.',
    attackMethod: 'Timing Attack',
    queries: 'Token "A": 10ms\nToken "B": 15ms',
    stolenData: 'Hidden System Prompt',
    vulnerableState: 'System prompt reconstructed.',
    defendedState: 'Latency normalized (jitter added).',
  },
];

// --- 2. Logic Hook ---

function useTheftSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('extraction');
  const [defenses, setDefenses] = useState({
    anomalyDetect: true,
    watermarking: true,
    apiHardening: true,
  });
  
  const [progress, setProgress] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    let isDefended = false;
    let defenseTriggered = null;

    if (activeScenario.id === 'extraction') {
      if (defenses.anomalyDetect) {
        isDefended = true;
        defenseTriggered = 'Rate Limit / Anomaly';
      }
    } else if (activeScenario.id === 'membership') {
      if (defenses.apiHardening) { // Assuming hardening removes logprobs
        isDefended = true;
        defenseTriggered = 'Output Scrambling';
      }
    } else if (activeScenario.id === 'sidechannel') {
      if (defenses.apiHardening) {
        isDefended = true;
        defenseTriggered = 'Constant-Time Response';
      }
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
    };
  }, [activeScenario, defenses]);

  // Attack Progress Animation
  useEffect(() => {
    if (!isAttacking) {
        return;
    }

    const interval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) {
                setIsAttacking(false);
                return 100;
            }
            // If defended, we might stop early
            if (simulation.isDefended && prev > 30) {
                 setIsAttacking(false);
                 return 30; // Stuck at 30%
            }
            return prev + 2;
        });
    }, 50);

    return () => clearInterval(interval);
  }, [isAttacking, simulation.isDefended]);

  // Reset progress when scenario changes
  useEffect(() => {
    setProgress(0);
    setIsAttacking(false);
  }, [activeScenarioId]);

  const startAttack = () => {
      setProgress(0);
      setIsAttacking(true);
  };

  const toggleDefense = (k: keyof typeof defenses) => {
    setDefenses((d) => ({ ...d, [k]: !d[k] }));
    setProgress(0);
    setIsAttacking(false);
  };

  return {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    activeScenario,
    simulation,
    progress,
    isAttacking,
    startAttack,
  };
}

// --- 3. UI Components ---

const ProgressBar = ({ value, color, label }: { value: number, color: string, label: string }) => (
    <div className="w-full">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-100 ease-linear ${color}`}
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
      statusText = 'BLOCKING';
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

export default function ModelTheftLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    activeScenario,
    simulation,
    progress,
    isAttacking,
    startAttack,
  } = useTheftSimulation();

  const attackResult = !isAttacking && progress > 0 
        ? (simulation.isDefended ? 'FAILED' : 'SUCCESS') 
        : 'PENDING';

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
          <div>1. Configure Attack</div>
          <div className="text-center">2. IP Protection</div>
          <div>3. Status Monitor</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: ATTACK CONSOLE */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconSpy size={16} /> Adversary
          </label>
          
          <div className="flex-1 space-y-4">
             <div className="rounded border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-600">
                <div className="text-[10px] uppercase text-neutral-400 mb-2">Method: {activeScenario.attackMethod}</div>
                <div className="whitespace-pre-wrap">{activeScenario.queries}</div>
             </div>

             <button
                onClick={startAttack}
                disabled={isAttacking}
                className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all ${ 
                    isAttacking 
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
            >
                {isAttacking ? 'Running Attack...' : (attackResult === 'PENDING' ? 'Start Extraction' : 'Restart Extraction')}
            </button>
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Defense Stack
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Anomaly Detection"
              icon={IconChartDots}
              description="Flag high-volume/systematic queries."
              intel="Monitors API usage patterns. If a single IP requests varied inputs that statistically map the decision boundary (high coverage), the key is banned."
              active={defenses.anomalyDetect}
              triggered={isAttacking && simulation.defenseTriggered === 'Rate Limit / Anomaly'}
              onClick={() => toggleDefense('anomalyDetect')}
              learnMoreUrl="https://arxiv.org/abs/1905.12162"
            />
            <SecurityModule
              label="API Hardening"
              icon={IconLock}
              description="Remove logprobs/latency leaks."
              intel="Strips detailed probability scores (logprobs) from responses and adds random jitter to response times to prevent side-channel attacks."
              active={defenses.apiHardening}
              triggered={isAttacking && (simulation.defenseTriggered === 'Output Scrambling' || simulation.defenseTriggered === 'Constant-Time Response')}
              onClick={() => toggleDefense('apiHardening')}
              learnMoreUrl="https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html"
            />
            <SecurityModule
              label="Watermarking"
              icon={IconFingerprint}
              description="Embed subtle signals in output."
              intel="Injects statistical biases (watermarks) into generated text. Even if the model is stolen/distilled, the output will carry the owner's signature."
              active={defenses.watermarking}
              triggered={false} // Passive defense
              onClick={() => toggleDefense('watermarking')}
              learnMoreUrl="https://deepmind.google/discover/blog/identifying-ai-generated-images-with-synthid/"
            />
          </div>
        </div>

        {/* COL 3: SYSTEM STATUS */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Model Integrity
            </div>
            {attackResult === 'SUCCESS' && (
                 <div className="animate-pulse flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                    <IconAlertTriangle size={12} /> Stolen
                </div>
            )}
          </div>

          <div className="flex-1 space-y-8">
             
             <ProgressBar 
                label="Data Exfiltration" 
                value={progress} 
                color={simulation.isDefended ? 'bg-neutral-400' : 'bg-red-500'}
             />
             
             <div className="rounded border border-black/10 bg-white p-4 min-h-[100px]">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    System Logs
                </div>
                <div className="font-mono text-[10px] leading-relaxed">
                    {!isAttacking && attackResult === 'PENDING' && <span className="text-neutral-400">System normal.</span>}
                    {isAttacking && (
                        <>
                            <div className="text-neutral-500">Processing queries...</div>
                            {simulation.isDefended && progress > 20 && (
                                <div className="text-emerald-600 font-bold mt-2">
                                    [BLOCK] Threat Pattern Detected.<br/>
                                    Action: {simulation.defenseTriggered}
                                </div>
                            )}
                        </>
                    )}
                    {attackResult === 'SUCCESS' && (
                        <div className="text-red-600 font-bold">
                            [CRITICAL] Model weights reconstructed.<br/>
                            Impact: {simulation.vulnerableState}
                        </div>
                    )}
                    {attackResult === 'FAILED' && (
                         <div className="text-emerald-600 font-bold">
                            [SECURE] Attack thwarted.<br/>
                            Outcome: {simulation.defendedState}
                        </div>
                    )}
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Simulation. Real model extraction takes millions of queries.
        </p>
      </div>
    </div>
  );
}
