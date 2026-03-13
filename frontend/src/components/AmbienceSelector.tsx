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
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    type: 'ocean',
    icon: Waves,
    label: 'Ocean',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    type: 'mountain',
    icon: Mountain,
    label: 'Mountain',
    gradient: 'from-purple-500 to-pink-500',
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
                ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-emerald-500/50 scale-105 border border-white/50`
                : 'bg-white/5 border border-white/20 text-gray-300 hover:border-white/40 hover:bg-white/10 hover:text-white'
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
