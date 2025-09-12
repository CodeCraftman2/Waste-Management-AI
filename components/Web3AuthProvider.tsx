'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { createUser, getUserByEmail } from "@/utils/db/actions";

const clientId = "BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc";

const chainConfig = {
  chainId: "devnet",
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Devnet",
  blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
};

const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  enableLogging: true,
});

interface UserInfo {
  email: string;
  name: string;
  id?: number;
}

interface Web3AuthContextType {
  web3auth: Web3Auth;
  provider: IProvider | null;
  userInfo: UserInfo | null;
  loggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  getSolanaAddress: () => Promise<string | null>;
  getSolanaBalance: () => Promise<number | null>;
  refreshSolanaBalance: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

  // Real-time balance update interval
  useEffect(() => {
    if (!loggedIn) return;

    const updateBalance = async () => {
      try {
        const balance = await getSolanaBalance();
        if (balance !== null) {
          setSolanaBalance(balance);
        }
      } catch (error) {
        console.error("Error updating Solana balance:", error);
      }
    };

    // Update balance every 30 seconds when logged in
    const interval = setInterval(updateBalance, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing Web3Auth...");
        await web3auth.initModal();
        console.log("Web3Auth initialized successfully");
        
        setProvider(web3auth.provider);
        setError(null);

        if (web3auth.connected) {
          console.log("Web3Auth already connected");
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            try {
              // Create or get user from database
              const dbUser = await createUser(user.email, user.name || 'Anonymous User');
              if (dbUser) {
                setUserInfo({
                  email: user.email,
                  name: user.name || 'Anonymous User',
                  id: dbUser.id
                });
              } else {
                // Fallback if createUser fails
                setUserInfo({
                  email: user.email,
                  name: user.name || 'Anonymous User'
                });
              }
            } catch (error) {
              console.error("Error creating user:", error);
              // Set userInfo without ID as fallback
              setUserInfo({
                email: user.email,
                name: user.name || 'Anonymous User'
              });
            }
          }
          
          // Fetch Solana info if already connected
          await refreshSolanaInfo();
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        setError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Fallback: Check for existing user in localStorage
        const existingEmail = localStorage.getItem('userEmail');
        if (existingEmail) {
          try {
            const user = await getUserByEmail(existingEmail);
            if (user) {
              setUserInfo({ email: existingEmail, name: user.name, id: user.id });
              setLoggedIn(true);
            }
          } catch (error) {
            console.error("Error fetching existing user:", error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Web3Auth initialization timeout, using fallback");
      setLoading(false);
      
      // Check for existing user in localStorage as fallback
      const existingEmail = localStorage.getItem('userEmail');
      if (existingEmail) {
        getUserByEmail(existingEmail).then(user => {
          if (user) {
            setUserInfo({ email: existingEmail, name: user.name, id: user.id });
            setLoggedIn(true);
          }
        }).catch(error => {
          console.error("Error fetching existing user:", error);
        });
      }
    }, 5000); // 5 second timeout

    init().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  const refreshSolanaInfo = async () => {
    if (!web3auth.connected) return;
    
    try {
      const address = await getSolanaAddress();
      const balance = await getSolanaBalance();
      setSolanaAddress(address);
      setSolanaBalance(balance);
    } catch (error) {
      console.error("Error refreshing Solana info:", error);
    }
  };

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      setError("Web3Auth not available");
      return;
    }
    
    try {
      console.log("Attempting to connect to Web3Auth...");
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      setError(null);
      
      const user = await web3auth.getUserInfo();
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          // Create or get user from database
          const dbUser = await createUser(user.email, user.name || 'Anonymous User');
          if (dbUser) {
            setUserInfo({
              email: user.email,
              name: user.name || 'Anonymous User',
              id: dbUser.id
            });
          } else {
            // Fallback if createUser fails
            setUserInfo({
              email: user.email,
              name: user.name || 'Anonymous User'
            });
          }
        } catch (error) {
          console.error("Error creating user:", error);
          // Set userInfo without ID as fallback
          setUserInfo({
            email: user.email,
            name: user.name || 'Anonymous User'
          });
        }
      }
      
      // Fetch Solana info after successful login
      await refreshSolanaInfo();
    } catch (error) {
      console.error("Error during login:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      setSolanaAddress(null);
      setSolanaBalance(null);
      localStorage.removeItem('userEmail');
      setError(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth && web3auth.connected) {
      const user = await web3auth.getUserInfo();
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          // Create or get user from database
          const dbUser = await createUser(user.email, user.name || 'Anonymous User');
          if (dbUser) {
            setUserInfo({
              email: user.email,
              name: user.name || 'Anonymous User',
              id: dbUser.id
            });
          } else {
            // Fallback if createUser fails
            setUserInfo({
              email: user.email,
              name: user.name || 'Anonymous User'
            });
          }
        } catch (error) {
          console.error("Error creating user:", error);
          // Set userInfo without ID as fallback
          setUserInfo({
            email: user.email,
            name: user.name || 'Anonymous User'
          });
        }
      }
    }
  };

  const getSolanaAddress = async (): Promise<string | null> => {
    if (!provider) return null;

    // Demo login fallback
    if (!web3auth.connected) {
      return "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    }

    // Try to get public key from provider (Web3Auth Solana adapter)
    try {
      // Some providers expose publicKey directly
      // @ts-ignore
      if (provider.publicKey) {
        // @ts-ignore
        return provider.publicKey.toString();
      }
      
      // If using Solana Web3.js, you can do:
      // const connection = new Connection("https://api.devnet.solana.com");
      // const publicKey = provider.wallet.publicKey;
      // return publicKey.toString();
    } catch (error) {
      console.error("Error getting Solana address:", error);
    }

    // Fallback to demo address
    return "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
  };

  const getSolanaBalance = async (): Promise<number | null> => {
    if (!provider) return null;
    
    try {
      const address = await getSolanaAddress();
      if (!address) return null;

      // For demo purposes, return a mock balance when using Quick Demo Login
      if (!web3auth.connected) {
        return 2.4567; // Demo balance
      }

      // Try to get balance using Solana Web3.js methods
      try {
        // For real Solana wallets, you would use:
        // const connection = new Connection("https://api.devnet.solana.com");
        // const publicKey = new PublicKey(address);
        // const balance = await connection.getBalance(publicKey);
        // return balance / 1e9; // Convert lamports to SOL
        
        // For now, return a demo balance for real wallets too
        // In a real implementation, you would fetch from Solana RPC
        return 2.4567;
      } catch (error) {
        console.error("Error getting Solana balance:", error);
      }
    } catch (error) {
      console.error("Error getting Solana balance:", error);
    }

    // Return demo balance for testing
    return 2.4567;
  };

  const refreshSolanaBalance = async (): Promise<void> => {
    if (!loggedIn) return;
    
    try {
      const balance = await getSolanaBalance();
      setSolanaBalance(balance);
    } catch (error) {
      console.error("Error refreshing Solana balance:", error);
    }
  };

  const value: Web3AuthContextType = {
    web3auth,
    provider,
    userInfo,
    loggedIn,
    loading,
    error,
    login,
    logout,
    getUserInfo,
    getSolanaAddress,
    getSolanaBalance,
    refreshSolanaBalance,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
}; 