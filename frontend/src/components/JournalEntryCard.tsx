import { formatDistanceToNow } from 'date-fns';
import { Trees, Waves, Mountain, Trash2, Sparkles } from 'lucide-react';
import { JournalEntry, AmbienceType } from '../types';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete?: (entryId: string) => void;
  onAnalyze?: (entry: JournalEntry) => void;
}

const ambienceIcons: Record<AmbienceType, typeof Trees> = {
  forest: Trees,
  ocean: Waves,
  mountain: Mountain,
};

const ambienceColors: Record<AmbienceType, string> = {
  forest: 'bg-green-500/20 border-green-400/50 text-green-700',
  ocean: 'bg-blue-500/20 border-blue-400/50 text-blue-700',
  mountain: 'bg-purple-500/20 border-purple-400/50 text-purple-700',
};

const emotionColors: Record<string, string> = {
  calm: 'bg-green-400/30 to-teal-400/30 text-green-800 border border-green-400/50',
  happy: 'bg-yellow-400/30 to-orange-400/30 text-yellow-800 border border-yellow-400/50',
  peaceful: 'bg-blue-400/30 to-cyan-400/30 text-blue-800 border border-blue-400/50',
  grateful: 'bg-purple-400/30 to-pink-400/30 text-purple-800 border border-purple-400/50',
  hopeful: 'bg-cyan-400/30 to-blue-400/30 text-cyan-800 border border-cyan-400/50',
  anxious: 'bg-orange-400/30 to-red-400/30 text-orange-800 border border-orange-400/50',
  sad: 'bg-slate-400/30 to-blue-400/30 text-slate-800 border border-slate-400/50',
  frustrated: 'bg-red-400/30 to-orange-400/30 text-red-800 border border-red-400/50',
  content: 'bg-teal-400/30 to-cyan-400/30 text-teal-800 border border-teal-400/50',
  neutral: 'bg-gray-400/30 to-slate-400/30 text-gray-800 border border-gray-400/50',
};

export function JournalEntryCard({ entry, onDelete, onAnalyze }: JournalEntryCardProps) {
  const Icon = ambienceIcons[entry.ambience];
  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
  
  const emotionClass = entry.analysis?.emotion
    ? emotionColors[entry.analysis.emotion.toLowerCase()] || emotionColors.neutral
    : emotionColors.neutral;

  return (
    <div className="glass glass-dark rounded-2xl p-6 hover:shadow-lg hover:shadow-amber-600/20 transition-all duration-300 animate-slide-in-left border-l-4 border-l-amber-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg border ${ambienceColors[entry.ambience]} backdrop-blur`}>
            <Icon size={20} />
          </div>
          <div>
            <span className="text-sm font-semibold capitalize text-amber-900">
              {entry.ambience} Session
            </span>
            <p className="text-xs text-amber-700 mt-1">{timeAgo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {entry.analysis && (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${emotionClass}`}>
              {entry.analysis.emotion}
            </span>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 text-amber-700 hover:text-red-600 hover:bg-red-500/20 rounded-lg transition-all duration-300"
              title="Delete entry"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Journal Text */}
      <p className="text-amber-900 leading-relaxed mb-6 whitespace-pre-wrap font-light">
        {entry.text}
      </p>

      {/* Analysis Results */}
      {entry.analysis && (
        <div className="pt-6 border-t border-amber-200/50">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900 italic leading-relaxed">
              {entry.analysis.summary}
            </p>
          </div>
          
          {entry.analysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.analysis.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/40 hover:bg-white/60 text-amber-900 rounded-full text-xs font-medium transition-colors duration-300 border border-amber-200/50"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analyze Button (if no analysis yet) */}
      {!entry.analysis && onAnalyze && (
        <button
          onClick={() => onAnalyze(entry)}
          className="mt-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300"
        >
          <Sparkles size={16} />
          <span>Analyze emotions</span>
        </button>
      )}
    </div>
  );
}
