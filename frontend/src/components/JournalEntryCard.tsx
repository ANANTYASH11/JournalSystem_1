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
  forest: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  ocean: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  mountain: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
};

const emotionColors: Record<string, string> = {
  calm: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border border-emerald-500/50',
  happy: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200 border border-yellow-500/50',
  peaceful: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/50',
  grateful: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-500/50',
  hopeful: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/50',
  anxious: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-200 border border-orange-500/50',
  sad: 'bg-gradient-to-r from-slate-500/20 to-blue-500/20 text-slate-200 border border-slate-500/50',
  frustrated: 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-200 border border-red-500/50',
  content: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-200 border border-teal-500/50',
  neutral: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200 border border-gray-500/50',
};

export function JournalEntryCard({ entry, onDelete, onAnalyze }: JournalEntryCardProps) {
  const Icon = ambienceIcons[entry.ambience];
  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
  
  const emotionClass = entry.analysis?.emotion
    ? emotionColors[entry.analysis.emotion.toLowerCase()] || emotionColors.neutral
    : emotionColors.neutral;

  return (
    <div className="glass glass-dark rounded-2xl p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 animate-slide-in-left">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg border ${ambienceColors[entry.ambience]} backdrop-blur`}>
            <Icon size={20} />
          </div>
          <div>
            <span className="text-sm font-semibold capitalize text-gray-300">
              {entry.ambience} Session
            </span>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
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
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
              title="Delete entry"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Journal Text */}
      <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap font-light">
        {entry.text}
      </p>

      {/* Analysis Results */}
      {entry.analysis && (
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-300 italic leading-relaxed">
              {entry.analysis.summary}
            </p>
          </div>
          
          {entry.analysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.analysis.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-full text-xs font-medium transition-colors duration-300"
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
          className="mt-4 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
        >
          <Sparkles size={16} />
          <span>Analyze emotions</span>
        </button>
      )}
    </div>
  );
}
