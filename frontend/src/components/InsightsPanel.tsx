import { TrendingUp, Hash, Activity } from 'lucide-react';
import { UserInsights } from '../types';

interface InsightsPanelProps {
  insights: UserInsights;
  loading?: boolean;
}

const emotionEmojis: Record<string, string> = {
  calm: '😌',
  happy: '😊',
  peaceful: '🧘',
  grateful: '🙏',
  hopeful: '✨',
  anxious: '😰',
  sad: '😢',
  frustrated: '😤',
  content: '😊',
  neutral: '😐',
};

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="glass glass-dark rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-8"></div>
        <div className="space-y-4">
          <div className="h-6 bg-white/10 rounded w-full"></div>
          <div className="h-6 bg-white/10 rounded w-2/3"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (insights.totalEntries === 0) {
    return (
      <div className="glass glass-dark rounded-2xl p-12 text-center">
        <Activity size={48} className="mx-auto text-white/20 mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-3">No insights yet</h3>
        <p className="text-gray-400 mb-6">
          Start writing journal entries to see your mental wellness insights.
        </p>
      </div>
    );
  }

  const emoji = insights.topEmotion 
    ? emotionEmojis[insights.topEmotion.toLowerCase()] || '😊' 
    : '😊';

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass glass-dark rounded-2xl p-6 border-l-4 border-emerald-500">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Total Entries</p>
          <p className="text-4xl font-bold text-white">{insights.totalEntries}</p>
        </div>
        
        <div className="glass glass-dark rounded-2xl p-6 border-l-4 border-cyan-500">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Top Emotion</p>
          <p className="text-3xl font-bold text-white capitalize flex items-center gap-2">
            <span>{emoji}</span>
            <span>{insights.topEmotion || 'N/A'}</span>
          </p>
        </div>

        <div className="glass glass-dark rounded-2xl p-6 border-l-4 border-purple-500">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Favorite Ambience</p>
          <p className="text-xl font-bold text-white capitalize">
            {insights.mostUsedAmbience || 'No preference yet'}
          </p>
        </div>
      </div>

      {/* Emotion Distribution */}
      {insights.emotionDistribution && Object.keys(insights.emotionDistribution).length > 0 && (
        <div className="glass glass-dark rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-400" />
            Emotion Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(insights.emotionDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([emotion, count]) => {
                const percentage = (count / insights.totalEntries) * 100;
                return (
                  <div key={emotion}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm capitalize font-medium text-gray-300">{emotion}</span>
                      <span className="text-sm text-emerald-400 font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Keywords */}
      {insights.recentKeywords.length > 0 && (
        <div className="glass glass-dark rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Hash size={20} className="text-cyan-400" />
            Recent Keywords
          </h3>
          <div className="flex flex-wrap gap-3">
            {insights.recentKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all duration-300 cursor-default"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
