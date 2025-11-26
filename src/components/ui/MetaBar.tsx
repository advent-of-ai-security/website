import Chip from './Chip';

interface MetaBarProps {
  items: string[];
}

export default function MetaBar({ items }: MetaBarProps) {
  return (
    <div className="flex flex-nowrap items-center gap-[calc(var(--shell-gap)/2)] shrink-0">
      {items.map((txt) => (
        <Chip key={txt}>{txt}</Chip>
      ))}
    </div>
  );
}
