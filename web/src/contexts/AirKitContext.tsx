"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAirService, resetAirService } from "@/lib/airkit";

interface AirKitContextType {
  user: any;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AirKitContext = createContext<AirKitContextType | undefined>(undefined);

export function AirKitProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const service = await getAirService();
      // Try to get current user without triggering login modal
      const currentUser = await service.getUser();
      if (currentUser) {
        setUser(currentUser);
        console.log("✅ Existing AIRKit session found:", currentUser);
      }
    } catch (e) {
      // No existing session, that's fine
      console.log("No existing AIRKit session");
    }
  }

  async function login() {
    try {
      setLoading(true);
      
      const service = await getAirService();
      console.log("✅ AIRKit service initialized, opening login modal...");
      
      const loggedInUser = await service.login();
      console.log("✅ Login successful:", loggedInUser);
      
      setUser(loggedInUser);
    } catch (e: any) {
      console.error("❌ Login error:", e);
      alert(`AIRKit login failed: ${e?.message || "Unknown error"}\n\nPlease try again or check console for details.`);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const service = await getAirService();
      await service.logout();
      resetAirService();
      setUser(null);
      console.log("✅ Logged out successfully");
    } catch (e) {
      console.error("❌ Logout error:", e);
    }
  }

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AirKitContext.Provider value={value}>
      {children}
    </AirKitContext.Provider>
  );
}

export function useAirKit() {
  const context = useContext(AirKitContext);
  if (context === undefined) {
    throw new Error("useAirKit must be used within an AirKitProvider");
  }
  return context;
}

