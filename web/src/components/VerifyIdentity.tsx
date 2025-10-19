"use client";
import { useState } from "react";
import { getAirService } from "@/lib/airkit";

interface VerifyIdentityProps {
  onVerified?: (credential: any) => void;
}

export function VerifyIdentity({ onVerified }: VerifyIdentityProps) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [credential, setCredential] = useState<any>(null);

  async function verifyHuman() {
    try {
      setLoading(true);
      const service = await getAirService();
      
      // Get AIR access token for authentication
      const { token } = await service.getAccessToken();
      
      // Issue credential with backend API using real AIR token
      const response = await fetch("/api/airkit/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          credentialType: "verified-seller",
          claims: {
            humanhood: true,
            verifiedAt: new Date().toISOString(),
            trustScore: 85,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to issue credential");
      }

      setCredential(data.credential);
      setVerified(true);
      onVerified?.(data.credential);
      
      console.log("✅ Seller credential issued:", data.credential);
    } catch (e: any) {
      console.error("Verification error:", e);
      alert(e?.message || "Verification failed. Please ensure you're logged in with AIR.");
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="rounded-xl border-2 border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-green-700">Identity Verified</span>
            <p className="text-sm text-gray-600 mt-1">
              Credential ID: {credential?.id?.slice(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-600">
          <span className="text-lg font-bold text-violet-600">1</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Verify Your Identity</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed ml-13">
        Get a verified seller badge to increase buyer trust. Proves you're a real human.
      </p>
      <button
        onClick={verifyHuman}
        disabled={loading}
        className="mt-6 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          "Verify Now"
        )}
      </button>
    </div>
  );
}

