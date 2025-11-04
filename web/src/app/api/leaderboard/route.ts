import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { defineChain } from "viem";
import { DataMarketABI } from "../../../lib/contract";

const mocaTestnet = defineChain({
  id: 222888,
  name: "Moca Chain Testnet",
  nativeCurrency: { name: "Moca", symbol: "MOCA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.mocachain.org"] },
  },
  blockExplorers: {
    default: { name: "MocaScan", url: "https://testnet-explorer.mocachain.org" },
  },
});

const CONTRACT_ADDRESS = "0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F";

const client = createPublicClient({
  chain: mocaTestnet,
  transport: http(),
});

interface LeaderboardEntry {
  address: string;
  points: number;
  listings: number;
  sales: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get nextId to know how many datasets exist
    const nextId = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DataMarketABI,
      functionName: "nextId",
    }) as bigint;

    const count = Number(nextId);
    const userStats = new Map<string, { listings: number; sales: number; totalValue: number }>();

    // Fetch all datasets and aggregate by seller
    for (let i = 1; i <= count; i++) {
      try {
        const dataset = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: DataMarketABI,
          functionName: "datasets",
          args: [BigInt(i)],
        }) as any;

        const seller = dataset[0] as string;
        const priceWei = BigInt(dataset[2].toString());
        const active = dataset[3] as boolean;

        if (active) {
          const existing = userStats.get(seller) || { listings: 0, sales: 0, totalValue: 0 };
          existing.listings += 1;
          existing.totalValue += Number(priceWei) / 1e18;
          userStats.set(seller, existing);
        }

        // Check if dataset has been purchased (hasAccess would be true for buyers)
        // For simplicity, we'll count listings as activity
      } catch (e) {
        console.error(`Failed to fetch dataset ${i}:`, e);
      }
    }

    // Convert to leaderboard format (points based on listings and value)
    const leaderboard: LeaderboardEntry[] = Array.from(userStats.entries()).map(([address, stats]) => {
      // Points calculation: 50 per listing + 100 per MOCA value
      const points = Math.floor(stats.listings * 50 + stats.totalValue * 100);
      return {
        address: address.slice(0, 6) + "..." + address.slice(-4),
        points,
        listings: stats.listings,
        sales: stats.sales,
      };
    });

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    return Response.json({
      leaderboard: leaderboard.slice(0, 50), // Top 50
    });
  } catch (error: any) {
    console.error("Failed to fetch leaderboard:", error);
    return Response.json(
      { error: error.message, leaderboard: [] },
      { status: 500 }
    );
  }
}

