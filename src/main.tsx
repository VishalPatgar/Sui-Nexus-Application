import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

import App from './App.tsx';
import './index.css';
import { NETWORK_CONFIG, DEFAULT_NETWORK } from './config.ts';

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  devnet: { url: NETWORK_CONFIG.devnet.url } as any,
  testnet: { url: NETWORK_CONFIG.testnet.url } as any,
  mainnet: { url: NETWORK_CONFIG.mainnet.url } as any,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={DEFAULT_NETWORK}>
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
);
