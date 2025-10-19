import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { defineChain } from "viem";
import abiJson from "../../../../../artifacts/contracts/DataMarket.sol/DataMarket.json";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const datasetId = BigInt(id);

    // Read dataset from contract
    const dataset = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abiJson.abi,
      functionName: "datasets",
      args: [datasetId],
    }) as any;

    return Response.json({
      seller: dataset[0],
      uri: dataset[1],
      priceWei: dataset[2].toString(),
      active: dataset[3],
    });
  } catch (error: any) {
    console.error("Failed to fetch dataset:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

