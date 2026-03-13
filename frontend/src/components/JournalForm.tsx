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
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        ✨ New Journal Entry
      </h2>

      {/* Ambience Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Which ambience did you experience?
        </label>
        <AmbienceSelector selected={ambience} onChange={setAmbience} />
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          How do you feel? What did you experience?
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="journal-textarea"
          placeholder="I felt calm today after listening to the rain. The forest sounds helped me relax and forget about my worries..."
          disabled={loading}
          rows={5}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{text.length} characters</span>
          <span>Min: 10 characters</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || text.trim().length < 10}
        className="btn-primary w-full flex items-center justify-center gap-2"
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
