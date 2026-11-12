import { Search } from 'lucide-react';
import { Input } from '../atoms';

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rightSlot?: React.ReactNode;
}

export function SearchFilterBar({
  value,
  onChange,
  placeholder = 'Cari data...',
  rightSlot,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="w-full sm:max-w-xs">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>
      {rightSlot && <div className="flex items-center gap-2 flex-wrap">{rightSlot}</div>}
    </div>
  );
}

