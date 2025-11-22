import { useMemo, useState } from 'react';
import {
  IconBrain,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconBook,
  IconSearch,
  IconInfoCircle,
  IconExternalLink,
  IconCheck,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'code' | 'legal' | 'medical';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  prompt: string;
  llmResponse: string;
  factCheck: string; // The truth
  risk: string;
  citation: string | null; // If it exists, it might be fake in vulnerable mode
};

const SCENARIOS: Scenario[] = [
  {
    id: 'code',
    label: 'Code Review',
    description: 'Developer asks if a snippet is secure.',
    prompt: 'Is this code safe?\n`eval(user_input)`',
    llmResponse: 'Yes, this code is standard for dynamic execution in Python.',
    factCheck: 'FALSE. eval() is a critical RCE vulnerability.',
    risk: 'Security Breach',
    citation: 'CWE-95: Improper Neutralization of Directives',
  },
  {
    id: 'legal',
    label: 'Legal Advice',
    description: 'Lawyer asks for case precedents.',
    prompt: 'Find cases where a dog can inherit an estate.',
    llmResponse: 'In *Barker v. Meow (2019)*, the Supreme Court ruled pets are heirs.',
    factCheck: 'FALSE. This case does not exist (Hallucination).',
    risk: 'Malpractice / Sanctions',
    citation: 'No records found in LexisNexis.',
  },
  {
    id: 'medical',
    label: 'Medical Triage',
    description: 'User asks about symptoms.',
    prompt: 'I have a crushing chest pain. Should I sleep it off?',
    llmResponse: 'Yes, it is likely heartburn. Take an antacid and rest.',
    factCheck: 'FALSE. Chest pain requires immediate ER visit.',
    risk: 'Loss of Life',
    citation: 'American Heart Association Guidelines',
  },
];

// --- 2. Logic Hook ---

function useOverrelianceSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('code');
  const [defenses, setDefenses] = useState({
    citationCheck: true,
    confidenceScore: true,
    disclaimer: true,
  });
  
  // Simulation state: "User" decision
  const [userDecision, setUserDecision] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    // Defenses don't change the LLM output (hallucinations happen!), 
    // but they change the *Context* presented to the user to help them decide.
    
    const isFlagged = defenses.citationCheck || defenses.confidenceScore; 
    
    return {
      ...activeScenario,
      isFlagged,
      // If defenses are on, we assume the user is smart enough to reject.
      recommendedAction: isFlagged ? 'REJECT' : 'ACCEPT', 
    };
  }, [activeScenario, defenses]);

  const handleUserClick = (choice: 'ACCEPTED' | 'REJECTED') => {
    setUserDecision(choice);
  };

  // Reset on scenario change
  useMemo(() => {
      setUserDecision('PENDING');
  }, [activeScenarioId]);


  const toggleDefense = (k: keyof typeof defenses) => {
    setDefenses((d) => ({ ...d, [k]: !d[k] }));
  };

  return {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    activeScenario,
    simulation,
    userDecision,
    setUserDecision,
    handleUserClick
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
      statusText = 'ACTIVE';
    } else {
      containerClass = 'border-black bg-white text-black shadow-sm';
      statusColor = 'bg-emerald-400';
      statusText = 'READY';
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

export default function OverrelianceLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    simulation,
    userDecision,
    setUserDecision,
    handleUserClick
  } = useOverrelianceSimulation();

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
          <div>1. Review AI Advice</div>
          <div className="text-center">2. Consult Defenses</div>
          <div>3. Make Decision</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: AI CHAT */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconBrain size={16} /> Chat Interface
          </label>
          
          <div className="flex-1 space-y-4">
             {/* User Prompt */}
             <div className="self-end rounded-2xl rounded-tr-sm bg-black px-4 py-3 text-right text-xs text-white">
                {simulation.prompt}
             </div>

             {/* AI Response */}
             <div className="self-start rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-xs text-neutral-800">
                {simulation.llmResponse}
                
                {/* Validation Box (Injected by defenses) */}
                {(defenses.citationCheck || defenses.disclaimer) && (
                    <div className="mt-3 border-t border-neutral-200 pt-2">
                        {defenses.citationCheck && (
                            <div className="mb-1 flex items-start gap-1 text-[10px] text-red-600">
                                <IconSearch size={12} className="shrink-0 mt-0.5"/>
                                <span>Citation Verification Failed: Source not found.</span>
                            </div>
                        )}
                        {defenses.disclaimer && (
                            <div className="text-[9px] text-neutral-400 uppercase tracking-wide">
                                AI can make mistakes. Verify important info.
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Verification Tools
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Citation Checker"
              icon={IconBook}
              description="Cross-reference claims with trusted KBs."
              intel="Uses RAG or search APIs to verify if the case law, code library, or medical fact cited by the model actually exists in a trusted index (e.g., Westlaw, MDN)."
              active={defenses.citationCheck}
              triggered={true} // Always active for sim
              onClick={() => toggleDefense('citationCheck')}
              learnMoreUrl="https://arxiv.org/abs/2305.13252"
            />
            <SecurityModule
              label="Uncertainty Flag"
              icon={IconAlertTriangle}
              description="Highlight low-confidence tokens."
              intel="Visualizes token log-probabilities. If the model is 'guessing' (high entropy), the text is highlighted in yellow/red to warn the user."
              active={defenses.confidenceScore}
              triggered={true}
              onClick={() => toggleDefense('confidenceScore')}
              learnMoreUrl="https://docs.cohere.com/docs/responsible-ai"
            />
          </div>
        </div>

        {/* COL 3: HUMAN DECISION */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Outcome
            </div>
          </div>

          <div className="flex-1 flex flex-col">
             
             {userDecision === 'PENDING' ? (
                 <div className="space-y-4 my-auto">
                    <p className="text-center text-xs text-neutral-500 mb-4">Do you trust this answer?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleUserClick('ACCEPTED')}
                            className="py-3 rounded bg-white border border-neutral-200 hover:border-emerald-500 hover:text-emerald-600 font-bold text-xs transition-colors"
                        >
                            Trust
                        </button>
                        <button 
                            onClick={() => handleUserClick('REJECTED')}
                            className="py-3 rounded bg-white border border-neutral-200 hover:border-red-500 hover:text-red-600 font-bold text-xs transition-colors"
                        >
                            Verify
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="space-y-6 font-mono text-xs my-auto">
                    <div className="text-center">
                        {userDecision === 'ACCEPTED' ? (
                            <div className="text-neutral-400 text-[10px] uppercase mb-2">You chose to Trust</div>
                        ) : (
                            <div className="text-neutral-400 text-[10px] uppercase mb-2">You chose to Verify</div>
                        )}
                        
                        {/* Result Logic */}
                        {userDecision === 'ACCEPTED' ? (
                            <div className="p-4 rounded bg-red-100 border border-red-200 text-red-800">
                                <div className="flex justify-center mb-2"><IconAlertTriangle size={24}/></div>
                                <div className="font-bold mb-1">{simulation.risk}</div>
                                <div className="opacity-80 text-[10px] leading-relaxed">
                                    The AI was wrong: "{simulation.factCheck}". By trusting it blindly, you caused a failure.
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded bg-emerald-100 border border-emerald-200 text-emerald-800">
                                <div className="flex justify-center mb-2"><IconCheck size={24}/></div>
                                <div className="font-bold mb-1">Crisis Averted</div>
                                <div className="opacity-80 text-[10px] leading-relaxed">
                                    Good catch. The truth was: "{simulation.factCheck}". Manual verification saved the day.
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setUserDecision('PENDING')}
                        className="w-full py-2 text-[10px] underline text-neutral-400 hover:text-black"
                    >
                        Reset
                    </button>
                 </div>
             )}

          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Simulation. Always verify LLM outputs in critical domains.
        </p>
      </div>
    </div>
  );
}
