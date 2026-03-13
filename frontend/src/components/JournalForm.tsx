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
    <form onSubmit={handleSubmit} className="glass glass-dark rounded-2xl p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ✨ New Journal Entry
        </h2>
        <p className="text-gray-400">Express yourself and let AI understand your emotions</p>
      </div>

      {/* Ambience Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Which ambience did you experience?
        </label>
        <AmbienceSelector selected={ambience} onChange={setAmbience} />
      </div>

      {/* Text Area */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
            How do you feel?
          </label>
          <span className={`text-xs font-medium ${text.length < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
            {text.length} / 10
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300 resize-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="I felt calm today after listening to the rain. The forest sounds helped me relax and forget about my worries..."
          disabled={loading}
          rows={6}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fade-in-up">
          <p className="font-semibold mb-1">⚠️ {error.split('.')[0]}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || text.trim().length < 10}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          loading || text.trim().length < 10
            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105'
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
