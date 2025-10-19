import { NextRequest } from "next/server";

// Backend JWT-based credential issuance (more secure than client-side)
export async function POST(req: NextRequest) {
  try {
    const { type, claims, userId } = await req.json();

    // In production, generate JWT with private key
    // const jwt = await generateJwt({
    //   partnerId: process.env.AIRKIT_PARTNER_ID,
    //   privateKey: process.env.AIRKIT_PRIVATE_KEY, // Server-only secret!
    // });

    // For now, create a simulated credential
    // In production, this would call AIRKit API with backend JWT
    const credential = {
      id: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      claims: {
        ...claims,
        issuedBy: "DataMarket Backend",
        issuedAt: new Date().toISOString(),
        userId,
      },
      issuer: process.env.AIRKIT_ISSUER_DID || "did:air:id:test:backend",
      verified: true,
      // signature: backendSignature, // Cryptographic proof from backend
    };

    console.log("✅ Backend issued credential:", credential);

    return Response.json({
      success: true,
      credential,
      message: "Credential issued from secure backend",
    });
  } catch (error: any) {
    console.error("❌ Backend credential issuance failed:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

