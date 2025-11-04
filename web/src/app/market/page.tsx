"use client";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AirKitLogin } from "@/components/AirKitLogin";
import { useAirKit } from "@/contexts/AirKitContext";
import { getAirService } from "@/lib/airkit";
import { DataMarketABI } from "../../lib/contract";
import { useGame } from "@/contexts/GameContext";

const CONTRACT_ADDRESS = "0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F";

interface Dataset {
  id: number;
  seller: string;
  uri: string;
  price: string;
  verified: boolean;
  categories?: string[];
  siteCount?: number;
}

export default function MarketPage() {
  const { address } = useAccount();
  const { isLoggedIn: airLoggedIn } = useAirKit();
  const { recordListing } = useGame();
  const [uri, setUri] = useState("");
  const [price, setPrice] = useState("0.01");
  const [requireVerification, setRequireVerification] = useState(false);
  const [buyerCredential, setBuyerCredential] = useState<any>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { writeContractAsync, isPending } = useWriteContract();

  // Ensure client-side rendering to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Read nextId from contract to know how many datasets exist
  const { data: nextId } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DataMarketABI,
    functionName: "nextId",
  });

  // Fetch real datasets from blockchain
  useEffect(() => {
    async function fetchDatasets() {
      if (!nextId) return;
      
      const count = Number(nextId);
      const fetchedDatasets: Dataset[] = [];
      
      for (let i = 1; i <= count; i++) {
        try {
          const dataset = await fetch(`/api/dataset/${i}`).then(r => r.json());
          if (dataset.active) {
            fetchedDatasets.push({
              id: i,
              seller: dataset.seller,
              uri: dataset.uri,
              price: formatEther(BigInt(dataset.priceWei)),
              verified: true,
              categories: ["browsing", "data"],
              siteCount: 0,
            });
          }
        } catch (e) {
          console.log(`Failed to fetch dataset ${i}:`, e);
        }
      }
      
      setDatasets(fetchedDatasets);
    }
    
    fetchDatasets();
  }, [nextId]);

  async function verifyBuyer() {
    try {
      const service = await getAirService();
      const { token } = await service.getAccessToken();
      
      // Issue buyer credential with backend API
      const response = await fetch("/api/airkit/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          credentialType: "verified-buyer",
          claims: {
            humanhood: true,
            verifiedAt: new Date().toISOString(),
            trustScore: 90,
          },
        }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setBuyerCredential(data.credential);
      console.log("✅ Buyer credential issued:", data.credential);
      alert("✅ Buyer verification complete!\n\nYou can now purchase premium datasets (>0.1 MOCA).");
    } catch (e: any) {
      console.error("Buyer verification error:", e);
      alert(e?.message || "Verification failed. Please login with AIR.");
    }
  }

  async function list() {
    if (!address) {
      alert("⚠️ Please connect your wallet first!");
      return;
    }

    if (!uri) {
      alert("⚠️ Please enter IPFS CID!");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert("⚠️ Please enter a valid price!");
      return;
    }
    
    try {
      setLoading(true);
      
      const priceWei = parseEther(price);
      
      console.log("📤 Listing dataset on Moca Chain...", {
        uri,
        priceWei: priceWei.toString(),
        priceMOCA: price,
      });
      
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DataMarketABI,
        functionName: "list",
        args: [uri, priceWei],
      });
      
      console.log("✅ Transaction sent:", tx);
      
      // Award points for listing
      recordListing(uri, parseFloat(price));
      
      alert(`✅ Dataset Listed!\n\nTransaction: ${tx}\nPrice: ${price} MOCA\nCID: ${uri}\n\n🎮 Points awarded for listing!\n\nRefresh the page in a few seconds to see your listing.`);
      
      // Clear form
      setUri("");
      setPrice("0.01");
      
      // Refresh datasets after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (e: any) {
      console.error("❌ Listing error:", e);
      alert(`Failed to list: ${e?.message || e?.shortMessage || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function buyDataset(dataset: Dataset) {
    if (!address) {
      alert("⚠️ Please connect your wallet first!");
      return;
    }

    if (parseFloat(dataset.price) > 0.1 && !buyerCredential) {
      alert("⚠️ This premium dataset requires buyer verification.\n\nClick 'Verify as Buyer' first!");
      return;
    }

    try {
      setLoading(true);
      
      const priceWei = parseEther(dataset.price);
      
      console.log("🛒 Purchasing dataset from Moca Chain...", {
        id: dataset.id,
        seller: dataset.seller,
        priceWei: priceWei.toString(),
        priceMOCA: dataset.price,
      });
      
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DataMarketABI,
        functionName: "buy",
        args: [BigInt(dataset.id)],
        value: priceWei,
      });
      
      console.log("✅ Purchase transaction sent:", tx);
      
      // Note: Sale points are awarded to seller, not buyer
      // Seller's points will be updated when they check their stats
      
      alert(`✅ Purchase Successful!\n\nTransaction: ${tx}\nDataset ID: ${dataset.id}\nPaid: ${dataset.price} MOCA\n\nYou now have access to:\nhttps://gateway.pinata.cloud/ipfs/${dataset.uri}`);
      
      // Open IPFS link
      window.open(`https://gateway.pinata.cloud/ipfs/${dataset.uri}`, "_blank");
    } catch (e: any) {
      console.error("❌ Purchase error:", e);
      alert(`Failed to purchase: ${e?.message || e?.shortMessage || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-white text-black">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 2px, transparent 1px),
            linear-gradient(to bottom, #000 2px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.05,
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Home
            </a>
            <a href="/farm" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Farm
            </a>
            <a href="/market" className="text-sm font-semibold text-black hover:text-blue-600 transition border-b-2 border-blue-600">
              Marketplace
            </a>
            <a href="/seasons" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Seasons
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <AirKitLogin />
            <ConnectButton />
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tight">Marketplace</h1>

        {/* Buyer Verification */}
        {!buyerCredential && (
          <div className="mt-6 rounded-lg border-2 border-yellow-600 bg-yellow-50 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800">Premium Access Available</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Verify your identity to purchase datasets over 0.1 MOCA. Protects sellers from fraud.
                </p>
              </div>
              <button
                onClick={verifyBuyer}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500"
              >
                Verify as Buyer
              </button>
            </div>
          </div>
        )}

        {buyerCredential && (
          <div className="mt-6 rounded-lg border-2 border-green-600 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Verified Buyer - Premium Access Granted</span>
            </div>
          </div>
        )}

        {/* Available Datasets */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Datasets on Moca Chain</h2>
            <span className="text-sm text-gray-600">
              {datasets.length} listing{datasets.length !== 1 ? 's' : ''} • Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </span>
          </div>
          
          {datasets.length === 0 ? (
            <div className="mt-4 rounded-lg border-2 border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="text-gray-500">
                <svg className="mx-auto h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="font-medium text-gray-700">No datasets listed yet</p>
                <p className="text-sm mt-2 text-gray-500">Be the first to list your data below!</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-violet-600 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">Dataset #{dataset.id}</h3>
                        {dataset.verified && (
                          <span className="rounded-full bg-green-100 border border-green-600 px-3 py-1 text-xs font-medium text-green-700">
                            ✓ Verified Seller
                          </span>
                        )}
                        {parseFloat(dataset.price) > 0.1 && (
                          <span className="rounded-full bg-violet-100 border border-violet-600 px-3 py-1 text-xs font-medium text-violet-700">
                            🔒 Premium
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <div><span className="font-medium">Seller:</span> {dataset.seller}</div>
                        <div className="mt-2 text-xs font-mono bg-gray-100 border border-gray-200 p-2 rounded break-all"><span className="font-medium">IPFS:</span> {dataset.uri}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <div className="text-2xl font-bold text-violet-600">{dataset.price} MOCA</div>
                      <button
                        onClick={() => buyDataset(dataset)}
                        disabled={loading || isPending}
                        className="rounded-md bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {(loading || isPending) ? "⏳ Processing..." : "🛒 Buy Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List New Dataset */}
        <div className="mt-8 rounded-lg border-2 border-green-600 bg-gradient-to-br from-green-50 to-blue-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-green-700">📤 List Your Dataset on Moca Chain</h3>
          <p className="mt-2 text-sm text-gray-700">Upload your farmed data to IPFS first (on Farm page), then list it here.</p>
          
          <div className="mt-6 grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">IPFS CID</label>
              <input
                type="text"
                className="w-full rounded-md bg-white border-2 border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="QmX1234... (from Farm page after uploading)"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Price in MOCA</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full rounded-md bg-white border-2 border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-600">💡 Recommended: 0.01 - 1.0 MOCA based on data quality</p>
            </div>
            
            <button
              onClick={list}
              disabled={!isClient || loading || isPending || !address}
              className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {!isClient ? "🚀 List on Moca Chain" : (loading || isPending) ? "⏳ Listing on Blockchain..." : !address ? "⚠️ Connect Wallet to List" : "🚀 List on Moca Chain"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Contract: <a className="underline hover:text-blue-600 transition" href={`https://testnet-explorer.mocachain.org/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">{CONTRACT_ADDRESS}</a>
        </div>
      </div>
    </main>
  );
}


