import { NextRequest } from "next/server";

// Credential revocation system (ban bad actors)
const REVOKED_CREDENTIALS = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { credentialId, reason, revokedBy } = await req.json();

    // In production:
    // 1. Verify backend JWT auth
    // 2. Call AIRKit revocation API
    // 3. Record on-chain for transparency

    REVOKED_CREDENTIALS.add(credentialId);

    console.log(`🚫 Credential revoked: ${credentialId}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   By: ${revokedBy}`);

    return Response.json({
      success: true,
      credentialId,
      revoked: true,
      revokedAt: new Date().toISOString(),
      reason,
      message: "Credential successfully revoked. User's access has been terminated.",
    });
  } catch (error: any) {
    console.error("❌ Revocation failed:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Check if credential is revoked
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const credentialId = searchParams.get("id");

  if (!credentialId) {
    return Response.json({ error: "Missing credential ID" }, { status: 400 });
  }

  const isRevoked = REVOKED_CREDENTIALS.has(credentialId);

  return Response.json({
    credentialId,
    isRevoked,
    status: isRevoked ? "REVOKED" : "ACTIVE",
  });
}

