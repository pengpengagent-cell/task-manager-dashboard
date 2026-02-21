'use client';

import { useEffect, useState } from 'react';
import { ActivityStats as Stats, SkillLog, AgentLog } from '@/lib/types';

interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  type: 'skill' | 'agent';
  name: string;
  trigger: string;
  success: boolean;
  notes?: string;
  duration?: number;
}

export default function ActivityPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activity?limit=50');
      if (!response.ok) throw new Error('Failed to fetch activity data');

      const data = await response.json();

      // Transform timeline data
      const transformedTimeline: ActivityTimelineItem[] = data.timeline.map((item: SkillLog | AgentLog) => {
        const isSkill = 'skill' in item;
        return {
          id: item.id,
          timestamp: item.timestamp,
          type: isSkill ? 'skill' : 'agent',
          name: isSkill ? (item as SkillLog).skill : (item as AgentLog).agent,
          trigger: item.trigger,
          success: item.success,
          notes: item.notes,
          duration: isSkill ? undefined : (item as AgentLog).durationSeconds,
        };
      });

      setStats(data.stats);
      setTimeline(transformedTimeline);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getSkillProgressBar = (skill: string, progress: number) => {
    const percentage = Math.min(100, progress);
    const color = percentage >= 100 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-blue-500';

    return (
      <div key={skill} className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium capitalize">{skill}</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${color} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Dashboard</h1>
            <p className="text-gray-600 mt-1">Track skills, agents, and Phase 4 progress</p>
          </div>
          <button
            onClick={fetchActivityData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Phase 4 Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Phase 4 Progress
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Goal: Use each skill 5 times (100% = Phase 4 complete)
          </p>
          <div className="space-y-3">
            {stats?.phase4Progress && Object.entries(stats.phase4Progress).map(([skill, progress]) =>
              getSkillProgressBar(skill, progress)
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">Recent skill and agent activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeline.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No activity recorded yet. Start using skills and agents to see activity here.
                    </td>
                  </tr>
                ) : (
                  timeline.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.type === 'skill'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.trigger}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.success ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {item.notes || '-'}
                        {item.duration && ` (${item.duration}s)`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Summary Badge */}
        {stats && (
          <div className="flex gap-4">
            <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Skill Usage</h3>
              <p className="text-4xl font-bold">
                {Object.values(stats.skillUsage).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Agent Activity</h3>
              <p className="text-4xl font-bold">
                {Object.values(stats.agentActivity).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
