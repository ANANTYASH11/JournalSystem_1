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
    gradient: 'from-green-400 to-green-600',
  },
  {
    type: 'ocean',
    icon: Waves,
    label: 'Ocean',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    type: 'mountain',
    icon: Mountain,
    label: 'Mountain',
    gradient: 'from-purple-400 to-purple-600',
  },
];

export function AmbienceSelector({ selected, onChange }: AmbienceSelectorProps) {
  return (
    <div className="flex gap-3">
      {ambiences.map(({ type, icon: Icon, label, gradient }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
            ${
              selected === type
                ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105`
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
            }
          `}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
