import { NextRequest } from "next/server";

// Cross-application reputation aggregation
// Simulates fetching reputation from other Moca Network apps
const MOCK_ECOSYSTEM_DATA = {
  "marketplace-a": {
    sellerRating: 4.8,
    totalSales: 150,
    badges: ["verified-seller", "top-rated"],
  },
  "marketplace-b": {
    sellerRating: 4.6,
    totalSales: 89,
    badges: ["verified-human", "kyc-complete"],
  },
  "dao-platform": {
    governanceScore: 92,
    proposalsVoted: 45,
    badges: ["active-participant"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId, platforms } = await req.json();

    // In production, this would:
    // 1. Query AIR Kit for credentials from other apps
    // 2. Verify cryptographic signatures
    // 3. Check credential status (not revoked)
    
    const reputationData = platforms?.map((platform: string) => {
      const data = MOCK_ECOSYSTEM_DATA[platform as keyof typeof MOCK_ECOSYSTEM_DATA];
      return data ? { platform, ...data } : null;
    }).filter(Boolean);

    // Calculate composite trust score
    const avgRating = reputationData.reduce((acc: number, d: any) => 
      acc + (d.sellerRating || 0), 0) / (reputationData.length || 1);
    
    const totalSales = reputationData.reduce((acc: number, d: any) => 
      acc + (d.totalSales || 0), 0);
    
    const allBadges = [...new Set(reputationData.flatMap((d: any) => d.badges || []))];

    const compositeTrustScore = Math.min(100, Math.round(
      (avgRating / 5) * 40 + // 40% from ratings
      Math.min(totalSales / 10, 30) + // 30% from sales volume
      (allBadges.length * 5) // 5 points per unique badge
    ));

    console.log(`⭐ Imported reputation for user ${userId}:`, {
      compositeTrustScore,
      platforms: reputationData.length,
    });

    return Response.json({
      success: true,
      userId,
      reputationData,
      compositeTrustScore,
      allBadges,
      totalSales,
      avgRating: avgRating.toFixed(1),
      verifiedOn: `${reputationData.length} platform(s)`,
    });
  } catch (error: any) {
    console.error("❌ Reputation import failed:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

