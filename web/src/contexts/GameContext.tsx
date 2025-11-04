"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateDataPoints, getPointsForListing, getPointsForSale, type DataMetrics } from "@/lib/point-system";

type Badge = {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
};

type GameState = {
  points: number;
  dailyStreak: number;
  lastIssuedAt?: string;
  badges: Badge[];
  leaderboard: Array<{ address: string; points: number }>;
  listings: Array<{ cid: string; price: number; timestamp: string }>;
  sales: Array<{ cid: string; price: number; timestamp: string }>;
};

type GameContextValue = GameState & {
  addPoints: (amount: number, reason?: string) => void;
  bumpStreak: () => void;
  awardBadge: (badge: Omit<Badge, "earnedAt">) => void;
  resetStreak: () => void;
  recordCredentialIssued: (metrics: DataMetrics) => void;
  recordListing: (cid: string, price: number) => void;
  recordSale: (cid: string, price: number) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() =>
    readLocal<GameState>("dm_game_state", {
      points: 0,
      dailyStreak: 0,
      lastIssuedAt: undefined,
      badges: [],
      leaderboard: [],
      listings: [],
      sales: [],
    })
  );

  const [blockchainLeaderboard, setBlockchainLeaderboard] = useState<Array<{ address: string; points: number }>>([]);

  // Fetch real leaderboard from blockchain
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (response.ok) {
          const data = await response.json();
          setBlockchainLeaderboard(data.leaderboard || []);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard:", e);
      }
    }
    fetchLeaderboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    writeLocal("dm_game_state", state);
  }, [state]);

  // Merge local points with blockchain leaderboard
  const derivedLeaderboard = useMemo(() => {
    const me = { address: "you", points: state.points };
    const merged = [me, ...blockchainLeaderboard]
      .reduce((acc, cur) => {
        const idx = acc.findIndex((x) => x.address === cur.address);
        if (idx >= 0) {
          // Use max points between local and blockchain
          acc[idx].points = Math.max(acc[idx].points, cur.points);
        } else {
          acc.push(cur);
        }
        return acc;
      }, [] as Array<{ address: string; points: number }>)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    return merged;
  }, [state.points, blockchainLeaderboard]);

  const value: GameContextValue = {
    ...state,
    leaderboard: derivedLeaderboard,
    addPoints: (amount: number) => {
      setState((s) => ({ ...s, points: Math.max(0, s.points + amount) }));
    },
    bumpStreak: () => {
      const today = new Date();
      setState((s) => {
        let nextStreak = s.dailyStreak;
        if (!s.lastIssuedAt) nextStreak = 1;
        else {
          const last = new Date(s.lastIssuedAt);
          const deltaDays = Math.floor((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
          if (deltaDays === 0) nextStreak = s.dailyStreak; // already counted today
          else if (deltaDays === 1) nextStreak = s.dailyStreak + 1;
          else nextStreak = 1; // reset
        }
        return { ...s, dailyStreak: nextStreak, lastIssuedAt: today.toISOString() };
      });
    },
    awardBadge: (badge) => {
      setState((s) => {
        if (s.badges.some((b) => b.id === badge.id)) return s;
        return { ...s, badges: [...s.badges, { ...badge, earnedAt: new Date().toISOString() }] };
      });
    },
    resetStreak: () => setState((s) => ({ ...s, dailyStreak: 0 })),
    recordCredentialIssued: (metrics: DataMetrics) => {
      // Calculate points based on data complexity
      const dataPoints = calculateDataPoints(metrics);
      const streakBonus = Math.min(100, (state.dailyStreak || 0) * 5);
      const total = dataPoints + streakBonus;
      
      const today = new Date();
      const dataType = metrics.trackingDuration ? "Real-Time Tracking" : 
                      metrics.siteCount >= 20 ? "Comprehensive Session" : 
                      metrics.totalInteractions >= 1000 ? "High Interaction Data" : 
                      "Standard Dataset";
      
      // Record activity
      const activity = {
        action: `Issued "${dataType}" credential`,
        points: total,
        timestamp: today.toISOString(),
      };
      const existingActivity = readLocal<Array<typeof activity>>("dm_recent_activity", []);
      writeLocal("dm_recent_activity", [...existingActivity, activity].slice(-20)); // Keep last 20
      
      setState((s) => {
        const newStreak = s.lastIssuedAt && new Date(s.lastIssuedAt).toDateString() === today.toDateString() 
          ? s.dailyStreak 
          : (s.dailyStreak || 0) + 1;
        const newPoints = s.points + total;
        
        return {
          ...s,
          points: newPoints,
          dailyStreak: newStreak,
          lastIssuedAt: today.toISOString(),
        };
      });
      
      // Badges thresholds
      setTimeout(() => {
        const newTotal = state.points + total;
        if (newTotal >= 100 && !state.badges.find((b) => b.id === "starter-100")) {
          value.awardBadge({ id: "starter-100", name: "Starter", description: "Earned 100 points" });
        }
        if (newTotal >= 500 && !state.badges.find((b) => b.id === "grinder-500")) {
          value.awardBadge({ id: "grinder-500", name: "Grinder", description: "Earned 500 points" });
        }
        if (newTotal >= 1000 && !state.badges.find((b) => b.id === "master-1000")) {
          value.awardBadge({ id: "master-1000", name: "Master Farmer", description: "Earned 1000 points" });
        }
        if ((state.dailyStreak + 1) >= 7 && !state.badges.find((b) => b.id === "streak-7")) {
          value.awardBadge({ id: "streak-7", name: "7-Day Streak", description: "Issued credentials 7 days in a row" });
        }
        if (metrics.siteCount >= 20 && !state.badges.find((b) => b.id === "explorer-20")) {
          value.awardBadge({ id: "explorer-20", name: "Explorer", description: "Collected data from 20+ sites" });
        }
        if (metrics.totalInteractions >= 1000 && !state.badges.find((b) => b.id === "interactive-1000")) {
          value.awardBadge({ id: "interactive-1000", name: "Highly Interactive", description: "1000+ interactions tracked" });
        }
      }, 0);
    },
    recordListing: (cid: string, price: number) => {
      const listingPoints = getPointsForListing(price);
      const now = new Date();
      
      // Record activity
      const activity = {
        action: `Listed dataset (${price} MOCA)`,
        points: listingPoints,
        timestamp: now.toISOString(),
      };
      const existingActivity = readLocal<Array<typeof activity>>("dm_recent_activity", []);
      writeLocal("dm_recent_activity", [...existingActivity, activity].slice(-20)); // Keep last 20
      
      setState((s) => ({
        ...s,
        points: s.points + listingPoints,
        listings: [...s.listings, { cid, price, timestamp: now.toISOString() }],
      }));
    },
    recordSale: (cid: string, price: number) => {
      const salePoints = getPointsForSale(price);
      setState((s) => ({
        ...s,
        points: s.points + salePoints,
        sales: [...s.sales, { cid, price, timestamp: new Date().toISOString() }],
      }));
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}


