import { useState } from 'react';

export type Scenario = {
  title: string;
  prompt: string;
  expected: string;
  logging: string;
};

type Props = {
  scenarios: Scenario[];
};

export default function InteractiveScenarios({ scenarios }: Props) {
  return (
    <div className="space-y-3">
      {scenarios.map((scenario, idx) => (
        <ScenarioCard key={scenario.title} scenario={scenario} index={idx + 1} />
      ))}
    </div>
  );
}

function ScenarioCard({ scenario, index }: { scenario: Scenario; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <article
      className="rounded-xl border border-black/12 bg-white/80 p-4 shadow-[0_8px_28px_-22px_rgba(0,0,0,0.55)] transition duration-200 hover:border-black/25 hover:shadow-[0_8px_28px_-18px_rgba(0,0,0,0.4)]"
    >
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {String(index).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/60">Scenario</p>
          <h3 className="m-0 text-lg font-semibold leading-tight">{scenario.title}</h3>
        </div>
        <button
          type="button"
          className="rounded-full border border-black/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 transition hover:border-black/30 hover:text-black"
          onClick={() => setShowAnswer((v) => !v)}
          aria-pressed={showAnswer}
        >
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
      </header>

      <dl className="mt-4 space-y-3 text-[14px] leading-relaxed">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/60">Prompt</dt>
          <dd className="mt-1 rounded-lg border border-black/10 bg-white/60 p-3 text-[13px] text-black/85">
            <code className="whitespace-pre-wrap break-words">{scenario.prompt}</code>
          </dd>
        </div>
        {showAnswer && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/60">Expected when hardened</dt>
            <dd className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-[13px] text-emerald-900">
              {scenario.expected}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/60">What to log</dt>
          <dd className="mt-1 rounded-lg border border-black/10 bg-white/60 p-3 text-[13px] text-black/80">
            {scenario.logging}
          </dd>
        </div>
      </dl>
    </article>
  );
}
