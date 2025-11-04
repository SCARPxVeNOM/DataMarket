/**
 * Point calculation system based on data type and complexity
 * More demanding/complex data = more points
 */

export type DataType = 
  | "browsing-history" 
  | "real-time-tracking" 
  | "performance-metrics" 
  | "device-specs" 
  | "network-data" 
  | "interaction-data"
  | "comprehensive-session";

export interface DataMetrics {
  siteCount: number;
  totalInteractions: number;
  totalTimeSpent: number; // seconds
  trackingDuration?: number; // seconds (for real-time tracking)
  resourcesLoaded: number;
  uniqueDomains: number;
  dataQuality: "premium" | "standard" | "basic";
  categories: string[];
  hasPerformanceMetrics: boolean;
  hasDeviceSpecs: boolean;
  hasNetworkData: boolean;
  hasInteractionData: boolean;
  dataSize?: number; // bytes
}

export function calculateDataPoints(metrics: DataMetrics): number {
  let points = 0;

  // Base points for issuing credential
  points += 50;

  // Data type multipliers (more demanding = more points)
  
  // Real-time tracking (most demanding - requires active user participation)
  if (metrics.trackingDuration && metrics.trackingDuration > 0) {
    const trackingMinutes = Math.floor(metrics.trackingDuration / 60);
    points += Math.min(200, trackingMinutes * 5); // 5 points per minute, max 200
    points += Math.min(100, metrics.totalInteractions * 0.1); // 0.1 points per interaction, max 100
  }

  // Site count (more sites = more valuable)
  if (metrics.siteCount > 0) {
    if (metrics.siteCount >= 20) {
      points += 150; // Premium: 20+ sites
    } else if (metrics.siteCount >= 10) {
      points += 100; // High: 10-19 sites
    } else if (metrics.siteCount >= 5) {
      points += 50; // Medium: 5-9 sites
    } else {
      points += 25; // Basic: 1-4 sites
    }
  }

  // Interaction data (clicks, scrolls, etc.)
  if (metrics.hasInteractionData && metrics.totalInteractions > 0) {
    if (metrics.totalInteractions >= 1000) {
      points += 100; // Premium interaction data
    } else if (metrics.totalInteractions >= 500) {
      points += 60; // High interaction data
    } else if (metrics.totalInteractions >= 100) {
      points += 30; // Medium interaction data
    } else {
      points += 10; // Basic interaction data
    }
  }

  // Performance metrics (valuable for analytics)
  if (metrics.hasPerformanceMetrics) {
    points += 40;
  }

  // Device specs (useful for market research)
  if (metrics.hasDeviceSpecs) {
    points += 30;
  }

  // Network data (helpful for performance analysis)
  if (metrics.hasNetworkData) {
    points += 25;
  }

  // Resources loaded (indicates browsing depth)
  if (metrics.resourcesLoaded > 0) {
    points += Math.min(50, Math.floor(metrics.resourcesLoaded / 10)); // 1 point per 10 resources, max 50
  }

  // Unique domains (more diverse = more valuable)
  if (metrics.uniqueDomains > 0) {
    if (metrics.uniqueDomains >= 10) {
      points += 60; // Premium diversity
    } else if (metrics.uniqueDomains >= 5) {
      points += 30; // Medium diversity
    } else {
      points += 15; // Basic diversity
    }
  }

  // Data quality multiplier
  if (metrics.dataQuality === "premium") {
    points = Math.floor(points * 1.5); // 50% bonus
  } else if (metrics.dataQuality === "standard") {
    points = Math.floor(points * 1.2); // 20% bonus
  }
  // basic = no multiplier

  // Time spent tracking (more time = more valuable)
  if (metrics.totalTimeSpent > 0) {
    const hours = metrics.totalTimeSpent / 3600;
    points += Math.min(100, Math.floor(hours * 20)); // 20 points per hour, max 100
  }

  // Data size bonus (larger datasets = more comprehensive)
  if (metrics.dataSize) {
    const mb = metrics.dataSize / (1024 * 1024);
    if (mb >= 1) {
      points += 50; // Large dataset bonus
    } else if (mb >= 0.5) {
      points += 25; // Medium dataset bonus
    }
  }

  return Math.max(10, points); // Minimum 10 points
}

export function getDataTypeFromMetrics(metrics: DataMetrics): DataType {
  if (metrics.trackingDuration && metrics.trackingDuration > 0) {
    return "real-time-tracking";
  }
  if (metrics.hasInteractionData && metrics.totalInteractions > 100) {
    return "interaction-data";
  }
  if (metrics.hasPerformanceMetrics && metrics.hasDeviceSpecs) {
    return "comprehensive-session";
  }
  if (metrics.siteCount >= 10) {
    return "browsing-history";
  }
  return "browsing-history";
}

export function getPointsForListing(price: number): number {
  // Listing on marketplace earns bonus points
  // Higher price listings = more points (indicates valuable data)
  if (price >= 1.0) {
    return 100; // Premium listing
  } else if (price >= 0.5) {
    return 60; // High-value listing
  } else if (price >= 0.1) {
    return 30; // Medium-value listing
  } else {
    return 15; // Basic listing
  }
}

export function getPointsForSale(price: number): number {
  // Successful sale earns significant points
  // Scales with sale price
  return Math.floor(price * 200); // 200 points per MOCA
}

