'use client';

import React, { useState } from 'react';
import { useWeb3Auth } from '@/components/Web3AuthProvider';
import Button from '@/components/ui/Button';
import { createReport, getUserByEmail } from '@/utils/db/actions';
import { toast } from 'react-hot-toast';

export default function TestReportPage() {
  const { userInfo, loggedIn } = useWeb3Auth();
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testDatabaseConnection = async () => {
    setIsTesting(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Database connection successful. Found ${data.userCount} users.`);
      } else {
        setTestResult(`❌ Database connection failed: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testUserCreation = async () => {
    if (!userInfo?.email) {
      setTestResult('❌ No user email available');
      return;
    }

    setIsTesting(true);
    setTestResult('');
    
    try {
      const user = await getUserByEmail(userInfo.email);
      if (user) {
        setTestResult(`✅ User found: ${user.name} (ID: ${user.id})`);
      } else {
        setTestResult('❌ User not found in database');
      }
    } catch (error) {
      setTestResult(`❌ User lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testReportCreation = async () => {
    if (!userInfo?.id) {
      setTestResult('❌ No user ID available');
      return;
    }

    setIsTesting(true);
    setTestResult('');
    
    try {
      const report = await createReport(
        userInfo.id,
        'Test Location',
        'plastic',
        'Test report for debugging',
        undefined,
        'pending',
        undefined
      );
      
      if (report) {
        setTestResult(`✅ Report created successfully! Report ID: ${report.id}`);
      } else {
        setTestResult('❌ Report creation failed - no report returned');
      }
    } catch (error) {
      setTestResult(`❌ Report creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Report System Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test database connectivity and report submission functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Logged In:</strong> {loggedIn ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Email:</strong> {userInfo?.email || 'Not available'}</p>
              <p><strong>Name:</strong> {userInfo?.name || 'Not available'}</p>
              <p><strong>User ID:</strong> {userInfo?.id || 'Not available'}</p>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              <Button
                onClick={testDatabaseConnection}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Test Database Connection'}
              </Button>
              
              <Button
                onClick={testUserCreation}
                disabled={isTesting || !loggedIn}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Test User Lookup'}
              </Button>
              
              <Button
                onClick={testReportCreation}
                disabled={isTesting || !userInfo?.id}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Test Report Creation'}
              </Button>
              
              {testResult && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Login:</strong> Make sure you're logged in with your wallet</p>
            <p>2. <strong>Test Database:</strong> Click "Test Database Connection" to verify database connectivity</p>
            <p>3. <strong>Test User:</strong> Click "Test User Lookup" to verify user exists in database</p>
            <p>4. <strong>Test Report:</strong> Click "Test Report Creation" to verify report submission works</p>
            <p>5. <strong>Check Results:</strong> Review the test results below each button</p>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">❌ "No user ID available"</p>
              <p className="text-gray-600">Solution: Make sure you're logged in and the user was created in the database</p>
            </div>
            <div>
              <p className="font-semibold">❌ "Database connection failed"</p>
              <p className="text-gray-600">Solution: Check DATABASE_URL environment variable and database status</p>
            </div>
            <div>
              <p className="font-semibold">❌ "Report creation failed"</p>
              <p className="text-gray-600">Solution: Check database schema and ensure all required fields are provided</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 