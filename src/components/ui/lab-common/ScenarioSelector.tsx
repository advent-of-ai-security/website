interface Scenario {
  id: string;
  label: string;
}

interface ScenarioSelectorProps<T extends Scenario> {
  scenarios: T[];
  activeId: string;
  onSelect: (scenario: T) => void;
  label?: string;
}

export function ScenarioSelector<T extends Scenario>({
  scenarios,
  activeId,
  onSelect,
  label = 'Load Scenario:'
}: ScenarioSelectorProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
        {label}
      </span>
      {scenarios.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
            activeId === s.id
              ? 'border-neutral-900 bg-neutral-900 text-white shadow-md transform scale-105'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
