'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Auth } from './Web3AuthProvider';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getSolanaTransactions } from '@/utils/db/actions';

interface SolanaWalletProps {
  className?: string;
  showTransactions?: boolean;
}

export default function SolanaWallet({ className = '', showTransactions = true }: SolanaWalletProps) {
  const { 
    loggedIn, 
    userInfo, 
    getSolanaAddress, 
    getSolanaBalance, 
    refreshSolanaBalance 
  } = useWeb3Auth();
  
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useSelector((state: RootState) => state.ui.theme);

  const fetchWalletData = async () => {
    if (!loggedIn || !userInfo) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      const [address, balance] = await Promise.all([
        getSolanaAddress(),
        getSolanaBalance()
      ]);
      
      setSolanaAddress(address);
      setSolanaBalance(balance);
      
      // Fetch transactions if user has an ID
      if (userInfo.id && showTransactions) {
        const userTransactions = await getSolanaTransactions(userInfo.id, 10);
        setTransactions(userTransactions);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to fetch wallet data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = async () => {
    if (!solanaAddress) return;
    
    try {
      await navigator.clipboard.writeText(solanaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openExplorer = () => {
    if (!solanaAddress) return;
    window.open(`https://explorer.solana.com/address/${solanaAddress}?cluster=devnet`, '_blank');
  };

  useEffect(() => {
    fetchWalletData();
  }, [loggedIn, userInfo]);

  if (!loggedIn) {
    return (
      <Card className={`${className} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            Solana Wallet
          </CardTitle>
          <CardDescription>Connect your wallet to view balance and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Wallet not connected</p>
            <Button disabled className="bg-purple-600 hover:bg-purple-700">
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            <CardTitle>Solana Wallet</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWalletData}
            disabled={isRefreshing}
            className="p-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>Connected to Solana Devnet</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Balance</p>
              <p className="text-2xl font-bold">
                {solanaBalance !== null ? `${solanaBalance.toFixed(4)} SOL` : 'Loading...'}
              </p>
            </div>
            <Coins className="h-8 w-8 opacity-80" />
          </div>
        </div>

        {/* Address Display */}
        {solanaAddress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Wallet Address</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="p-1 h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExplorer}
                  className="p-1 h-8 w-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-xs break-all font-mono">
                {solanaAddress}
              </code>
            </div>
          </div>
        )}

        {/* Transaction History */}
        {showTransactions && transactions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Transactions</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'reward_payout' || tx.type === 'transfer_in' || tx.type === 'staking_reward'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {tx.type === 'reward_payout' || tx.type === 'transfer_in' || tx.type === 'staking_reward' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        tx.type === 'reward_payout' || tx.type === 'transfer_in' || tx.type === 'staking_reward'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {tx.type === 'reward_payout' || tx.type === 'transfer_in' || tx.type === 'staking_reward' ? '+' : '-'}
                        {tx.amount} SOL
                      </p>
                      <p className="text-xs text-gray-500">
                        ${parseFloat(tx.usdValue).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={refreshSolanaBalance}
            disabled={isRefreshing}
            className="flex-1"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Balance
          </Button>
          {solanaAddress && (
            <Button
              variant="outline"
              size="sm"
              onClick={openExplorer}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 