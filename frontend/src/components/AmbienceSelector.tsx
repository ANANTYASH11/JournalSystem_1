import { Trees, Waves, Mountain } from 'lucide-react';
import { AmbienceType } from '../types';

interface AmbienceSelectorProps {
  selected: AmbienceType;
  onChange: (ambience: AmbienceType) => void;
}

const ambiences: { type: AmbienceType; icon: typeof Trees; label: string; gradient: string }[] = [
  {
    type: 'forest',
    icon: Trees,
    label: 'Forest',
    gradient: 'from-green-600 to-green-700',
  },
  {
    type: 'ocean',
    icon: Waves,
    label: 'Ocean',
    gradient: 'from-blue-600 to-blue-700',
  },
  {
    type: 'mountain',
    icon: Mountain,
    label: 'Mountain',
    gradient: 'from-purple-600 to-purple-700',
  },
];

export function AmbienceSelector({ selected, onChange }: AmbienceSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ambiences.map(({ type, icon: Icon, label, gradient }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`
            flex flex-col items-center gap-2 px-4 py-4 rounded-xl font-semibold transition-all duration-300
            ${
              selected === type
                ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-amber-600/30 scale-105 border border-white/50`
                : 'bg-white/40 border border-amber-200/50 text-amber-900 hover:border-amber-300 hover:bg-white/60 hover:text-amber-950'
            }
          `}
        >
          <Icon size={24} />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}
