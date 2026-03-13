import { useState, useEffect, useCallback } from 'react';
import { Menu, X, Brain, BarChart3, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-200 backdrop-blur-md bg-gradient-to-r from-amber-50/90 via-orange-50/90 to-amber-100/90 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 animate-fade-in-up">
              <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl shadow-lg shadow-amber-600/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">📖 Journal</h1>
                <p className="text-amber-700 text-xs font-semibold tracking-wider">Nature & Wellness</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-2">
              {[
                { id: 'write', label: 'Write Entry', icon: Sparkles },
                { id: 'entries', label: 'My Entries', icon: Brain },
                { id: 'insights', label: 'Insights', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as typeof activeTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-amber-900 hover:bg-white/60 hover:text-amber-950'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>

            {/* Refresh & Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchEntries();
                  fetchInsights();
                }}
                className="p-2 hover:bg-white/40 rounded-lg transition-all duration-300 text-amber-900 hover:text-amber-950"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/40 rounded-lg transition-all duration-300 text-amber-900 hover:text-amber-950"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-2 animate-fade-in-up">
              {[
                { id: 'write', label: 'Write Entry', icon: Sparkles },
                { id: 'entries', label: 'My Entries', icon: Brain },
                { id: 'insights', label: 'Insights', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as typeof activeTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 w-full ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                      : 'text-amber-900 hover:bg-white/40 hover:text-amber-950'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Write Entry Tab */}
        {activeTab === 'write' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-900 leading-tight">
                Share your <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">nature journey</span>
              </h2>
              <p className="text-amber-800 text-lg max-w-2xl mx-auto">
                Write about your wellness experience in nature. Let our AI understand your emotions and help you track your mental wellness journey.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <JournalForm onSubmit={handleSubmitEntry} loading={isLoading} />
            </div>
          </div>
        )}

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-2">📚 My Journal</h2>
                <p className="text-amber-800">
                  {entries.length} {entries.length === 1 ? 'memory' : 'memories'} recorded
                </p>
              </div>
              <button
                onClick={() => setActiveTab('write')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-600/30 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                New Entry
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl">
                <Brain className="w-20 h-20 text-amber-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-amber-900 mb-3">Start your journal</h3>
                <p className="text-amber-800 mb-8">
                  Begin your wellness journey by writing your first journal entry about your nature experience
                </p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-600/30 transition-all duration-300"
                >
                  Write Your First Entry
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {entries.map((entry, idx) => (
                  <div key={entry.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <JournalEntryCard entry={entry} onAnalyze={() => handleAnalyze(entry)} onDelete={() => handleDelete(entry.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-2">📊 Your Wellness Insights</h2>
              <p className="text-amber-800">Track your emotional patterns and growth</p>
            </div>
            {insights ? (
              <InsightsPanel insights={insights} />
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="animate-pulse-glow inline-block">
                  <BarChart3 className="w-12 h-12 text-amber-300" />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200 backdrop-blur-md py-8 mt-20 bg-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-900 text-sm font-medium">
            📖 Nature Journal • Powered by AI Emotion Analysis
          </p>
          <p className="text-amber-800 text-xs mt-2">
            Track your wellness journey through nature experiences
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
