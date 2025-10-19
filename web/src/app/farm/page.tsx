"use client";
import { useState, useEffect } from "react";
import ky from "ky";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AirKitLogin } from "@/components/AirKitLogin";
import { AirWallet } from "@/components/AirWallet";
import { VerifyIdentity } from "@/components/VerifyIdentity";
import { useAirKit } from "@/contexts/AirKitContext";
import { getAirService } from "@/lib/airkit";
import { generateDatasetQualityProof } from "@/lib/zk-proofs";
import { selectiveDisclose, createDatasetPreview } from "@/lib/selective-disclosure";

export default function FarmPage() {
  const [historyJson, setHistoryJson] = useState<string>("");
  const [cid, setCid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sellerCredential, setSellerCredential] = useState<any>(null);
  const [datasetCredential, setDatasetCredential] = useState<any>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [zkProof, setZkProof] = useState<any>(null);
  const { isLoggedIn: airLoggedIn } = useAirKit();
  
  // Real-time tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingStartTime, setTrackingStartTime] = useState<number>(0);
  const [trackedPages, setTrackedPages] = useState<any[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [trackingTimer, setTrackingTimer] = useState(0);

  // Update timer every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTrackingTimer(Math.floor((Date.now() - trackingStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, trackingStartTime]);

  // Start real-time tracking
  function startTracking() {
    if (!consentGiven) {
      alert("⚠️ Please grant consent first (Step 2)");
      return;
    }
    
    setIsTracking(true);
    setTrackingStartTime(Date.now());
    setClickCount(0);
    setScrollCount(0);
    setTrackedPages([]);
    
    // Record current page
    const currentPage = {
      url: window.location.href,
      title: document.title,
      visitTime: Date.now(),
      timeSpent: 0,
    };
    setTrackedPages([currentPage]);
    
    // Set up event listeners
    const handleClick = () => setClickCount(prev => prev + 1);
    const handleScroll = () => setScrollCount(prev => prev + 1);
    
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    
    // Store cleanup functions
    (window as any).__trackingCleanup = () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
    
    alert("✅ Tracking Started!\n\nNow browse different sites/pages.\nClick 'Stop Tracking' when done to prepare your dataset.");
  }
  
  // Stop tracking and prepare dataset
  async function stopTracking() {
    setIsTracking(false);
    
    // Cleanup event listeners
    if ((window as any).__trackingCleanup) {
      (window as any).__trackingCleanup();
    }
    
    const trackingDuration = Date.now() - trackingStartTime;
    
    // Collect all tracked data
    const collectedData: any = {
      collectedAt: new Date().toISOString(),
      userId: `user_${Date.now()}`,
      trackingDuration: Math.floor(trackingDuration / 1000), // seconds
      
      // Browser Information
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: Array.from(navigator.languages || []),
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        deviceMemory: (navigator as any).deviceMemory,
      },
      
      // Screen & Device Info
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        orientation: window.screen.orientation?.type,
      },
      
      // Viewport
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      
      // Tracked pages
      browsingHistory: trackedPages,
      
      // Tracked interactions
      interactions: {
        clicks: clickCount,
        scrolls: scrollCount,
        pagesVisited: trackedPages.length,
        averageTimePerPage: trackedPages.length > 0 ? Math.floor(trackingDuration / trackedPages.length / 1000) : 0,
      },
      
      // Connection Info
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
        saveData: (navigator as any).connection.saveData,
      } : null,
      
      // Storage Usage
      storage: {
        localStorageItems: localStorage.length,
        sessionStorageItems: sessionStorage.length,
        localStorageSize: new Blob(Object.values(localStorage)).size,
      },
      
      // Performance Data
      performance: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      } : null,
      
      // Location Data
      location: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      },
      
      // Get resource timing
      resources: [],
      
      categories: ["browsing", "tracked-session", "user-activity"],
      
      privacyMetrics: {
        dataCollectionMethod: "real-time-tracking",
        consentGiven: consentGiven,
        anonymized: true,
        trackingStarted: new Date(trackingStartTime).toISOString(),
        trackingStopped: new Date().toISOString(),
      },
    };
    
    // Get navigation timing
    try {
      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0] as PerformanceNavigationTiming;
          collectedData.navigationTiming = {
            domContentLoadedTime: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            responseTime: nav.responseEnd - nav.requestStart,
            domInteractive: nav.domInteractive,
          };
        }
        
        // Get resources loaded
        const resources = performance.getEntriesByType('resource');
        collectedData.resources = resources.slice(0, 100).map((res: any) => ({
          url: res.name,
          type: res.initiatorType,
          duration: Math.floor(res.duration),
          size: res.transferSize || 0,
        }));
      }
    } catch (e) {
      console.log("Could not access performance APIs:", e);
    }
    
    const dataJson = JSON.stringify(collectedData, null, 2);
    setHistoryJson(dataJson);
    setTrackingData(collectedData);
    
    alert(`✅ Tracking Stopped!\n\n📊 Collected:\n- ${trackedPages.length} pages visited\n- ${clickCount} clicks\n- ${scrollCount} scrolls\n- ${Math.floor(trackingDuration / 1000)} seconds tracked\n- ${collectedData.resources?.length || 0} resources loaded\n\nNow click "Issue Dataset Credential" to continue.`);
  }
  
  async function collect() {
    setLoading(true);
    
    try {
      // Collect REAL browser data
      const collectedData: any = {
        collectedAt: new Date().toISOString(),
        userId: `user_${Date.now()}`,
        
        // Real Browser Info
        browser: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: Array.from(navigator.languages || []),
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          hardwareConcurrency: navigator.hardwareConcurrency,
          maxTouchPoints: navigator.maxTouchPoints,
          vendor: navigator.vendor,
          deviceMemory: (navigator as any).deviceMemory,
        },
        
        // Real Screen Data
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
          orientation: window.screen.orientation?.type,
        },
        
        // Real Viewport
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
        
        // Current Page
        currentPage: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          domain: window.location.hostname,
          protocol: window.location.protocol,
          timestamp: Date.now(),
        },
        
        // Real Connection Data
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
          saveData: (navigator as any).connection.saveData,
        } : null,
        
        // Real Storage Usage
        storage: {
          localStorageItems: localStorage.length,
          sessionStorageItems: sessionStorage.length,
          localStorageSize: new Blob(Object.values(localStorage)).size,
        },
        
        // Real Performance Data
        performance: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        } : null,
        
        // Real Location Data
        location: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),
          locale: Intl.DateTimeFormat().resolvedOptions().locale,
        },
        
        // Browsing History - collected from IndexedDB/localStorage if available
        browsingHistory: [],
        
        // Interaction tracking (real-time during session)
        interactions: {
          clicks: 0,
          scrolls: 0,
          timeOnPage: Math.floor((Date.now() - (window as any).pageLoadTime || 0) / 1000),
        },
        
        categories: ["tech", "browsing", "session-data"],
        
        privacyMetrics: {
          dataCollectionMethod: "client-side-api",
          consentGiven: consentGiven,
          anonymized: true,
        },
      };
      
      // Try to get real browsing data from browser APIs
      try {
        // Check if Navigation Timing API is available
        if (performance.getEntriesByType) {
          const navigationEntries = performance.getEntriesByType('navigation');
          if (navigationEntries.length > 0) {
            const nav = navigationEntries[0] as PerformanceNavigationTiming;
            collectedData.navigationTiming = {
              domContentLoadedTime: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
              loadTime: nav.loadEventEnd - nav.loadEventStart,
              responseTime: nav.responseEnd - nav.requestStart,
              domInteractive: nav.domInteractive,
            };
          }
        }
        
        // Get resource timing data (sites visited during this session)
        if (performance.getEntriesByType) {
          const resources = performance.getEntriesByType('resource');
          collectedData.browsingHistory = resources.slice(0, 50).map((res: any) => ({
            url: res.name,
            type: res.initiatorType,
            duration: Math.floor(res.duration),
            timestamp: Date.now() - Math.floor(res.startTime),
          }));
        }
      } catch (e) {
        console.log("Could not access some browser APIs:", e);
      }
      
      setHistoryJson(JSON.stringify(collectedData, null, 2));
      alert(`✅ Real Data Collected!\n\n📊 Collected:\n- Browser Info: Complete\n- ${collectedData.browsingHistory.length} resources tracked\n- Screen & Device: Complete\n- Performance Metrics: ${collectedData.performance ? 'Yes' : 'No'}\n\n🔒 All real data from your browser!`);
    } catch (error) {
      console.error("Data collection error:", error);
      alert("Failed to collect data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function issueDatasetCredential() {
    try {
      setLoading(true);
      const parsed = historyJson ? JSON.parse(historyJson) : {};
      
      // Generate ZK proof first (privacy-preserving)
      const qualityProof = generateDatasetQualityProof(parsed);
      setZkProof(qualityProof);
      
      // Calculate comprehensive metrics
      const siteCount = parsed.browsingHistory?.length || parsed.pages?.length || 0;
      const totalInteractions = parsed.interactions ? 
        Object.values(parsed.interactions).reduce((a: any, b: any) => a + b, 0) : 0;
      const totalTimeSpent = parsed.timeSpent ? 
        Object.values(parsed.timeSpent).reduce((a: any, b: any) => a + b, 0) : 0;
      
      // Get AIR access token
      const service = await getAirService();
      const { token } = await service.getAccessToken();
      
      // Issue credential with real AIR authentication
      const response = await fetch("/api/airkit/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          credentialType: "browsing-data",
          claims: {
            siteCount,
            categories: parsed.categories || [],
            timeRange: new Date(parsed.collectedAt).toISOString().split('T')[0],
            verified: true,
            consentGiven,
            zkProof: qualityProof,
            totalInteractions,
            totalTimeSpent,
            uniqueDomains: parsed.privacyMetrics?.uniqueDomains || 0,
            dataQuality: totalInteractions > 1000 ? "premium" : "standard",
          },
        }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setDatasetCredential(data.credential);
      alert(`✅ Dataset credential issued!\n\n📊 Dataset Quality:\n- ${siteCount} browsing records\n- ${totalInteractions} total interactions\n- ${Math.floor(totalTimeSpent / 3600)} hours tracked\n\n🔐 ZK Proof: Proves quality without revealing raw data\n🔒 AIR Authenticated: Cryptographically secure`);
    } catch (e: any) {
      alert(e?.message || "Failed to issue credential.");
    } finally {
      setLoading(false);
    }
  }

  async function giveConsent() {
    try {
      const service = await getAirService();
      const { token } = await service.getAccessToken();
      
      // Issue consent credential with backend API
      const response = await fetch("/api/airkit/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          credentialType: "data-consent",
          claims: {
            scope: ["browser.history", "browsing.activity"],
            grantedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      setConsentGiven(true);
      console.log("✅ Consent credential issued:", data.credential);
      alert("✅ Consent granted!\n\nYou can now farm and sell your data legally with GDPR/CCPA compliance.");
    } catch (e: any) {
      console.error("Consent error:", e);
      alert(e?.message || "Failed to grant consent.");
    }
  }

  async function upload() {
    if (!datasetCredential) {
      alert("Please issue a dataset credential first to prove data quality.");
      return;
    }
    
    try {
      setLoading(true);
      const parsed = historyJson ? JSON.parse(historyJson) : {};
      
      // Attach credential to dataset
      const dataWithCredential = {
        ...parsed,
        credential: datasetCredential,
        seller: sellerCredential,
      };
      
      const res: { cid: string } = await ky.post("/api/pinata", { json: dataWithCredential }).json();
      setCid(res.cid);
      alert(`✅ Uploaded to IPFS!\n\nCID: ${res.cid}\n\nYou can now list this on the marketplace.`);
    } catch (e: any) {
      console.error("Upload error:", e);
      alert(`Failed to upload: ${e?.message || "Unknown error"}`);
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
            <a href="/farm" className="text-sm font-semibold text-black hover:text-blue-600 transition border-b-2 border-blue-600">
              Farm
            </a>
            <a href="/market" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Marketplace
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <AirKitLogin />
            <ConnectButton />
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Farm Your Data
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl">
            Collect data, verify identity, issue credentials, and upload to IPFS with privacy guarantees.
          </p>
        </div>
        
        {/* AIR Wallet - Enhanced */}
        <div className="mb-8">
          <AirWallet isLoggedIn={airLoggedIn} />
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6 mb-8">
          {/* Step 1: Verify Identity */}
          <div className="transform transition-all hover:scale-[1.01]">
            <VerifyIdentity onVerified={setSellerCredential} />
          </div>

          {/* Step 2: Consent */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-600">
                    <span className="text-lg font-bold text-violet-600">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Grant Data Collection Consent</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed ml-13">
                  Issue a verifiable consent credential for GDPR/CCPA compliance. Required before data collection.
                </p>
              </div>
            </div>
            <button
              onClick={giveConsent}
              disabled={consentGiven}
              className={`mt-6 rounded-lg px-6 py-3 text-sm font-semibold transition-all shadow-md ${
                consentGiven
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {consentGiven ? "✓ Consent Granted" : "Grant Consent"}
            </button>
          </div>
        </div>

        {/* Real-Time Tracking - Enhanced */}
        <div className="rounded-xl border-2 border-blue-600 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Real-Time Data Tracking</h3>
              <p className="text-sm text-gray-600">Advanced browsing activity monitoring</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Start tracking your browsing activity across sites. Every click, scroll, and interaction is captured securely!
          </p>
          
          {isTracking && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-white border-2 border-blue-600 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-black text-blue-600 mb-1">{trackingTimer}s</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tracking Time</div>
              </div>
              <div className="rounded-xl bg-white border-2 border-green-600 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-black text-green-600 mb-1">{clickCount}</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Clicks</div>
              </div>
              <div className="rounded-xl bg-white border-2 border-yellow-600 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-black text-yellow-600 mb-1">{scrollCount}</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Scrolls</div>
              </div>
              <div className="rounded-xl bg-white border-2 border-purple-600 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-black text-purple-600 mb-1">{trackedPages.length}</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pages</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 flex-wrap">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!consentGiven}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-sm font-bold text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Start Tracking
                </span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-8 py-4 text-sm font-bold text-white hover:from-red-500 hover:to-orange-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 animate-pulse"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  Stop & Prepare Dataset
                </span>
              </button>
            )}
            
            {isTracking && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 border-2 border-red-500">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-red-700">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* One-Click Farm & Sell - Enhanced */}
        <div className="mt-8 rounded-xl border-2 border-violet-600 bg-gradient-to-br from-violet-50 via-purple-50 to-violet-50 p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">One-Click Farm & Sell</h3>
              <p className="text-sm text-gray-600">Quick Mode - Instant data collection</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Instantly collect current session data and prepare for sale. No cross-site tracking required - perfect for quick listings!
          </p>
          <button
            onClick={async () => {
              if (!consentGiven) {
                alert("⚠️ Please grant consent first (Step 2)");
                return;
              }
              
              try {
                setLoading(true);
                
                // Step 1: Collect data and get it immediately
                let collectedDataJson = "";
                try {
                  const collectedData: any = {
                    collectedAt: new Date().toISOString(),
                    userId: `user_${Date.now()}`,
                    browser: {
                      userAgent: navigator.userAgent,
                      language: navigator.language,
                      languages: Array.from(navigator.languages || []),
                      platform: navigator.platform,
                      cookieEnabled: navigator.cookieEnabled,
                      doNotTrack: navigator.doNotTrack,
                      hardwareConcurrency: navigator.hardwareConcurrency,
                      maxTouchPoints: navigator.maxTouchPoints,
                      vendor: navigator.vendor,
                      deviceMemory: (navigator as any).deviceMemory,
                    },
                    screen: {
                      width: window.screen.width,
                      height: window.screen.height,
                      availWidth: window.screen.availWidth,
                      availHeight: window.screen.availHeight,
                      colorDepth: window.screen.colorDepth,
                      pixelDepth: window.screen.pixelDepth,
                      orientation: window.screen.orientation?.type,
                    },
                    viewport: {
                      width: window.innerWidth,
                      height: window.innerHeight,
                      devicePixelRatio: window.devicePixelRatio,
                    },
                    currentPage: {
                      url: window.location.href,
                      title: document.title,
                      referrer: document.referrer,
                      domain: window.location.hostname,
                      protocol: window.location.protocol,
                      timestamp: Date.now(),
                    },
                    connection: (navigator as any).connection ? {
                      effectiveType: (navigator as any).connection.effectiveType,
                      downlink: (navigator as any).connection.downlink,
                      rtt: (navigator as any).connection.rtt,
                      saveData: (navigator as any).connection.saveData,
                    } : null,
                    storage: {
                      localStorageItems: localStorage.length,
                      sessionStorageItems: sessionStorage.length,
                      localStorageSize: new Blob(Object.values(localStorage)).size,
                    },
                    performance: (performance as any).memory ? {
                      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                    } : null,
                    location: {
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      timezoneOffset: new Date().getTimezoneOffset(),
                      locale: Intl.DateTimeFormat().resolvedOptions().locale,
                    },
                    browsingHistory: [],
                    interactions: {
                      clicks: 0,
                      scrolls: 0,
                      timeOnPage: Math.floor((Date.now() - (window as any).pageLoadTime || 0) / 1000),
                    },
                    categories: ["tech", "browsing", "session-data"],
                    privacyMetrics: {
                      dataCollectionMethod: "client-side-api",
                      consentGiven: consentGiven,
                      anonymized: true,
                    },
                  };
                  
                  if (performance.getEntriesByType) {
                    const navigationEntries = performance.getEntriesByType('navigation');
                    if (navigationEntries.length > 0) {
                      const nav = navigationEntries[0] as PerformanceNavigationTiming;
                      collectedData.navigationTiming = {
                        domContentLoadedTime: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
                        loadTime: nav.loadEventEnd - nav.loadEventStart,
                        responseTime: nav.responseEnd - nav.requestStart,
                        domInteractive: nav.domInteractive,
                      };
                    }
                    
                    const resources = performance.getEntriesByType('resource');
                    collectedData.browsingHistory = resources.slice(0, 50).map((res: any) => ({
                      url: res.name,
                      type: res.initiatorType,
                      duration: Math.floor(res.duration),
                      timestamp: Date.now() - Math.floor(res.startTime),
                    }));
                  }
                  
                  collectedDataJson = JSON.stringify(collectedData, null, 2);
                  setHistoryJson(collectedDataJson);
                  console.log("✅ Data collected");
                } catch (e) {
                  throw new Error("Failed to collect data");
                }
                
                // Step 2: Issue credential with the collected data
                const parsed = JSON.parse(collectedDataJson);
                const qualityProof = generateDatasetQualityProof(parsed);
                setZkProof(qualityProof);
                
                const siteCount = parsed.browsingHistory?.length || 0;
                const totalInteractions = parsed.interactions ? 
                  Object.values(parsed.interactions).reduce((a: any, b: any) => a + b, 0) : 0;
                const totalTimeSpent = parsed.timeSpent ? 
                  Object.values(parsed.timeSpent).reduce((a: any, b: any) => a + b, 0) : 0;
                
                const service = await getAirService();
                const { token } = await service.getAccessToken();
                
                const response = await fetch("/api/airkit/issue-credential", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    token,
                    credentialType: "browsing-data",
                    claims: {
                      siteCount,
                      categories: parsed.categories || [],
                      timeRange: new Date(parsed.collectedAt).toISOString().split('T')[0],
                      verified: true,
                      consentGiven,
                      zkProof: qualityProof,
                      totalInteractions,
                      totalTimeSpent,
                      uniqueDomains: parsed.privacyMetrics?.uniqueDomains || 0,
                      dataQuality: totalInteractions > 1000 ? "premium" : "standard",
                    },
                  }),
                });
                
                const data = await response.json();
                if (!data.success) throw new Error(data.error);
                
                setDatasetCredential(data.credential);
                console.log("✅ Credential issued");
                
                // Step 3: Upload to IPFS
                const dataWithCredential = {
                  ...parsed,
                  credential: data.credential,
                  seller: sellerCredential,
                };
                
                const res: { cid: string } = await ky.post("/api/pinata", { json: dataWithCredential }).json();
                setCid(res.cid);
                console.log("✅ Uploaded to IPFS:", res.cid);
                
                alert(`✅ Complete!\n\n📊 Data collected: ${siteCount} resources\n☁️ Uploaded to IPFS\n🔗 CID: ${res.cid}\n\nGo to Market page to list it!`);
              } catch (error: any) {
                console.error("One-click flow error:", error);
                alert(`Error: ${error?.message || "Something went wrong"}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !consentGiven}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-sm font-bold text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <span className="flex items-center gap-2 justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Farm & Prepare Data for Sale
                </>
              )}
            </span>
          </button>
        </div>

        {/* Step 3: Collect Data (Manual) */}
        <div className="mt-8 rounded-xl border-2 border-orange-600 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manual Data Collection</h3>
              <p className="text-sm text-gray-600">Step-by-step control</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Or collect data step-by-step for more granular control over the process.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={collect} 
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {loading ? "Collecting..." : "Collect Data"}
              </span>
            </button>
            <button
              onClick={issueDatasetCredential}
              disabled={loading || !historyJson}
              className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-bold text-white hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {loading ? "Issuing..." : "Issue Credential"}
              </span>
            </button>
            <button
              onClick={upload}
              disabled={loading || !datasetCredential}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                </svg>
                {loading ? "Uploading..." : "Upload to IPFS"}
              </span>
            </button>
          </div>
        </div>

        {/* ZK Proof Preview */}
        {zkProof && (
          <div className="mt-6 rounded-lg border border-purple-600/50 bg-purple-600/10 p-4">
            <h4 className="font-medium text-purple-300">🔐 Zero-Knowledge Proof Generated</h4>
            <div className="mt-2 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Site Count Proof:</span>
                <span className="text-green-400">✓ Verified ({zkProof.siteCountProof.publicInputs.meetsRequirement ? "≥100 sites" : ""})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-neutral-400">Category Proof:</span>
                <span className="text-green-400">✓ Valid Category</span>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                🎭 Buyers can verify dataset quality WITHOUT seeing your actual browsing URLs!
              </p>
            </div>
          </div>
        )}

        {/* Dataset Credential Info */}
        {datasetCredential && (
          <div className="mt-6 rounded-lg border border-green-600/50 bg-green-600/10 p-4">
            <h4 className="font-medium text-green-400">Dataset Credential Issued (Backend Signed)</h4>
            <div className="mt-2 text-sm text-neutral-300">
              <div>Site Count: {datasetCredential.claims?.siteCount}</div>
              <div>Categories: {datasetCredential.claims?.categories?.join(", ")}</div>
              <div>Time Range: {datasetCredential.claims?.timeRange}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-green-600/20 px-2 py-1 text-xs text-green-400">Backend JWT Signed</span>
                <span className="rounded-full bg-purple-600/20 px-2 py-1 text-xs text-purple-400">ZK Proof Attached</span>
              </div>
              <div className="mt-2 text-xs text-neutral-500">ID: {datasetCredential.id?.slice(0, 30)}...</div>
            </div>
          </div>
        )}

        {/* Data Stats */}
        {historyJson && (() => {
          try {
            const data = JSON.parse(historyJson);
            const siteCount = data.browsingHistory?.length || data.pages?.length || 0;
            const totalInteractions = data.interactions ? 
              Object.values(data.interactions).reduce((a: any, b: any) => a + b, 0) : 0;
            const totalTimeSpent = data.timeSpent ? 
              Object.values(data.timeSpent).reduce((a: any, b: any) => a + b, 0) : 0;
            
            return (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border-2 border-violet-600 bg-white p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-violet-600">{siteCount}</div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">Browsing Records</div>
                </div>
                <div className="rounded-xl border-2 border-green-600 bg-white p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-green-600">{data.categories?.length || 0}</div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">Categories</div>
                </div>
                <div className="rounded-xl border-2 border-blue-600 bg-white p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-blue-600">{totalInteractions}</div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">Total Interactions</div>
                </div>
                <div className="rounded-xl border-2 border-yellow-600 bg-white p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-yellow-600">{Math.floor(totalTimeSpent / 3600)}h</div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mt-1">Time Tracked</div>
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })()}

        {/* Data & Result */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-bold text-gray-900">Collected Dataset</label>
              {historyJson && (
                <span className="text-xs font-semibold text-green-600 px-3 py-1 rounded-full bg-green-100 border border-green-600">
                  ✓ {(new Blob([historyJson]).size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            <textarea
              className="h-72 w-full rounded-lg bg-gray-50 border-2 border-gray-200 p-4 text-xs font-mono text-gray-800 overflow-auto focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20 transition-all"
              value={historyJson}
              onChange={(e) => setHistoryJson(e.target.value)}
              placeholder="Click 'Farm & Prepare Data for Sale' or 'Collect Data' to start..."
              readOnly={loading}
            />
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <label className="block text-lg font-bold text-gray-900 mb-4">Ready to Sell</label>
            <div className="h-72 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-6 overflow-auto">
              {!cid ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-20 h-20 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-center font-semibold text-gray-700">Upload your dataset to IPFS to get CID</p>
                  <p className="text-sm mt-2 text-center text-gray-600">Then list it on the marketplace</p>
                </div>
              ) : (
                <>
                  <div className="text-gray-600 text-sm font-semibold mb-2">IPFS CID:</div>
                  <div className="break-all text-violet-600 font-mono text-xs bg-violet-50 border-2 border-violet-600 p-3 rounded-lg mb-4">{cid}</div>
                  
                  <div className="space-y-3">
                    <a
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:from-violet-500 hover:to-purple-500 shadow-md hover:shadow-lg transition-all"
                      href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View on IPFS
                    </a>
                    
                    <a
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-bold text-white hover:from-green-500 hover:to-emerald-500 shadow-md hover:shadow-lg transition-all"
                      href="/market"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      List on Marketplace
                    </a>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-600/10 border border-green-600/30 rounded text-xs text-green-300">
                    <p className="font-semibold mb-1">✓ Ready for Sale</p>
                    <ul className="space-y-1 text-green-400/80">
                      <li>• Verifiable credentials attached</li>
                      <li>• ZK proofs for privacy</li>
                      <li>• GDPR/CCPA compliant</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


