import { NextRequest } from "next/server";

// Programmable verification programs
// In production, these rules would be configured in AIR Kit Dashboard
const VERIFICATION_PROGRAMS = {
  "premium-buyer": {
    name: "Premium Buyer Access",
    rules: [
      { type: "age-verification", minAge: 18 },
      { type: "human-verification", required: true },
      { type: "trust-score", minScore: 75 },
    ],
  },
  "verified-seller": {
    name: "Verified Seller Badge",
    rules: [
      { type: "human-verification", required: true },
      { type: "kyc-status", required: false }, // Optional
      { type: "trust-score", minScore: 60 },
    ],
  },
  "institutional-buyer": {
    name: "Institutional Access ($1000+ datasets)",
    rules: [
      { type: "kyc-complete", required: true },
      { type: "accredited-investor", required: true },
      { type: "minimum-balance", amount: "100 MOCA" },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { programId, credentials } = await req.json();

    const program = VERIFICATION_PROGRAMS[programId as keyof typeof VERIFICATION_PROGRAMS];
    
    if (!program) {
      return Response.json(
        { success: false, error: "Unknown verification program" },
        { status: 400 }
      );
    }

    // Check if user meets all rules
    const results = program.rules.map((rule) => {
      // Simulate credential verification
      // In production, this would verify cryptographic signatures
      const hasCred = credentials?.some((c: any) => c.type === rule.type);
      
      return {
        rule: rule.type,
        passed: hasCred || !rule.required,
        message: hasCred
          ? `✅ ${rule.type} verified`
          : rule.required
          ? `❌ Missing required: ${rule.type}`
          : `⚠️ Optional: ${rule.type}`,
      };
    });

    const allPassed = results.every((r) => r.passed);
    const status = allPassed ? "Compliant" : "Non-Compliant";

    console.log(`🔍 Verification Program "${programId}":`, status);

    return Response.json({
      success: true,
      programId,
      programName: program.name,
      status,
      results,
      grantedAccess: allPassed,
    });
  } catch (error: any) {
    console.error("❌ Verification failed:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

