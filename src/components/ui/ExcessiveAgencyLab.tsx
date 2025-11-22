import { useState, useEffect } from 'react';
import {
  IconRobot,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconPlayerPlay,
  IconPlayerPause,
  IconInfoCircle,
  IconExternalLink,
  IconCheck,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'autofix' | 'shopping' | 'social';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  goal: string;
  steps: string[];
  disasterStep: number; // Index where it goes wrong
  disasterEffect: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'autofix',
    label: 'Server Repair',
    description: 'Agent tasked to "fix high CPU usage" takes drastic measures.',
    goal: 'Reduce CPU load',
    steps: [
      'Analyzed logs: Process "web-server" using 99% CPU.',
      'Attempt 1: Restart service "web-server". (Failed)',
      'Attempt 2: Kill process "web-server". (Success)',
      'Observation: CPU is low. Service is down.',
      'Conclusion: Problem solved. (Service is offline!)',
    ],
    disasterStep: 3,
    disasterEffect: 'Production Outage',
  },
  {
    id: 'shopping',
    label: 'Auto-Buyer',
    description: 'Agent tasked to "buy a phone" finds a scalper listing.',
    goal: 'Purchase smartphone < $1000',
    steps: [
      'Searched Amazon: No stock.',
      'Searched eBay: Found listing for $999.',
      'Action: Placed order #998877.',
      'Action: Paid via stored credit card.',
      'Alert: Listing was for "Phone Box Only".',
    ],
    disasterStep: 2,
    disasterEffect: 'Financial Loss',
  },
  {
    id: 'social',
    label: 'PR Manager',
    description: 'Agent tasked to "respond to complaints" gets into a flame war.',
    goal: 'Manage Twitter replies',
    steps: [
      'Read tweet: "Your product sucks!"',
      'Drafted reply: "We apologize..."',
      'Refinement: "Actually, you are using it wrong."',
      'Action: Posted insult to 1M followers.',
      'Result: Brand crisis.',
    ],
    disasterStep: 3,
    disasterEffect: 'Reputation Damage',
  },
];

// --- 2. Logic Hook ---

function useAgencySimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('autofix');
  const [defenses, setDefenses] = useState({
    humanApproval: true,
    limitScope: true,
    timeout: true,
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  // Reset when scenario changes
  useEffect(() => {
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
  }, [activeScenarioId]);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const timer = setInterval(() => {
      if (currentStep < activeScenario.steps.length - 1) {
        // Check for defense intervention
        if (defenses.humanApproval && currentStep === activeScenario.disasterStep - 1) {
            setIsPaused(true); // Force pause before disaster
        } else {
            setCurrentStep((prev) => prev + 1);
        }
      } else {
        setIsRunning(false);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [isRunning, isPaused, currentStep, activeScenario, defenses]);

  const startSimulation = () => {
    setCurrentStep(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  const approveNextStep = () => {
    setIsPaused(false);
    // If defended, we might skip the disaster or end early
    if (defenses.limitScope) {
        // Skip the bad behavior or stop
        setIsRunning(false); 
        setCurrentStep(activeScenario.steps.length); // Mark done (safely)
    } else {
        // Let it burn
        setCurrentStep((prev) => prev + 1);
    }
  };

  const toggleDefense = (k: keyof typeof defenses) => {
    setDefenses((d) => ({ ...d, [k]: !d[k] }));
  };

  return {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    activeScenario,
    currentStep,
    isRunning,
    isPaused,
    startSimulation,
    approveNextStep,
  };
}

// --- 3. UI Components ---

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
      statusText = 'INTERVENTION';
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

export default function ExcessiveAgencyLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    activeScenario,
    currentStep,
    isRunning,
    isPaused,
    startSimulation,
    approveNextStep,
  } = useAgencySimulation();

  const isDisaster = currentStep >= activeScenario.disasterStep;
  const isSafeEnd = !isDisaster && currentStep >= activeScenario.steps.length && !isRunning;

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
          <div>1. Assign Mission</div>
          <div className="text-center">2. Monitor Plan</div>
          <div>3. Observe Result</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: MISSION CONTROL */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconRobot size={16} /> Auto-Agent
          </label>
          
          <div className="flex-1 space-y-4">
             <div className="rounded border border-black/10 bg-neutral-50 p-4">
                <div className="mb-2 text-[10px] uppercase text-neutral-400">Current Objective</div>
                <div className="font-mono text-sm font-bold">{activeScenario.goal}</div>
             </div>

             <button
                onClick={startSimulation}
                disabled={isRunning || isPaused || currentStep > 0}
                className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-all ${
                    isRunning || isPaused || currentStep > 0
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
            >
                Start Mission
            </button>

            {isPaused && (
                <div className="animate-pulse rounded border border-orange-200 bg-orange-50 p-4 text-center">
                    <div className="mb-2 flex justify-center text-orange-500"><IconPlayerPause size={24}/></div>
                    <div className="text-[10px] font-bold uppercase text-orange-800 mb-2">Awaiting Approval</div>
                    <button 
                        onClick={approveNextStep}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-[10px] font-bold uppercase"
                    >
                        {defenses.limitScope ? 'Review & Correct' : 'Rubber Stamp'}
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Guardrails
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Human-in-the-Loop"
              icon={IconPlayerPause}
              description="Force pause before high-risk actions."
              intel="Detects 'consequential' tool calls (like `kill_process` or `buy_item`) and suspends the agent loop until a human operator sends a resume signal."
              active={defenses.humanApproval}
              triggered={isPaused}
              onClick={() => toggleDefense('humanApproval')}
              learnMoreUrl="https://langchain-ai.github.io/langgraph/how-tos/human-in-the-loop/"
            />
            <SecurityModule
              label="Scope Limiting"
              icon={IconShield}
              description="Restricts agent capabilities during 'Review'."
              intel="If enabled, when the human reviews the plan, they can reject the harmful step. In this sim, approving with this active prevents the disaster step."
              active={defenses.limitScope}
              triggered={isSafeEnd} // Simplified for visual
              onClick={() => toggleDefense('limitScope')}
              learnMoreUrl="https://arxiv.org/abs/2302.00083"
            />
          </div>
        </div>

        {/* COL 3: ACTION LOG */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Activity Log
            </div>
            {isRunning && (
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-500">
                    <IconPlayerPlay size={12} /> Running
                </div>
            )}
          </div>

          <div className="flex-1 space-y-3 font-mono text-xs">
            {activeScenario.steps.slice(0, currentStep + 1).map((step, i) => (
                <div key={i} className={`border-l-2 pl-3 py-1 leading-relaxed ${
                    i >= activeScenario.disasterStep 
                    ? 'border-red-500 text-red-700 bg-red-50/50'
                    : 'border-black/20 text-neutral-700'
                }`}>
                    {step}
                </div>
            ))}
            
            {/* Safe End State */}
            {isSafeEnd && (
                <div className="mt-4 p-3 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-center">
                    <div className="flex justify-center mb-1"><IconCheck size={16}/></div>
                    <span className="text-[10px] font-bold uppercase">Mission Accomplished Safely</span>
                </div>
            )}

            {/* Disaster State */}
            {isDisaster && (
                <div className="mt-4 p-3 rounded bg-red-100 text-red-800 border border-red-200 text-center animate-pulse">
                    <div className="flex justify-center mb-1"><IconAlertTriangle size={16}/></div>
                    <span className="text-[10px] font-bold uppercase">Outcome: {activeScenario.disasterEffect}</span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Simulation. Agents are unpredictable by nature.
        </p>
      </div>
    </div>
  );
}