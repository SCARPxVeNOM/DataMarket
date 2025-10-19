import { AirService, BUILD_ENV } from "@mocanetwork/airkit";

let airServiceInstance: AirService | null = null;
let isInitialized = false;

export async function getAirService() {
  if (!airServiceInstance) {
    const partnerId = process.env.NEXT_PUBLIC_AIRKIT_PARTNER_ID || "61f6379f-9145-4da8-a2d7-f6628343601c";
    
    airServiceInstance = new AirService({
      partnerId,
    });
  }
  
  // Initialize only once with correct parameters according to docs
  if (!isInitialized) {
    await airServiceInstance.init({
      buildEnv: BUILD_ENV.SANDBOX,
      enableLogging: true,
    });
    isInitialized = true;
  }
  
  return airServiceInstance;
}

// Reset service (useful for logout)
export function resetAirService() {
  airServiceInstance = null;
  isInitialized = false;
}

// Get embedded wallet address from AIR account
export async function getAirWalletAddress(): Promise<string | null> {
  try {
    const service = await getAirService();
    const provider = service.getProvider();
    
    // Get accounts from EIP-1193 provider
    const accounts = await provider.request({ 
      method: 'eth_accounts',
      params: []
    }) as string[];
    
    return accounts[0] || null;
  } catch (error) {
    console.error("Failed to get AIR wallet address:", error);
    return null;
  }
}

// Check if smart account is deployed
export async function isAirWalletDeployed(): Promise<boolean> {
  try {
    const service = await getAirService();
    return await service.isSmartAccountDeployed();
  } catch (error) {
    console.error("Failed to check wallet deployment:", error);
    return false;
  }
}

// Deploy embedded wallet for AIR account
export async function deployAirWallet(): Promise<string | null> {
  try {
    const service = await getAirService();
    
    // Deploy the smart account
    const result = await service.deploySmartAccount();
    console.log("Smart account deployed, tx hash:", result.txHash);
    
    // Get the wallet address after deployment
    return await getAirWalletAddress();
  } catch (error) {
    console.error("Failed to deploy AIR wallet:", error);
    return null;
  }
}

// Send transaction using AIR embedded wallet
export async function sendAirTransaction(params: {
  to: string;
  value?: string;
  data?: string;
}) {
  try {
    const service = await getAirService();
    const provider = service.getProvider();
    
    // Use EIP-1193 provider to send transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: params.to,
        value: params.value || '0x0',
        data: params.data || '0x',
      }]
    });
    
    return txHash;
  } catch (error) {
    console.error("AIR transaction failed:", error);
    throw error;
  }
}

export interface DatasetCredential {
  id: string;
  type: "browsing-data";
  claims: {
    siteCount: number;
    categories: string[];
    timeRange: string;
    verified: boolean;
  };
  issuer: string;
  issuedAt: string;
}

export interface SellerCredential {
  id: string;
  type: "verified-seller" | "human" | "age-verified";
  verified: boolean;
  issuer: string;
  issuedAt: string;
}

