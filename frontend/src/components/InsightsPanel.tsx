import { BarChart3, TrendingUp, Hash, Activity } from 'lucide-react';
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
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (insights.totalEntries === 0) {
    return (
      <div className="card text-center py-8">
        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No insights yet</h3>
        <p className="text-sm text-gray-400">
          Start writing journal entries to see your mental wellness insights.
        </p>
      </div>
    );
  }

  const emoji = insights.topEmotion 
    ? emotionEmojis[insights.topEmotion.toLowerCase()] || '😊' 
    : '😊';

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={24} className="text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-800">Your Insights</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <p className="text-sm text-blue-600 mb-1">Total Entries</p>
          <p className="text-3xl font-bold text-blue-700">{insights.totalEntries}</p>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <p className="text-sm text-purple-600 mb-1">Top Emotion</p>
          <p className="text-2xl font-bold text-purple-700 capitalize flex items-center gap-2">
            <span>{emoji}</span>
            <span>{insights.topEmotion || 'N/A'}</span>
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl col-span-2">
          <p className="text-sm text-green-600 mb-1">Favorite Ambience</p>
          <p className="text-xl font-bold text-green-700 capitalize">
            {insights.mostUsedAmbience || 'No preference yet'}
          </p>
        </div>
      </div>

      {/* Emotion Distribution */}
      {insights.emotionDistribution && Object.keys(insights.emotionDistribution).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Emotion Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(insights.emotionDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([emotion, count]) => {
                const percentage = (count / insights.totalEntries) * 100;
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="text-sm capitalize w-20 text-gray-600">{emotion}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Keywords */}
      {insights.recentKeywords.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Hash size={16} />
            Recent Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {insights.recentKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
