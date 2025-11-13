import Chip from './Chip';

interface MetaBarProps {
  items: string[];
}

export default function MetaBar({ items }: MetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-block h-px w-5 bg-black/60" aria-hidden="true" />
      {items.map((txt) => (
        <Chip key={txt}>{txt}</Chip>
      ))}
    </div>
  );
}
