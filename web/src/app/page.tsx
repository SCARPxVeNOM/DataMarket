"use client";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AirKitLogin } from "@/components/AirKitLogin";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "DataMarket",
      subtitle: "Protocol",
      description: "The next-generation data marketplace on Moca Chain. Farm your browsing data with privacy-preserving credentials and trade verified datasets with lightning-fast transactions.",
    },
    {
      title: "AIRKit",
      subtitle: "Identity",
      description: "Decentralized identity with verifiable credentials. Zero-knowledge proofs ensure privacy while building trust across the Moca Network ecosystem.",
    },
    {
      title: "Real-Time",
      subtitle: "Tracking",
      description: "Live data farming with interactive dashboards. Track clicks, scrolls, and browsing activity in real-time before minting verified credentials.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black overflow-hidden">
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

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            <a href="/" className="text-xl font-sm font-bold text-black hover:text-blue-600 transition border-b-2 border-blue-600">
              Home
            </a>
            <a href="/farm" className="text-xl font-sm font-bold text-gray-600 hover:text-blue-600 transition">
              Farm
            </a>
            <a href="/market" className="text-xl font-sm font-bold text-gray-600 hover:text-blue-600 transition">
              Marketplace
            </a>
          </nav>
          
          <ConnectButton />
        </div>
      </div>

      {/* Powered by AIRKit Badge */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-gray-700">Powered by AIRKit Identity</span>
        </div>
      </div>

      {/* Hero Section - Centered */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-8 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title with Slider */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-black mb-2 tracking-tight">
              {slides[currentSlide].title}
            </h1>
            <h2 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              {slides[currentSlide].subtitle}
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
            {slides[currentSlide].description}
          </p>

          {/* Large Centered Login Button */}
          <div className="flex items-center justify-center">
            <div className="scale-150 transform origin-center">
              <AirKitLogin />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="p-3 rounded-full hover:bg-gray-100 transition group"
            aria-label="Previous slide"
          >
            <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="p-3 rounded-full hover:bg-gray-100 transition group"
            aria-label="Next slide"
          >
            <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
    </div>
    </main>
  );
}
