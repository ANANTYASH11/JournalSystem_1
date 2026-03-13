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
  forest: 'bg-green-50 border-green-200 text-green-700',
  ocean: 'bg-blue-50 border-blue-200 text-blue-700',
  mountain: 'bg-purple-50 border-purple-200 text-purple-700',
};

const emotionColors: Record<string, string> = {
  calm: 'bg-green-100 text-green-700',
  happy: 'bg-yellow-100 text-yellow-700',
  peaceful: 'bg-blue-100 text-blue-700',
  grateful: 'bg-purple-100 text-purple-700',
  hopeful: 'bg-cyan-100 text-cyan-700',
  anxious: 'bg-orange-100 text-orange-700',
  sad: 'bg-gray-100 text-gray-700',
  frustrated: 'bg-red-100 text-red-700',
  content: 'bg-teal-100 text-teal-700',
  neutral: 'bg-slate-100 text-slate-700',
};

export function JournalEntryCard({ entry, onDelete, onAnalyze }: JournalEntryCardProps) {
  const Icon = ambienceIcons[entry.ambience];
  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
  
  const emotionClass = entry.analysis?.emotion
    ? emotionColors[entry.analysis.emotion.toLowerCase()] || 'bg-slate-100 text-slate-700'
    : 'bg-slate-100 text-slate-700';

  return (
    <div className="card animate-slide-up hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${ambienceColors[entry.ambience]}`}>
            <Icon size={20} />
          </div>
          <div>
            <span className="text-sm font-medium capitalize text-gray-700">
              {entry.ambience} Session
            </span>
            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {entry.analysis && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${emotionClass}`}>
              {entry.analysis.emotion}
            </span>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete entry"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Journal Text */}
      <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
        {entry.text}
      </p>

      {/* Analysis Results */}
      {entry.analysis && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2 mb-3">
            <Sparkles size={16} className="text-purple-500 mt-0.5" />
            <p className="text-sm text-gray-600 italic">
              {entry.analysis.summary}
            </p>
          </div>
          
          {entry.analysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.analysis.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
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
          className="mt-4 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <Sparkles size={16} />
          <span>Analyze emotions</span>
        </button>
      )}
    </div>
  );
}
