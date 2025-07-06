'use client';

import React from 'react';
import SolanaWallet from '@/components/SolanaWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Coins, TrendingUp, Activity } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function TestWalletPage() {
  const theme = useSelector((state: RootState) => state.ui.theme);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Solana Wallet Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the enhanced coin button and Solana wallet integration
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Enhanced Coin Button</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the coin button in the header to see detailed balance information and wallet status.
              </p>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg">Solana Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time Solana wallet balance and transaction history with Web3Auth integration.
              </p>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic balance updates and transaction monitoring with refresh capabilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SolanaWallet showTransactions={true} />
          
          <div className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Features Implemented
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Clickable coin button in header</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Balance modal with detailed information</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Solana wallet integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Real-time balance updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Transaction history display</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Wallet address copy functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Solana Explorer integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span className="text-sm">Connection status indicators</span>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className="text-lg">How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. <strong>Login:</strong> Use the login button in the header to connect your wallet</p>
                <p>2. <strong>Coin Button:</strong> Click the coin button to see the balance modal</p>
                <p>3. <strong>Refresh:</strong> Use the refresh button to update balances</p>
                <p>4. <strong>Transactions:</strong> View recent transaction history</p>
                <p>5. <strong>Explorer:</strong> Click "View" to open Solana Explorer</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Details about the wallet integration and balance management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Web3Auth Integration</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Solana Devnet connection</li>
                  <li>• Automatic wallet initialization</li>
                  <li>• User authentication flow</li>
                  <li>• Session persistence</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Balance Management</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Database balance tracking</li>
                  <li>• Solana wallet balance</li>
                  <li>• Real-time updates</li>
                  <li>• Transaction history</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 