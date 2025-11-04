# DataMarket Protocol 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![Moca Chain](https://img.shields.io/badge/Moca%20Chain-Testnet-blue)](https://moca.network/)
[![AIRKit](https://img.shields.io/badge/AIRKit-Identity-green)](https://docs.moca.network/airkit)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A decentralized data marketplace built on Moca Chain with AIRKit identity verification, enabling privacy-preserving data trading through zero-knowledge proofs and verifiable credentials.**

## 🌟 Overview

DataMarket Protocol is a cutting-edge decentralized application that revolutionizes how personal data is collected, verified, and traded. Built on Moca Chain Testnet with AIRKit integration, it provides a secure, privacy-preserving marketplace where users can monetize their browsing data while maintaining complete control over their privacy.

### 🎯 Key Features

- **🔐 AIRKit Identity Integration**: Single sign-on across Moca Network with embedded wallet
- **📊 Real-Time Data Collection**: Comprehensive browser activity tracking and analytics
- **🛡️ Zero-Knowledge Proofs**: Privacy-preserving verification without revealing raw data
- **💎 Verifiable Credentials**: W3C-compliant credentials for identity and data attributes
- **🌐 Decentralized Storage**: IPFS integration via Pinata for immutable data storage
- **💰 Cryptocurrency Trading**: MOCA token-based marketplace with smart contracts
- **🎮 Gamified Credential Farming**: Points, streaks, badges, and leaderboard system
- **📈 Dynamic Point System**: Points based on data complexity and marketplace activity
- **🏆 Real-Time Leaderboard**: Blockchain-integrated rankings updated every 30 seconds
- **🎨 Modern UI/UX**: Clean, responsive design with real-time tracking dashboard

## 🏗️ Architecture

```
DataMarket Protocol
├── 🌐 Frontend (Next.js 15)
│   ├── Homepage - AIRKit login & protocol overview
│   ├── Farm - Data collection & credential issuance
│   ├── Marketplace - Dataset trading & verification
│   └── Seasons - Gamification hub (points, badges, leaderboard)
├── ⛓️ Blockchain (Moca Chain Testnet)
│   ├── Smart Contracts - DataMarket.sol
│   ├── Token Economics - MOCA cryptocurrency
│   ├── Decentralized Storage - IPFS integration
│   └── Real-Time Leaderboard - On-chain rankings
├── 🔑 Identity Layer (AIRKit)
│   ├── SSO Authentication - Cross-app login
│   ├── Embedded Wallet - AIR smart accounts
│   └── Credential System - Verifiable credentials
├── 🎮 Gamification System
│   ├── Point Calculation - Dynamic scoring based on data complexity
│   ├── Streak System - Daily credential issuance bonuses
│   ├── Badge Collection - Achievement milestones
│   └── Leaderboard - Real-time blockchain rankings
└── 🛡️ Privacy Layer
    ├── Zero-Knowledge Proofs - Selective disclosure
    ├── Consent Management - GDPR/CCPA compliance
    └── Data Encryption - Privacy-preserving verification
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Moca Chain Testnet MOCA tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SCARPxVeNOM/DataMarket.git
   cd DataMarket
   ```

2. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   # WalletConnect Configuration
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   
   # AIRKit Configuration
   NEXT_PUBLIC_AIRKIT_PARTNER_ID=your_partner_id
   AIRKIT_ISSUER_DID=your_issuer_did
   AIRKIT_VERIFIER_DID=your_verifier_did
   
   # Pinata IPFS Configuration
   PINATA_JWT=your_pinata_jwt
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Journey

### For Data Sellers (Credential Farmers)

1. **🔑 Login with AIR** - Single sign-on authentication
2. **✅ Verify Identity** - Complete AIRKit humanhood verification
3. **📊 Start Data Collection** - Real-time browser activity tracking
4. **🛡️ Issue Credentials** - Generate privacy-preserving proofs → **Earn points based on data complexity**
5. **📤 Upload to IPFS** - Decentralized storage with metadata
6. **💰 List on Marketplace** - Set price and sell your data → **Earn bonus listing points**
7. **🏆 Track Progress** - View points, streaks, badges, and leaderboard ranking

### For Data Buyers

1. **🔍 Browse Marketplace** - Discover verified datasets
2. **🔐 Verify as Buyer** - Complete identity verification
3. **💳 Purchase Dataset** - Pay with MOCA tokens
4. **📥 Access Data** - Download from IPFS with credentials

## 🎮 Gamification System

### How Points Work

DataMarket Protocol features a comprehensive gamification system that rewards users for credential farming and marketplace participation:

#### 1. **Data Farming & Complexity** (25-400+ points)
- **Basic Datasets** (1-4 sites): 25 points
- **Medium Datasets** (5-9 sites): 50 points
- **High Datasets** (10-19 sites): 100 points
- **Premium Datasets** (20+ sites): 150 points
- **Real-Time Tracking**: 5 points/minute (max 200) + 0.1 points/interaction
- **Interaction Data**: 10-100 points based on clicks/scrolls
- **Performance Metrics**: +40 points
- **Device Specs**: +30 points
- **Network Data**: +25 points
- **Data Quality Multiplier**: Premium (1.5x), Standard (1.2x), Basic (1x)

#### 2. **Credential Issuance** (50+ base points)
- Base points: 50
- Quality multipliers: Premium (1.5x), Standard (1.2x)
- Real-time tracking sessions earn bonus points
- Points scale with data complexity and diversity

#### 3. **Daily Streaks & Bonuses**
- Maintain daily streak by issuing credentials
- Streak bonus: +5 points per day (max +100)
- Consistent engagement multiplies earnings
- Unlocks special badges (e.g., 7-Day Streak)

#### 4. **Marketplace Activity**
- **Listing Bonus**: 15-100 points based on listing price
  - Basic (0.01-0.09 MOCA): 15 points
  - Medium (0.1-0.49 MOCA): 30 points
  - High (0.5-0.99 MOCA): 60 points
  - Premium (1.0+ MOCA): 100 points
- **Sale Bonus**: 200 points per MOCA earned

#### 5. **Badges & Milestones**
- **Starter**: 100 points
- **Grinder**: 500 points
- **Master Farmer**: 1000 points
- **7-Day Streak**: Issue credentials 7 days in a row
- **Explorer**: Collected data from 20+ sites
- **Highly Interactive**: 1000+ interactions tracked

### Seasons Page Features

The **Seasons** page (`/seasons`) provides a comprehensive gamification hub:

- **📊 Scorecards**: Total points, daily streak, badge count
- **📈 Next Badge Progress**: Visual progress bar toward next achievement
- **🔥 Streak Bonus Indicator**: Shows bonus points for next credential
- **📋 Recent Activity Feed**: Last 5 actions with points earned
- **🏆 Live Leaderboard**: Real-time blockchain rankings (updates every 30s)
- **📖 How Points Work**: Collapsible guide explaining the point system

### Real-Time Blockchain Integration

- **Live Leaderboard**: Fetched from Moca Chain contract
- **Auto-Refresh**: Updates every 30 seconds
- **No Mock Data**: All rankings come from on-chain data
- **User Highlighting**: Your position highlighted in blue
- **Medal System**: 🥇🥈🥉 for top 3 positions

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + Wagmi hooks
- **UI Components**: Custom components with modern design

### Blockchain
- **Network**: Moca Chain Testnet (Chain ID: 222888)
- **Smart Contracts**: Solidity with Hardhat
- **Wallet Integration**: Wagmi v2 + RainbowKit
- **Ethereum Library**: Viem v2

### Identity & Privacy
- **Identity Provider**: AIRKit SDK (@mocanetwork/airkit)
- **Credentials**: W3C Verifiable Credentials
- **Zero-Knowledge**: Custom ZK proof implementation
- **Consent**: GDPR/CCPA compliant consent management

### Storage & Infrastructure
- **Decentralized Storage**: IPFS via Pinata
- **API Routes**: Next.js API with TypeScript
- **Authentication**: JWT-based backend verification

## 📊 Smart Contract Details

**Contract Address**: `0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F`  
**Network**: Moca Chain Testnet  
**Explorer**: [View Contract](https://testnet-explorer.mocachain.org/address/0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F)

### Key Functions

```solidity
// List a dataset for sale
function list(string memory uri, uint256 priceWei) external

// Purchase a dataset
function buy(uint256 id) external payable

// Remove your listing
function delist(uint256 id) external

// Check dataset access
function canAccess(uint256 id, address user) external view returns (bool)
```

## 🛡️ Privacy & Security

### Zero-Knowledge Proofs
Our system generates privacy-preserving proofs that verify data quality without revealing sensitive information:

- ✅ **Site Count Proof**: "User visited 1,250+ websites"
- ✅ **Category Proof**: "Data includes tech, ecommerce, finance categories"
- ✅ **Time Range Proof**: "Data collected in Q4 2024"
- ❌ **Raw URLs**: Actual browsing history remains encrypted

### Verifiable Credentials
W3C-compliant credentials provide portable, tamper-proof verification:

- **Identity Credentials**: Humanhood verification
- **Data Quality Credentials**: Dataset attributes and metrics
- **Consent Credentials**: GDPR/CCPA compliance records
- **Reputation Credentials**: Cross-app trust scores

### Data Protection
- **Encryption**: All sensitive data encrypted before storage
- **Selective Disclosure**: Users control what information to reveal
- **Consent Management**: Granular consent tracking and revocation
- **Anonymization**: Personal identifiers removed from datasets

## 🌐 Network Configuration

### Moca Chain Testnet
```javascript
{
  chainId: 222888,
  name: "Moca Chain Testnet",
  rpcUrl: "https://testnet-rpc.mocachain.org",
  explorerUrl: "https://testnet-explorer.mocachain.org",
  nativeCurrency: {
    name: "MOCA",
    symbol: "MOCA",
    decimals: 18
  }
}
```

### Getting Testnet Tokens
1. Visit [Moca Faucet](https://docs.moca.network/testnet)
2. Connect your wallet
3. Request testnet MOCA tokens

## 🎨 Design System

### Color Palette
- **Primary**: Violet gradients (`from-violet-600 to-purple-600`)
- **Secondary**: Green gradients (`from-green-600 to-blue-600`)
- **Background**: Clean white with subtle grid pattern
- **Text**: High contrast dark gray (`text-gray-900`)

### Typography
- **Headings**: Bold, tight tracking (`font-black tracking-tight`)
- **Body**: Clean, readable sans-serif
- **Code**: Monospace for technical content

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with validation states
- **Navigation**: Consistent header across all pages

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Smart Contracts
npm run compile      # Compile contracts
npm run deploy       # Deploy to testnet
npm run test         # Run contract tests
```

### Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── farm/page.tsx      # Data farming
│   │   ├── market/page.tsx    # Marketplace
│   │   ├── seasons/page.tsx   # Gamification hub
│   │   ├── api/               # API routes
│   │   │   ├── dataset/       # Dataset endpoints
│   │   │   ├── leaderboard/   # Leaderboard API
│   │   │   ├── pinata/        # IPFS upload
│   │   │   └── airkit/        # Credential issuance
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── AirKitLogin.tsx   # AIRKit authentication
│   │   ├── AirWallet.tsx     # Wallet management
│   │   └── VerifyIdentity.tsx # Identity verification
│   ├── contexts/              # React contexts
│   │   ├── AirKitContext.tsx # Global AIRKit state
│   │   └── GameContext.tsx   # Gamification state
│   └── lib/                   # Utilities
│       ├── airkit.ts         # AIRKit service
│       ├── zk-proofs.ts      # Zero-knowledge proofs
│       ├── point-system.ts   # Point calculation engine
│       ├── contract.ts       # Contract ABI
│       └── selective-disclosure.ts # Privacy features
├── contracts/                 # Smart contracts
│   └── DataMarket.sol        # Main marketplace contract
└── scripts/                   # Deployment scripts
    └── deploy.js             # Contract deployment
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub repository**
2. **Configure environment variables**
3. **Deploy automatically on push**

### Smart Contract Deployment

```bash
# Deploy to Moca Chain Testnet
npm run deploy

# Verify contract on explorer
npx hardhat verify --network mocaTestnet <CONTRACT_ADDRESS>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- [AIRKit Integration Guide](docs/airkit-integration.md)
- [Smart Contract Documentation](docs/smart-contracts.md)
- [API Reference](docs/api-reference.md)
- [Privacy & Security](docs/privacy-security.md)

## 🔗 Links

- **Live Demo**: [data-market-nu.vercel.app](https://data-market-nu.vercel.app)
- **GitHub Repository**: [SCARPxVeNOM/DataMarket](https://github.com/SCARPxVeNOM/DataMarket)
- **Documentation**: [Moca Network Docs](https://docs.moca.network)
- **AIRKit SDK**: [AIRKit Documentation](https://docs.moca.network/airkit)
- **Discord**: [Moca Community](https://discord.gg/moca)
- **Twitter**: [@MocaNetwork](https://twitter.com/MocaNetwork)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Moca Network** - For the innovative blockchain infrastructure
- **AIRKit Team** - For the comprehensive identity solution
- **Pinata** - For reliable IPFS gateway services
- **Vercel** - For seamless deployment platform

---

**Built with ❤️ on Moca Chain Testnet using AIRKit Identity**

*Empowering users to own and monetize their data while preserving privacy through cutting-edge zero-knowledge technology.*
