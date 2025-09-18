"use client";

import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { ethers } from 'ethers';
import { useMemo, useEffect } from 'react';
import { sepolia } from 'wagmi/chains';

export interface UseWagmiEthersSignerState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  address: string | undefined;
}

export const useWagmiEthersSigner = (): UseWagmiEthersSignerState => {
  const { address, isConnected, chainId, status, error } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  // Auto switch to Sepolia when connected to wrong network
  useEffect(() => {
    if (isConnected && chainId && chainId !== sepolia.id) {
      console.log(`Switching from chain ${chainId} to Sepolia (${sepolia.id})`);
      switchChain({ chainId: sepolia.id });
    }
  }, [isConnected, chainId, switchChain]);

  const ethersSigner = useMemo(() => {
    if (!walletClient || !isConnected) return undefined;
    
    try {
      const provider = new ethers.BrowserProvider(walletClient);
      return new ethers.JsonRpcSigner(provider, address!);
    } catch (err) {
      console.error('Error creating ethers signer:', err);
      return undefined;
    }
  }, [walletClient, isConnected, address]);

  const ethersReadonlyProvider = useMemo(() => {
    if (!walletClient || !isConnected) return undefined;
    
    try {
      return new ethers.BrowserProvider(walletClient);
    } catch (err) {
      console.error('Error creating readonly provider:', err);
      return undefined;
    }
  }, [walletClient, isConnected]);

  const provider = useMemo(() => {
    return walletClient as ethers.Eip1193Provider | undefined;
  }, [walletClient]);

  const accounts = useMemo(() => {
    return address ? [address] : undefined;
  }, [address]);

  return {
    provider,
    chainId,
    accounts,
    isConnected,
    error: error as Error | undefined,
    ethersSigner,
    ethersReadonlyProvider,
    address,
  };
};
