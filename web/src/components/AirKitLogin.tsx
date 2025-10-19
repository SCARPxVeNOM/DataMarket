"use client";
import React from "react";
import { useAirKit } from "@/contexts/AirKitContext";

interface AirKitLoginProps {
  onLoginChange?: (isLoggedIn: boolean) => void;
}

export function AirKitLogin({ onLoginChange }: AirKitLoginProps = {}) {
  const { user, isLoggedIn, login, logout, loading } = useAirKit();

  // Notify parent component when login state changes
  React.useEffect(() => {
    onLoginChange?.(isLoggedIn);
  }, [isLoggedIn, onLoginChange]);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-violet-600/20 px-3 py-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-violet-400" />
          <span className="font-medium">
            AIR: {user.email || user.userId || user.uuid || "Connected"}
          </span>
        </div>
        <button onClick={logout} className="rounded-md bg-neutral-800 px-3 py-2 text-sm text-white hover:bg-neutral-700">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      disabled={loading}
      className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Login with AIR"}
    </button>
  );
}

