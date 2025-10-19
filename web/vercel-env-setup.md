# Vercel Environment Variables Configuration

## Required Environment Variables

Copy these to your Vercel project settings:

### WalletConnect Configuration
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a14234612450c639dd0adcbb729ddfd8
```

### AIRKit Configuration
```
NEXT_PUBLIC_AIRKIT_PARTNER_ID=61f6379f-9145-4da8-a2d7-f6628343601c
AIRKIT_ISSUER_DID=did:air:id:test:4P48PnhhSrdUNDXzMgnTbmKxBRMabnTW8hoe85CSkt
AIRKIT_VERIFIER_DID=did:key:Xwp8948ZjcXF982Auzh4ShBPWdbE2NezZjJqSxjSiZCwpongSTv37Xbk5dVetFg5su1H24htbnLcPhCbwsaKzCaZ5SL
```

### Pinata IPFS Configuration
```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYzQ3YzQwNy1hYzQ3LTRhYzQtYWM0Ny1hYzQ3YzQwN2FjNDciLCJlbWFpbCI6InByYXRpa2t1bWFyNTY3NzhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhcnlhbiIsImFwcE5hbWUiOiJEYXRhTWFya2V0IiwiaWRlbnRpZmllciI6ImFyeWFuIiwiY3JlYXRlZCI6MTczNDk0MjQwMDAwMCwiaWF0IjoxNzM0OTQyNDAwLCJzdWIiOiJhYzQ3YzQwNy1hYzQ3LTRhYzQtYWM0Ny1hYzQ3YzQwN2FjNDcifSwiaWF0IjoxNzM0OTQyNDAwLCJleHAiOjE3MzU1NDcyMDB9.7Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q
```

## How to Add Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your DataMarket project
3. Go to Settings → Environment Variables
4. Add each variable with the values above
5. Make sure to set them for Production, Preview, and Development environments

## Important Notes:

- Replace the PINATA_JWT with your actual Pinata JWT token
- The AIRKit credentials are for sandbox/testing environment
- For production, you'll need production AIRKit credentials
- Make sure all variables are marked as "Production" environment
