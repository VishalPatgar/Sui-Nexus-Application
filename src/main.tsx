import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  devnet: { url: 'https://fullnode.devnet.sui.io:443' } as any,
  testnet: { url: 'https://fullnode.testnet.sui.io:443' } as any,
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443' } as any,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
);
