"use client";
import { useState, useEffect } from "react";
import { getAirWalletAddress, deployAirWallet, isAirWalletDeployed } from "@/lib/airkit";
import { formatEther } from "viem";

interface AirWalletProps {
  isLoggedIn: boolean;
}

export function AirWallet({ isLoggedIn }: AirWalletProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      checkWallet();
    }
  }, [isLoggedIn]);

  async function checkWallet() {
    try {
      // Check if smart account is deployed
      const deployed = await isAirWalletDeployed();
      setIsDeployed(deployed);
      
      // Get wallet address (may exist even if not deployed yet)
      const address = await getAirWalletAddress();
      if (address) {
        setWalletAddress(address);
        // Only fetch balance if deployed
        if (deployed) {
          fetchBalance(address);
        }
      }
    } catch (error) {
      console.error("Error checking wallet:", error);
    }
  }

  async function fetchBalance(address: string) {
    try {
      const response = await fetch(`https://testnet-rpc.mocachain.org`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
          id: 1,
        }),
      });
      const data = await response.json();
      if (data.result) {
        const balanceWei = BigInt(data.result);
        setBalance(formatEther(balanceWei));
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }

  async function handleDeployWallet() {
    try {
      setLoading(true);
      const address = await deployAirWallet();
      if (address) {
        setWalletAddress(address);
        setIsDeployed(true);
        fetchBalance(address);
        alert(`✅ AIR Smart Account deployed!\n\nAddress: ${address}\n\nYou can now use this wallet to trade on DataMarket without MetaMask.`);
      }
    } catch (error: any) {
      console.error("Deploy wallet error:", error);
      alert(`Failed to deploy wallet: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  if (!walletAddress || !isDeployed) {
    return (
      <div className="rounded-lg border border-violet-600/50 bg-violet-600/10 p-4">
        <h3 className="font-medium text-violet-300">AIR Embedded Wallet</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Deploy a smart account on Moca Chain without needing MetaMask. Perfect for mainstream users.
        </p>
        {walletAddress && !isDeployed && (
          <p className="mt-2 text-xs text-neutral-500 font-mono break-all">
            Address: {walletAddress}
          </p>
        )}
        <button
          onClick={handleDeployWallet}
          disabled={loading}
          className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Deploying..." : isDeployed ? "Already Deployed" : "Deploy AIR Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-600/50 bg-green-600/10 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-green-300">AIR Wallet Active</h3>
          <p className="mt-1 text-xs text-neutral-400 font-mono break-all">
            {walletAddress}
          </p>
          <p className="mt-2 text-sm text-neutral-300">
            Balance: <span className="font-semibold text-green-400">{parseFloat(balance).toFixed(4)} MOCA</span>
          </p>
        </div>
        <span className="rounded-full bg-green-600/20 px-2 py-1 text-xs text-green-400">
          ✓ Active
        </span>
      </div>
    </div>
  );
}

