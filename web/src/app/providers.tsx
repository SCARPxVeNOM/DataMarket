"use client";
import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { injected, walletConnect } from "wagmi/connectors";
import { Chain } from "viem";

export const mocaTestnet: Chain = {
  id: 222888,
  name: "Moca Chain Testnet",
  nativeCurrency: { name: "Moca", symbol: "MOCA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.mocachain.org"] },
  },
  blockExplorers: {
    default: { name: "MocaScan", url: "https://testnet-explorer.mocachain.org" },
  },
} as const;

const projectId = "a14234612450c639dd0adcbb729ddfd8";

const config = createConfig({
  chains: [mocaTestnet],
  transports: { [mocaTestnet.id]: http() },
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: true }),
  ],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#8b5cf6" })} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


