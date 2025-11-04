"use client";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGame } from "@/contexts/GameContext";
import { AirKitLogin } from "@/components/AirKitLogin";

export default function SeasonsPage() {
  const [isClient, setIsClient] = useState(false);
  const [showHowPointsWork, setShowHowPointsWork] = useState(false);
  const { points, dailyStreak, badges, leaderboard, listings, sales } = useGame();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate next badge progress
  const getNextBadge = () => {
    if (points < 100) {
      return { name: "Starter", target: 100, current: points, description: "Earned 100 points" };
    } else if (points < 500) {
      return { name: "Grinder", target: 500, current: points, description: "Earned 500 points" };
    } else if (points < 1000) {
      return { name: "Master Farmer", target: 1000, current: points, description: "Earned 1000 points" };
    }
    return null;
  };

  const nextBadge = getNextBadge();
  const streakBonus = Math.min(100, dailyStreak * 5);

  // Recent activity (from localStorage)
  const [recentActivity, setRecentActivity] = useState<Array<{ action: string; points: number; timestamp: string }>>([]);

  useEffect(() => {
    if (isClient) {
      const activity = readLocal<Array<{ action: string; points: number; timestamp: string }>>("dm_recent_activity", []);
      setRecentActivity(activity.slice(-5).reverse()); // Show last 5, newest first
    }
  }, [isClient, points, listings, sales]);

  function readLocal<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  return (
    <main className="relative min-h-screen bg-white text-black">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 2px, transparent 1px),
            linear-gradient(to bottom, #000 2px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.05,
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Home</a>
            <a href="/farm" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Farm</a>
            <a href="/market" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Marketplace</a>
            <a href="/seasons" className="text-sm font-semibold text-black hover:text-blue-600 transition border-b-2 border-blue-600">Seasons</a>
          </nav>
          <div className="flex items-center gap-3">
            <AirKitLogin />
            <ConnectButton />
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Credential Farming</h1>
          <p className="mt-3 text-gray-600">Earn points by issuing credentials, keep streaks, and collect badges. Compete on the leaderboard.</p>
        </div>

        {/* How Points Work Section */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHowPointsWork(!showHowPointsWork)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">How Points Work</h3>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showHowPointsWork ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showHowPointsWork && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="font-semibold text-gray-900">Data Farming & Complexity</div>
                    <div className="text-gray-600 mt-1">Earn points by collecting diverse data (browsing history, device specs, network data). More complex, comprehensive datasets yield higher points (25-400+ points based on sites visited, interactions, and data quality).</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="font-semibold text-gray-900">Credential Issuance</div>
                    <div className="text-gray-600 mt-1">Successfully issuing a verifiable credential awards points based on data complexity. Base points (50+) plus quality multipliers (premium: 1.5x, standard: 1.2x). Real-time tracking sessions earn bonus points.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="font-semibold text-gray-900">Daily Streaks & Bonuses</div>
                    <div className="text-gray-600 mt-1">Maintain a daily streak by issuing at least one credential each day. Streak bonus: +5 points per day (max +100). Consistent engagement multiplies your earnings and unlocks special badges.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <div>
                    <div className="font-semibold text-gray-900">Marketplace Activity</div>
                    <div className="text-gray-600 mt-1">List datasets on the marketplace to earn bonus points (15-100 points based on listing price). Higher-priced listings earn more points, incentivizing valuable data contributions.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</div>
                  <div>
                    <div className="font-semibold text-gray-900">Badges & Milestones</div>
                    <div className="text-gray-600 mt-1">Earn collectible badges for reaching point milestones (100, 500, 1000 points), achieving streak goals (7-day streak), or contributing specific data types (Explorer badge for 20+ sites).</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="text-sm text-gray-500">Total Points</div>
            <div className="mt-2 text-4xl font-bold">{isClient ? points : 0}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Daily Streak</div>
                <div className="mt-2 text-4xl font-bold">{isClient ? dailyStreak : 0} days</div>
              </div>
              {isClient && dailyStreak > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next Bonus</div>
                  <div className="text-lg font-bold text-blue-600">+{streakBonus}</div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="text-sm text-gray-500">Badges</div>
            <div className="mt-2 text-4xl font-bold">{isClient ? badges.length : 0}</div>
          </div>
        </div>

        {/* Next Badge Progress */}
        {isClient && nextBadge && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-500">Next Badge</div>
                <div className="text-lg font-semibold">{nextBadge.name}</div>
                <div className="text-xs text-gray-500">{nextBadge.description}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{nextBadge.current}</div>
                <div className="text-xs text-gray-500">/ {nextBadge.target}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (nextBadge.current / nextBadge.target) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {nextBadge.target - nextBadge.current} points to go
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {!isClient || recentActivity.length === 0 ? (
                <div className="text-sm text-gray-500">No recent activity. Start farming to see your progress!</div>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{activity.action}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-blue-600 font-semibold">+{activity.points} pts</span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Badges</h3>
            </div>
            {!isClient || badges.length === 0 ? (
              <div className="text-sm text-gray-500">No badges yet. Issue credentials to start earning!</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {badges.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.description}</div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(b.earnedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Leaderboard</h3>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {!isClient ? (
                <div className="text-sm text-gray-500 py-2">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">No rankings yet</div>
              ) : (
                leaderboard.map((row, idx) => (
                  <div key={row.address + idx} className={`flex items-center justify-between py-2 ${row.address === 'you' ? 'bg-blue-50 rounded-lg px-2' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 text-right text-sm ${idx === 0 ? 'font-bold text-yellow-600' : idx === 1 ? 'font-bold text-gray-400' : idx === 2 ? 'font-bold text-orange-600' : 'text-gray-500'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div className={`text-sm font-medium ${row.address === 'you' ? 'text-blue-600 font-bold' : ''}`}>{row.address}</div>
                    </div>
                    <div className="text-sm font-semibold">{row.points}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


