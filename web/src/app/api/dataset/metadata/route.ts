import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cid } = await req.json();
    if (!cid) {
      return Response.json({ error: "CID required" }, { status: 400 });
    }

    // Fetch dataset from IPFS via Pinata gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract metrics from dataset
    const metrics = {
      siteCount: data.browsingHistory?.length || data.resources?.length || 0,
      totalInteractions: data.interactions ? 
        Object.values(data.interactions).reduce((a: any, b: any) => a + (typeof b === 'number' ? b : 0), 0) : 0,
      totalTimeSpent: data.timeSpent ? 
        Object.values(data.timeSpent).reduce((a: any, b: any) => a + (typeof b === 'number' ? b : 0), 0) : 
        (data.interactions?.timeOnPage || 0),
      trackingDuration: data.trackingDuration || data.privacyMetrics?.trackingDuration || 0,
      resourcesLoaded: data.resources?.length || 0,
      uniqueDomains: data.privacyMetrics?.uniqueDomains || 
        (data.browsingHistory ? new Set(data.browsingHistory.map((p: any) => {
          try { return new URL(p.url || p).hostname; } catch { return ''; }
        }).filter(Boolean)).size : 0),
      dataQuality: data.interactions && Object.values(data.interactions).reduce((a: any, b: any) => a + (typeof b === 'number' ? b : 0), 0) > 1000 ? "premium" :
                   data.browsingHistory?.length >= 10 ? "standard" : "basic",
      categories: data.categories || [],
      hasPerformanceMetrics: !!(data.performance || data.navigationTiming),
      hasDeviceSpecs: !!(data.screen || data.browser),
      hasNetworkData: !!(data.connection),
      hasInteractionData: !!(data.interactions),
      dataSize: JSON.stringify(data).length,
    };

    return Response.json({ metrics, rawData: data });
  } catch (error: any) {
    console.error("Failed to fetch dataset metadata:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

