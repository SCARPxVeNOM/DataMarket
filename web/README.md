# DataMarket - Decentralized Data Marketplace

A Next.js application for farming browsing data and trading datasets on Moca Chain Testnet with AIRKit identity verification.

## 🚀 Features

### Core Functionality
- **Data Farming**: Collect browsing history and export to IPFS via Pinata
- **Marketplace**: List and purchase datasets using MOCA cryptocurrency
- **Smart Contracts**: Trustless transactions on Moca Chain Testnet
- **IPFS Storage**: Decentralized data storage with Pinata gateway

### AIRKit Integration ⭐
- **SSO Login**: Single sign-on across Moca Network apps
- **Seller Verification**: Verified seller badges for trust
- **Dataset Credentials**: Privacy-preserving proofs of data quality
- **Gated Access**: Premium datasets require buyer verification
- **Consent Management**: GDPR/CCPA compliant consent credentials

## 🏗️ Architecture

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage with AIRKit info
│   │   ├── farm/page.tsx      # Data farming with credentials
│   │   ├── market/page.tsx    # Marketplace with gated access
│   │   ├── api/
│   │   │   ├── pinata/        # IPFS upload endpoint
│   │   │   └── airkit/        # AIRKit credential endpoint
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── providers.tsx      # Wagmi + RainbowKit + AIRKit
│   ├── components/
│   │   ├── AirKitLogin.tsx    # SSO authentication
│   │   └── VerifyIdentity.tsx # Seller verification
│   └── lib/
│       └── airkit.ts          # AIRKit service singleton
├── AIRKIT_FEATURES.md         # AIRKit documentation
└── README.md                  # This file

contracts/
└── DataMarket.sol             # On-chain marketplace contract
```

## 🔧 Setup

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Environment Variables
Create `web/.env.local`:
```env
# WalletConnect (for wallet connection)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a14234612450c639dd0adcbb729ddfd8

# AIRKit (for identity & credentials)
NEXT_PUBLIC_AIRKIT_PARTNER_ID=61f6379f-9145-4da8-a2d7-f6628343601c
AIRKIT_ISSUER_DID=did:air:id:test:4P48PnhhSrdUNDXzMgnTbmKxBRMabnTW8hoe85CSkt
AIRKIT_VERIFIER_DID=did:key:Xwp8948ZjcXF982Auzh4ShBPWdbE2NezZjJqSxjSiZCwpongSTv37Xbk5dVetFg5su1H24htbnLcPhCbwsaKzCaZ5SL

# Pinata (for IPFS uploads)
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## 📝 Smart Contract

**Network**: Moca Chain Testnet  
**Contract Address**: `0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F`  
**Explorer**: https://testnet-explorer.mocachain.org/address/0x9Ba2C58C733119d896256DA85b2EAdfFE74A657F

### Contract Functions
- `list(uri, priceWei)` - List a dataset for sale
- `buy(id)` - Purchase a dataset (payable)
- `delist(id)` - Remove your listing
- `canAccess(id, user)` - Check if user owns dataset

## 🎯 User Flows

### Selling Data
1. **Login with AIR** (SSO authentication)
2. **Verify Identity** (get seller badge)
3. **Grant Consent** (GDPR compliance)
4. **Collect Data** (demo or real export)
5. **Issue Credential** (privacy-preserving proof)
6. **Upload to IPFS** (with credentials attached)
7. **List on Market** (set price in MOCA)

### Buying Data
1. **Browse Marketplace** (see verified sellers)
2. **Verify as Buyer** (for premium datasets)
3. **Purchase Dataset** (connect wallet, pay MOCA)
4. **Access IPFS** (download from CID)

## 🔐 Security & Privacy

### Zero-Knowledge Proofs
Dataset credentials prove quality WITHOUT revealing raw data:
- ✅ "1250 sites visited"
- ✅ "Categories: tech, ecommerce"
- ✅ "Time: Q4 2024"
- ❌ Actual URLs remain private until purchase

### Verification
- **Sellers**: AIRKit humanhood verification
- **Buyers**: Identity check for premium access
- **Datasets**: Verifiable credentials for quality
- **Consent**: Portable GDPR/CCPA compliance

## 🌐 Network Details

### Moca Chain Testnet
- **Chain ID**: 222888
- **RPC**: https://testnet-rpc.mocachain.org
- **Explorer**: https://testnet-explorer.mocachain.org
- **Symbol**: MOCA

### Get Testnet MOCA
1. Visit Moca faucet (docs)
2. Connect wallet
3. Request testnet tokens

## 📚 Documentation

- [AIRKit Features](./AIRKIT_FEATURES.md) - Full AIRKit integration guide
- [Moca Network Docs](https://docs.moca.network)
- [AIRKit SDK](https://docs.moca.network/airkit)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Blockchain**: 
  - Wagmi v2 (React Hooks)
  - Viem v2 (Ethereum library)
  - RainbowKit (Wallet UI)
- **Identity**: AIRKit SDK (@mocanetwork/airkit)
- **Storage**: Pinata (IPFS gateway)
- **Smart Contracts**: Solidity + Hardhat

## 🚧 Future Improvements

1. **Real Browser Extension**: Capture actual browsing history
2. **Data Encryption**: Encrypt raw data; key released on purchase
3. **Reputation System**: Aggregate trust scores across Moca Network
4. **Advanced Credentials**: Selective disclosure, revocation
5. **Multi-Chain**: Expand to other EVM chains

## 📞 Support

- Issues: GitHub Issues
- AIRKit: https://docs.moca.network/airkit
- Moca Discord: https://discord.gg/moca

---

**Built on Moca Chain Testnet with AIRKit Identity**
