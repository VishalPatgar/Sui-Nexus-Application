/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Coins } from "lucide-react";

export default function WalletConnect() {
  const currentAccount = useCurrentAccount();
  
  // Fetch SUI balance for the connected account
  const { data: coinData } = useSuiClientQuery(
    "getBalance",
    { owner: currentAccount?.address! },
    { enabled: !!currentAccount }
  );

  const suiBalance = coinData ? (Number((coinData as { totalBalance: string }).totalBalance) / 1_000_000_000).toFixed(3) : "0.000";

  return (
    <div className="relative font-sans flex items-center gap-4" id="wallet-module">
      {/* User Card info if connected */}
      {currentAccount && (
        <div className="flex items-center gap-3.5 bg-neutral-900/60 border border-white/5 p-1.5 pl-4 pr-3 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase font-semibold">Verified</span>
            <span className="text-xs font-bold text-white tracking-tight">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </span>
          </div>

          <div className="h-6 w-px bg-white/5" />

          {/* Balances */}
          <div className="flex items-center gap-3.5 text-xs mr-2">
            <div className="flex flex-col text-left" title="GAS Balance">
              <span className="text-[8px] text-zinc-500 font-mono">GAS (SUI)</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {suiBalance}
              </span>
            </div>
            
            <div className="flex flex-col text-left" title="Curation Rewards">
              <span className="text-[8px] text-zinc-500 font-mono">REWARDS</span>
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-0.5">
                <Coins className="w-3 h-3 text-emerald-500" />
                0
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* The standard Connect Button from @mysten/dapp-kit */}
      <ConnectButton className="!bg-gradient-to-r !from-cyan-500 !via-sky-500 !to-cyan-600 hover:!brightness-110 active:!scale-95 !text-neutral-950 !font-bold !text-xs !rounded-xl !shadow-[0_4px_20px_rgba(6,182,212,0.3)] !transition-all !px-4 !py-2" />
    </div>
  );
}

