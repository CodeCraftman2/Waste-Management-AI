'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Button from "@/components/ui/Button"
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, X, Wallet, RefreshCw, ExternalLink } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance } from "@/utils/db/actions"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../store"
import ThemeToggle from "./ThemeToggle"
import LanguageSwitcher from "./LanguageSwitcher"
import { useWeb3Auth } from "./Web3AuthProvider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings?: number;
}

export default function Header({ onMenuClick, totalEarnings = 0 }: HeaderProps) {
  const { userInfo, loggedIn, loading, error: web3authError, login, logout, getUserInfo, getSolanaAddress, getSolanaBalance } = useWeb3Auth();
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [balance, setBalance] = useState(0)
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null)
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const theme = useSelector((state: RootState) => state.ui.theme);

  console.log('user info', userInfo);

  // Fetch Solana wallet information
  const fetchSolanaInfo = async () => {
    if (loggedIn) {
      try {
        const address = await getSolanaAddress();
        const balance = await getSolanaBalance();
        setSolanaAddress(address);
        setSolanaBalance(balance);
      } catch (error) {
        console.error("Error fetching Solana info:", error);
      }
    }
  };

  // Refresh all balance data
  const refreshBalances = async () => {
    setIsRefreshingBalance(true);
    try {
      await fetchSolanaInfo();
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    const notificationInterval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();
    fetchSolanaInfo();

    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [userInfo, loggedIn]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Web3Auth...</p>
        </div>
      </div>
    );
  }

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-2xl shadow-xl transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-black/30 border-b border-white/10' 
        : 'bg-white/80 border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2 md:mr-4 lg:hidden" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow">
                ScrapAI
              </span>
              <span className={`text-[8px] md:text-[10px] -mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>By Y&D</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center">
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="relative w-48 md:w-64 mr-2"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur shadow-md transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'border-white/20 bg-black/40 text-white placeholder:text-gray-300'
                      : 'border-gray-300 bg-white/80 text-gray-900 placeholder:text-gray-500'
                  }`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 inset-y-0 my-auto flex items-center justify-center"
                  onClick={() => setSearchOpen(false)}
                  tabIndex={0}
                >
                  <X className="h-5 w-5 text-gray-400" />
                </Button>
              </motion.div>
            ) : (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Enhanced Coin Button */}
          <Dialog open={balanceModalOpen} onOpenChange={setBalanceModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className={`mr-2 md:mr-4 flex items-center rounded-full px-2 md:px-3 py-1 hover:scale-105 transition-all duration-200 ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={refreshBalances}
                disabled={isRefreshingBalance}
              >
                <Coins className={`h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                <span className={`font-semibold text-sm md:text-base ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {balance.toFixed(2)}
                </span>
                {loggedIn && (
                  <div className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-500" />
                  Wallet Balance
                </DialogTitle>
                <DialogDescription>
                  Your current balance across all platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Database Balance */}
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      ScrapAI Points
                    </CardTitle>
                    <CardDescription>Earned from waste reports and collections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {balance.toFixed(2)} pts
                    </div>
                  </CardContent>
                </Card>

                {/* Solana Balance */}
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-purple-500" />
                      Solana Wallet
                      {loggedIn ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {loggedIn ? 'Connected to Solana Devnet' : 'Not connected'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {solanaBalance !== null ? `${solanaBalance.toFixed(4)} SOL` : 'N/A'}
                    </div>
                    {solanaAddress && (
                      <div className="text-xs text-gray-500 font-mono break-all">
                        {solanaAddress}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={refreshBalances}
                    disabled={isRefreshingBalance}
                    className="flex-1"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {loggedIn && solanaAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://explorer.solana.com/address/${solanaAddress}?cluster=devnet`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <LanguageSwitcher className="mr-2" />
          <ThemeToggle />
          
          {web3authError && (
            <div className="mr-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
              Auth Error
            </div>
          )}
          
          {!loggedIn ? (
            <Button 
              onClick={login} 
              className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
              disabled={!!web3authError}
            >
              {web3authError ? 'Auth Unavailable' : 'Login'}
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-default">
                  {userInfo ? userInfo.name : "User"}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings#notifications">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}