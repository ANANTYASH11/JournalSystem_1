import { useState, useEffect, useCallback } from 'react';
import { Trees, Brain, BarChart3, RefreshCw, Sparkles } from 'lucide-react';
import { JournalForm } from './components/JournalForm';
import { JournalEntryCard } from './components/JournalEntryCard';
import { InsightsPanel } from './components/InsightsPanel';
import { journalApi } from './services/api';
import { JournalEntry, UserInsights } from './types';
import toast from 'react-hot-toast';

// Demo user ID (in production, this would come from auth)
const DEMO_USER_ID = '123';

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'entries' | 'insights'>('write');

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const data = await journalApi.getEntries(DEMO_USER_ID);
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast.error('Failed to load entries');
    }
  }, []);

  // Fetch insights
  const fetchInsights = useCallback(async () => {
    try {
      const data = await journalApi.getInsights(DEMO_USER_ID);
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchEntries();
    fetchInsights();
  }, [fetchEntries, fetchInsights]);

  // Handle new entry submission
  const handleSubmitEntry = async (data: { text: string; ambience: 'forest' | 'ocean' | 'mountain' }) => {
    setIsLoading(true);
    try {
      await journalApi.createEntry({
        userId: DEMO_USER_ID,
        ambience: data.ambience,
        text: data.text,
      });
      toast.success('Journal entry saved!');
      await fetchEntries();
      await fetchInsights();
      setActiveTab('entries');
    } catch (error) {
      console.error('Failed to create entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle analyze button click
  const handleAnalyze = async (entry: JournalEntry) => {
    try {
      const analysis = await journalApi.analyzeText(entry.text);
      toast.success(`Emotion detected: ${analysis.emotion}`);
      // Refresh entries to get updated analysis
      await fetchEntries();
    } catch (error) {
      console.error('Failed to analyze:', error);
      toast.error('Analysis failed');
    }
  };

  // Handle delete
  const handleDelete = async (entryId: string) => {
    try {
      await journalApi.deleteEntry(DEMO_USER_ID, entryId);
      toast.success('Entry deleted');
      await fetchEntries();
      await fetchInsights();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ArvyaX Journal</h1>
                <p className="text-emerald-300/70 text-sm">AI-Powered Mental Wellness</p>
              </div>
            </div>
            <button
              onClick={() => { fetchEntries(); fetchInsights(); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'write', label: 'Write Entry', icon: Trees },
              { id: 'entries', label: 'My Entries', icon: Brain },
              { id: 'insights', label: 'Insights', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                    : 'text-white/60 border-transparent hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Write Entry Tab */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                How are you feeling?
              </h2>
              <p className="text-white/60">
                Select your session ambience and write your thoughts
              </p>
            </div>

            <JournalForm
              onSubmit={handleSubmitEntry}
              loading={isLoading}
            />
          </div>
        )}

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Your Journal Entries
              </h2>
              <span className="text-white/60 text-sm">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white/60 mb-2">
                  No entries yet
                </h3>
                <p className="text-white/40 mb-4">
                  Start your wellness journey by writing your first entry
                </p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Write Entry
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {entries.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    onAnalyze={handleAnalyze}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          insights ? <InsightsPanel insights={insights} /> : <InsightsPanel insights={{ totalEntries: 0, topEmotion: null, mostUsedAmbience: null, recentKeywords: [] }} loading={true} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">
            ArvyaX Journal System • AI-Assisted Mental Wellness Tracking
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
