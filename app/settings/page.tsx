"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { useGoogleTranslate } from '../../hooks/useGoogleTranslate';
import { useSearchParams } from 'next/navigation';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { userInfo, loggedIn } = useWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reports: true,
    collections: false,
    leaderboard: true
  });

  const [profile, setProfile] = useState({
    name: 'EcoWarrior',
    email: 'user@example.com',
    bio: 'Passionate about environmental conservation and waste management.',
    location: 'New York, NY'
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLocation: false,
    showStats: true
  });

  const { theme, changeTheme, isSystem, mounted } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useGoogleTranslate();
  const searchParams = useSearchParams();

  // Load user settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!userInfo?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/settings?userId=${userInfo.id}`);
        if (response.ok) {
          const settings = await response.json();
          
          // Update notifications state
          setNotifications({
            email: settings.emailNotifications,
            push: settings.pushNotifications,
            reports: settings.reportNotifications,
            collections: settings.collectionNotifications,
            leaderboard: settings.leaderboardNotifications
          });
          
          // Update privacy state
          setPrivacy({
            profileVisible: settings.profileVisible,
            showLocation: settings.showLocation,
            showStats: settings.showStats
          });
          
          // Update profile state
          setProfile({
            name: userInfo.name || 'EcoWarrior',
            email: userInfo.email || 'user@example.com',
            bio: settings.bio || 'Passionate about environmental conservation and waste management.',
            location: settings.location || 'New York, NY'
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userInfo]);

  // Handle anchor links for smooth scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#notifications') {
      const element = document.getElementById('notifications');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500); // Small delay to ensure page is loaded
      }
    }
  }, []);

  const handleSave = async () => {
    console.log('Save button clicked, userInfo:', userInfo);
    
    if (!userInfo?.id) {
      console.log('No user ID found');
      setMessage('Please log in to save settings');
      toast.error('Please log in to save settings');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      console.log('Saving settings for user ID:', userInfo.id);
      console.log('Settings to save:', {
        notifications,
        privacy,
        profile
      });

      // Save notification and privacy settings
      const settingsData = {
        userId: userInfo.id,
        settings: {
          emailNotifications: notifications.email,
          pushNotifications: notifications.push,
          reportNotifications: notifications.reports,
          collectionNotifications: notifications.collections,
          leaderboardNotifications: notifications.leaderboard,
          profileVisible: privacy.profileVisible,
          showLocation: privacy.showLocation,
          showStats: privacy.showStats,
          bio: profile.bio,
          location: profile.location,
        }
      };

      console.log('Sending settings data:', settingsData);

      const settingsResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      console.log('Settings response status:', settingsResponse.status);
      console.log('Settings response ok:', settingsResponse.ok);

      if (!settingsResponse.ok) {
        const errorText = await settingsResponse.text();
        console.error('Settings response error:', errorText);
        throw new Error(`Failed to save settings: ${settingsResponse.status} - ${errorText}`);
      }

      const settingsResult = await settingsResponse.json();
      console.log('Settings saved successfully:', settingsResult);

      // Save profile information
      const profileData = {
        userId: userInfo.id,
        profile: {
          name: profile.name,
          email: profile.email,
          bio: profile.bio,
          location: profile.location,
        }
      };

      console.log('Sending profile data:', profileData);

      const profileResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('Profile response status:', profileResponse.status);
      console.log('Profile response ok:', profileResponse.ok);

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile response error:', errorText);
        throw new Error(`Failed to save profile: ${profileResponse.status} - ${errorText}`);
      }

      const profileResult = await profileResponse.json();
      console.log('Profile saved successfully:', profileResult);

      setMessage('Settings saved successfully!');
      toast.success('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Failed to save settings: ${errorMessage}`);
      toast.error(`Failed to save settings: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not logged in
  if (!loggedIn || !userInfo?.id) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
                Settings
              </h1>
              <p className={`text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Customize your ScrapAI experience
              </p>
            </div>

            <div className={`p-8 rounded-xl backdrop-blur-sm border text-center ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Please Log In</h2>
              <p className={`text-lg mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                You need to connect your wallet to access and save your settings.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/'}
                className="px-8 py-3"
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
              Settings
            </h1>
            <p className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Customize your ScrapAI experience
            </p>
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Profile Settings */}
            <motion.div
              className={`p-6 rounded-xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-blue-400" />
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Profile</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Display Name</label>
                  <input
                    key={`name-${userInfo?.id || 'default'}`}
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Email</label>
                  <input
                    key={`email-${userInfo?.id || 'default'}`}
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                    suppressHydrationWarning
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    rows={3}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              id="notifications"
              className={`p-6 rounded-xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-green-400" />
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Notifications</h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div>
                      <h3 className={`font-medium capitalize ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Browser push notifications'}
                        {key === 'reports' && 'Notifications about your waste reports'}
                        {key === 'collections' && 'New collection task alerts'}
                        {key === 'leaderboard' && 'Ranking and achievement updates'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [key]: !value})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              className={`p-6 rounded-xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-purple-400" />
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Privacy Settings</h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {value ? <Eye className="w-5 h-5 text-green-400" /> : <EyeOff className="w-5 h-5 text-red-400" />}
                      <div>
                        <h3 className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {key === 'profileVisible' && 'Public Profile'}
                          {key === 'showLocation' && 'Show Location'}
                          {key === 'showStats' && 'Show Statistics'}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {key === 'profileVisible' && 'Make your profile visible to other users'}
                          {key === 'showLocation' && 'Display your location on reports'}
                          {key === 'showStats' && 'Show your stats on leaderboard'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({...privacy, [key]: !value})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Appearance & Language */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {/* Theme Settings */}
              <div className={`p-6 rounded-xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <Palette className="w-6 h-6 text-yellow-400" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Theme</h2>
                </div>
                
                <div className="space-y-3">
                  {[
                    { value: 'dark', label: 'Dark' },
                    { value: 'light', label: 'Light' },
                    { value: 'system', label: 'Auto' }
                  ].map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => changeTheme(themeOption.value as 'light' | 'dark' | 'system')}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        mounted && ((themeOption.value === 'system' && isSystem) || theme === themeOption.value)
                          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                          : theme === 'dark'
                            ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="capitalize">{themeOption.label}</span>
                      {themeOption.value === 'system' && isSystem && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({theme})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Settings */}
              <div className={`p-6 rounded-xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="w-6 h-6 text-cyan-400" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Language</h2>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        currentLanguage === code
                          ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                          : theme === 'dark'
                            ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                variant="primary"
                onClick={handleSave}
                className="px-8 py-3"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}