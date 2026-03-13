import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AmbienceSelector } from './AmbienceSelector';
import { AmbienceType } from '../types';

interface JournalFormProps {
  onSubmit: (data: { text: string; ambience: AmbienceType }) => Promise<void>;
  loading?: boolean;
}

export function JournalForm({ onSubmit, loading }: JournalFormProps) {
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState<AmbienceType>('forest');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (text.trim().length < 10) {
      setError('Please write at least 10 characters about your experience.');
      return;
    }

    try {
      await onSubmit({ text: text.trim(), ambience });
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass glass-dark rounded-2xl p-8 space-y-6 shadow-lg">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          ✍️ Write Your Experience
        </h2>
        <p className="text-amber-800">Reflect on your nature experience and emotions</p>
      </div>

      {/* Ambience Selector */}
      <div>
        <label className="block text-sm font-semibold text-amber-900 mb-3 uppercase tracking-wider">
          Which ambience did you experience?
        </label>
        <AmbienceSelector selected={ambience} onChange={setAmbience} />
      </div>

      {/* Text Area */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-amber-900 uppercase tracking-wider">
            Share your thoughts
          </label>
          <span className={`text-xs font-medium ${text.length < 10 ? 'text-red-600' : 'text-amber-600'}`}>
            {text.length} / 10
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white/60 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-600/50 focus:outline-none focus:border-amber-500/70 focus:bg-white/80 transition-all duration-300 resize-none focus:ring-2 focus:ring-amber-400/30"
          placeholder="I felt peaceful listening to the forest sounds. The fresh air helped me relax and clear my mind..."
          disabled={loading}
          rows={6}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-700 text-sm animate-fade-in-up">
          <p className="font-semibold mb-1">⚠️ {error.split('.')[0]}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || text.trim().length < 10}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          loading || text.trim().length < 10
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105'
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Saving & Analyzing...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Save Entry</span>
          </>
        )}
      </button>
    </form>
  );
}
