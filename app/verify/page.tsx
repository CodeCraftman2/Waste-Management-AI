"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, CheckCircle, XCircle, Loader, MapPin, Calendar, User } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { getCollectedWastesByCollector, updateReportStatus, saveCollectedWaste, createTransaction, getUserByEmail } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';

interface CollectionTask {
  id: number;
  reportId: number;
  location: string;
  wasteType: string;
  description: string;
  collectionDate: string;
  status: 'collected' | 'verified' | 'rejected';
  originalImageUrl?: string;
}

export default function VerifyCollection() {
  const { userInfo } = useWeb3Auth();
  const [collections, setCollections] = useState<CollectionTask[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    const fetchCollections = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        toast.error('Loading timeout. Please refresh the page.');
      }, 10000);

      try {
        // If no userInfo, try to get from localStorage
        let userId = userInfo?.id;
        if (!userId) {
          const email = localStorage.getItem('userEmail');
          if (email) {
            const user = await getUserByEmail(email);
            if (user) {
              userId = user.id;
            }
          }
        }

        if (!userId) {
          toast.error('Please log in to view collection tasks');
          setLoading(false);
          return;
        }

        const collectedWastes = await getCollectedWastesByCollector(userId);
        const formattedCollections: CollectionTask[] = collectedWastes.map((waste: any) => ({
          id: waste.id,
          reportId: waste.reportId,
          location: waste.location || 'Unknown Location',
          wasteType: waste.wasteType || 'Unknown Type',
          description: waste.description || 'No description',
          collectionDate: waste.collectionDate.toISOString().split('T')[0],
          status: waste.status || 'collected',
          originalImageUrl: waste.imageUrl
        }));
        setCollections(formattedCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast.error('Failed to load collection tasks. Please try again.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userInfo?.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyCollection = async () => {
    if (!selectedCollection || !verificationImage || !userInfo?.id) {
      toast.error('Please select a collection and upload a verification image');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate AI verification (in real app, this would call Google Gemini API)
      const mockVerificationResult = {
        wasteTypeMatch: Math.random() > 0.2, // 80% success rate
        quantityMatch: Math.random() > 0.3, // 70% success rate
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        overallMatch: Math.random() > 0.15 // 85% overall success rate
      };

      setVerificationResult(mockVerificationResult);

      if (mockVerificationResult.overallMatch) {
        // Update report status to verified
        await updateReportStatus(selectedCollection.reportId, 'verified');
        
        // Save collected waste with verification result
        await saveCollectedWaste(selectedCollection.reportId, userInfo.id, mockVerificationResult);
        
        // Award points for successful collection
        const pointsEarned = 25;
        await createTransaction(userInfo.id, 'earned_collect', pointsEarned, 
          `Points earned for verified waste collection at ${selectedCollection.location}`);
        
        // Update local state
        setCollections(prev => prev.map(collection => 
          collection.id === selectedCollection.id 
            ? { ...collection, status: 'verified' as const }
            : collection
        ));
        
        toast.success(`Collection verified! You earned ${pointsEarned} points.`);
      } else {
        // Update report status to rejected
        await updateReportStatus(selectedCollection.reportId, 'rejected');
        
        // Update local state
        setCollections(prev => prev.map(collection => 
          collection.id === selectedCollection.id 
            ? { ...collection, status: 'rejected' as const }
            : collection
        ));
        
        toast.error('Verification failed. Please ensure the collected waste matches the report.');
      }
    } catch (error) {
      console.error('Error verifying collection:', error);
      toast.error('Failed to verify collection. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Loader className="w-4 h-4 animate-spin" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={colors.textSecondary}>Loading collection tasks...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Verify Collections
              </h1>
              <p className={`text-xl ${colors.textSecondary}`}>
                Upload photos to verify your waste collections and earn points
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Collection Tasks */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>Your Collections</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {collections.length > 0 ? (
                    collections.map((collection, index) => (
                      <motion.div
                        key={collection.id}
                        className={`p-4 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} hover:bg-white/5 transition-all duration-200 cursor-pointer ${
                          selectedCollection?.id === collection.id ? 'ring-2 ring-blue-400' : ''
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => setSelectedCollection(collection)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Camera className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${colors.textPrimary}`}>{collection.location}</h4>
                              <p className={`text-sm ${colors.textSecondary}`}>{collection.wasteType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(collection.status)}`}>
                              {getStatusIcon(collection.status)}
                              <span className="ml-1">{collection.status}</span>
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm ${colors.textSecondary} mb-3`}>{collection.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{collection.collectionDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{collection.location}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${colors.textSecondary}`}>
                      <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No collection tasks found</p>
                      <p className="text-sm">Complete collections first to verify them</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Verification Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>Verification</h3>
                
                {selectedCollection ? (
                  <div className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}>
                    <div className="mb-6">
                      <h4 className={`font-semibold ${colors.textPrimary} mb-2`}>Selected Collection</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${colors.textSecondary}`}>{selectedCollection.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${colors.textSecondary}`}>{selectedCollection.wasteType}</span>
                        </div>
                        <p className={`text-sm ${colors.textSecondary}`}>{selectedCollection.description}</p>
                      </div>
                    </div>

                    {selectedCollection.status === 'collected' ? (
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${colors.textPrimary} mb-2`}>
                            Upload Verification Photo
                          </label>
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="verification-image"
                            />
                            <label htmlFor="verification-image" className="cursor-pointer">
                              {preview ? (
                                <div className="space-y-2">
                                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                  <p className={`text-sm ${colors.textSecondary}`}>Click to change image</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                  <p className={`text-sm ${colors.textSecondary}`}>Click to upload photo</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <Button
                          onClick={verifyCollection}
                          disabled={!verificationImage || isVerifying}
                          className="w-full"
                        >
                          {isVerifying ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verify Collection
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(selectedCollection.status)}`}>
                          {getStatusIcon(selectedCollection.status)}
                          <span className="font-medium">
                            {selectedCollection.status === 'verified' ? 'Already Verified' : 'Verification Failed'}
                          </span>
                        </div>
                        {selectedCollection.status === 'verified' && (
                          <p className={`text-sm ${colors.textSecondary} mt-2`}>
                            You earned 25 points for this collection!
                          </p>
                        )}
                      </div>
                    )}

                    {verificationResult && (
                      <div className="mt-6 p-4 rounded-lg bg-gray-800/50">
                        <h5 className={`font-semibold ${colors.textPrimary} mb-2`}>Verification Results</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={colors.textSecondary}>Waste Type Match:</span>
                            <span className={verificationResult.wasteTypeMatch ? 'text-green-400' : 'text-red-400'}>
                              {verificationResult.wasteTypeMatch ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={colors.textSecondary}>Quantity Match:</span>
                            <span className={verificationResult.quantityMatch ? 'text-green-400' : 'text-red-400'}>
                              {verificationResult.quantityMatch ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={colors.textSecondary}>Confidence:</span>
                            <span className={colors.textPrimary}>
                              {Math.round(verificationResult.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary} text-center`}>
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className={colors.textSecondary}>Select a collection to verify</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Instructions */}
            <motion.div
              className={`mt-8 p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>How Verification Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>1. Upload Photo</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>Take a clear photo of the collected waste</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>2. AI Verification</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>AI compares with original report</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>3. Earn Points</h4>
                  <p className={`text-sm ${colors.textSecondary}`}>Get 25 points for successful verification</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 