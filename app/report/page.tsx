"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Upload, Send, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import { useThemeColors } from '../../lib/themeUtils';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWeb3Auth } from '../../components/Web3AuthProvider';
import { createReport } from '../../utils/db/actions';
import { toast } from 'react-hot-toast';
import { verifyWasteType, assessImageQuality } from '../../utils/aiVerification';

const wasteTypes = [
  { id: 'plastic', label: 'Plastic', color: 'bg-blue-500' },
  { id: 'paper', label: 'Paper', color: 'bg-green-500' },
  { id: 'organic', label: 'Organic', color: 'bg-yellow-500' },
  { id: 'metal', label: 'Metal', color: 'bg-gray-500' },
  { id: 'glass', label: 'Glass', color: 'bg-purple-500' },
  { id: 'electronic', label: 'Electronic', color: 'bg-red-500' },
  { id: 'hazardous', label: 'Hazardous', color: 'bg-orange-500' },
  { id: 'mixed', label: 'Mixed', color: 'bg-indigo-500' }
];

export default function ReportWaste() {
  const { userInfo } = useWeb3Auth();
  const [selectedType, setSelectedType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const colors = useThemeColors();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check image quality first
      const qualityCheck = await assessImageQuality(file);
      if (!qualityCheck.isValid) {
        toast.error('Image quality issues detected');
        qualityCheck.issues.forEach(issue => toast.error(issue));
        return;
      }

      setImage(file);
      setAiAnalysis(null); // Reset previous analysis
      
      // Check if AI API is available
      const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      
      if (!hasApiKey) {
        console.log('AI API key not available, skipping AI analysis');
        toast('AI analysis not available - report will be submitted without AI verification');
        return;
      }
      
      // Start AI analysis
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/analyze-waste', {
          method: 'POST',
          body: formData,
        });
        
        const analysis = await response.json();
        
        if (analysis.success && analysis.result) {
          setAiAnalysis(analysis.result);
          toast.success('AI analysis completed!');
        } else {
          toast.error('AI analysis failed: ' + (analysis.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        toast.error('Failed to analyze image - continuing without AI analysis');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('User info:', userInfo);
    console.log('Form data:', { selectedType, location, description, image: image?.name });
    
    if (!userInfo?.id) {
      console.error('No user ID found:', userInfo);
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedType || !location || !description) {
      console.error('Missing required fields:', { selectedType, location, description });
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting report creation for user ID:', userInfo.id);
      
      // Verify waste type with AI if analysis is available
      let verificationStatus = 'pending';
      if (aiAnalysis) {
        console.log('AI analysis available, verifying waste type');
        const isVerified = await verifyWasteType(selectedType, aiAnalysis);
        verificationStatus = isVerified ? 'verified' : 'rejected';
        console.log('Verification result:', verificationStatus);
      }

      // Create the report in the database
      const report = await createReport(
        userInfo.id,
        location,
        selectedType,
        description,
        image ? URL.createObjectURL(image) : undefined,
        verificationStatus,
        aiAnalysis ? JSON.stringify(aiAnalysis) : undefined
      );
      
      console.log('Report created successfully:', report);
      
      if (!report) {
        throw new Error('Failed to create report - no report returned');
      }
      
      // Reset form
      setSelectedType('');
      setLocation('');
      setDescription('');
      setImage(null);
      setAiAnalysis(null);
      
      const statusMessage = verificationStatus === 'verified' 
        ? 'Waste report submitted and verified by AI! You earned 15 points.' 
        : verificationStatus === 'rejected'
        ? 'Waste report submitted but type verification failed. You earned 5 points.'
        : 'Waste report submitted successfully! You earned 10 points.';
      
      toast.success(statusMessage);
      
      // Trigger balance update event
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: 0 }));
      
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      const errorMessage = error instanceof Error 
        ? `Error submitting report: ${error.message}`
        : 'Error submitting report. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
              Report Waste
            </h1>
            <p className={`text-xl ${colors.textSecondary}`}>
              Help keep your community clean by reporting waste locations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Waste Type Selection */}
                <div>
                  <label className={`block ${colors.textPrimary} font-medium mb-3`}>Waste Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {wasteTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedType === type.id
                            ? 'border-blue-400 bg-blue-400/20'
                            : `${colors.borderPrimary} ${colors.bgSecondary} ${colors.hoverBg}`
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          <span className={`${colors.textPrimary} text-sm`}>{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className={`block ${colors.textPrimary} font-medium mb-3`}>Location</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location or coordinates"
                      className={`flex-1 p-3 rounded-lg ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="px-4"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block ${colors.textPrimary} font-medium mb-3`}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the waste situation..."
                    rows={4}
                    className={`w-full p-3 rounded-lg ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none`}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className={`block ${colors.textPrimary} font-medium mb-3`}>Photo Evidence</label>
                  <div className={`border-2 border-dashed ${colors.borderPrimary} rounded-lg p-6 text-center ${colors.hoverBorder} transition-colors`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {image ? (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-green-400 mx-auto" />
                          <p className="text-green-400">{image.name}</p>
                          <p className={`text-sm ${colors.textTertiary}`}>Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className={`${colors.textTertiary}`}>Click to upload photo</p>
                          <p className={`text-sm ${colors.textMuted}`}>PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {/* AI Analysis Status */}
                  {isAnalyzing && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span className={`text-sm ${colors.textPrimary}`}>AI analyzing image...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Analysis Results */}
                  {aiAnalysis && !isAnalyzing && (
                    <div className="mt-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className={`text-sm font-medium ${colors.textPrimary}`}>AI Analysis Complete</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className={`${colors.textSecondary}`}>Detected:</span> {aiAnalysis.wasteType}</p>
                        <p><span className={`${colors.textSecondary}`}>Confidence:</span> {aiAnalysis.confidence}%</p>
                        <p><span className={`${colors.textSecondary}`}>Amount:</span> {aiAnalysis.estimatedAmount}</p>
                        {aiAnalysis.isHazardous && (
                          <p className="text-red-500 font-medium">⚠️ Hazardous waste detected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!selectedType || !location || !description || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Report</span>
                    </div>
                  )}
                </Button>
                
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {userInfo?.id || 'Not set'}</p>
                    <p>Selected Type: {selectedType || 'Not selected'}</p>
                    <p>Location: {location || 'Not entered'}</p>
                    <p>Description: {description || 'Not entered'}</p>
                    <p>Form Valid: {selectedType && location && description ? 'Yes' : 'No'}</p>
                    <p>Button Disabled: {(!selectedType || !location || !description || isSubmitting) ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {/* Rewards Info */}
              <div className={`p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border ${colors.borderPrimary}`}>
                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Earn Rewards</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={colors.textSecondary}>Basic Report</span>
                    <span className="text-green-400 font-medium">+15 points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={colors.textSecondary}>With Photo</span>
                    <span className="text-green-400 font-medium">+25 points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={colors.textSecondary}>Verified Report</span>
                    <span className="text-green-400 font-medium">+50 points</span>
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}>
                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Reporting Guidelines</h3>
                <div className={`space-y-3 ${colors.textSecondary}`}>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Ensure your safety when taking photos</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Provide accurate location information</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Include clear, well-lit photos</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Describe the waste type and quantity</span>
                  </div>
                </div>
              </div>

              {/* Impact Stats */}
              <div className={`p-6 rounded-xl ${colors.bgCard} backdrop-blur-sm border ${colors.borderPrimary}`}>
                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Your Impact</h3>
                <div className="space-y-3">
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-400">47</div>
                    <div className={`text-sm ${colors.textTertiary}`}>Reports Submitted</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <div className="text-2xl font-bold text-green-400">89%</div>
                    <div className={`text-sm ${colors.textTertiary}`}>Verification Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}