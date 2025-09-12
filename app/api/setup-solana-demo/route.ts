import { NextResponse } from 'next/server';
import { db } from '@/utils/db/dbConfig';
import { SolanaTransactions } from '@/utils/db/schema';

export async function POST() {
  try {
    const demoUserId = 1;
    const now = new Date();
    const sample = [
      {
        userId: demoUserId,
        transactionHash: '0xabc123def456',
        type: 'reward_payout',
        amount: '1.2345',
        usdValue: '121.50',
        description: 'Reward payout for eco action',
        status: 'confirmed',
        fromAddress: null,
        toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        blockNumber: 123456,
        gasFee: '0.000005',
        createdAt: now
      },
      {
        userId: demoUserId,
        transactionHash: '0xdef456ghi789',
        type: 'transfer_in',
        amount: '0.5000',
        usdValue: '49.00',
        description: 'Received SOL from friend',
        status: 'confirmed',
        fromAddress: '7YzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        blockNumber: 123457,
        gasFee: '0.000004',
        createdAt: new Date(now.getTime() - 86400000)
      },
      {
        userId: demoUserId,
        transactionHash: '0xghi789jkl012',
        type: 'transfer_out',
        amount: '0.2000',
        usdValue: '19.60',
        description: 'Sent SOL to charity',
        status: 'confirmed',
        fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        toAddress: '8XzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        blockNumber: 123458,
        gasFee: '0.000003',
        createdAt: new Date(now.getTime() - 2 * 86400000)
      },
      {
        userId: demoUserId,
        transactionHash: '0xjkl012mno345',
        type: 'staking_reward',
        amount: '0.1500',
        usdValue: '14.70',
        description: 'Staking reward from eco pool',
        status: 'confirmed',
        fromAddress: null,
        toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        blockNumber: 123459,
        gasFee: '0.000002',
        createdAt: new Date(now.getTime() - 3 * 86400000)
      }
    ];

    for (const tx of sample) {
      await db.insert(SolanaTransactions).values(tx).execute();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample Solana transactions added for demo user',
      count: sample.length 
    });
  } catch (error) {
    console.error('Error adding sample Solana transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add sample transactions' },
      { status: 500 }
    );
  }
} 