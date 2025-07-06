"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Camera, Coins } from 'lucide-react';
import Button from './ui/Button';

interface ContractInteractionProps {
  onWasteReport?: (location: any, quantity: string) => void;
}

export default function ContractInteraction({ onWasteReport }: ContractInteractionProps) {
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !quantity || !wasteType) return;

    setIsSubmitting(true);
    try {
      // Mock coordinates for the location
      const mockLocation = {
        lat: 40.7589 + (Math.random() - 0.5) * 0.1,
        lng: -73.9851 + (Math.random() - 0.5) * 0.1,
        address: location
      };

      if (onWasteReport) {
        await onWasteReport(mockLocation, quantity);
      }

      // Reset form
      setLocation('');
      setQuantity('');
      setWasteType('');
      
      alert('Waste report submitted successfully! You earned 25 points.');
    } catch (error) {
      console.error('Error submitting waste report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wasteTypes = [
    'Plastic',
    'Paper',
    'Organic',
    'Electronic',
    'Glass',
    'Metal',
    'Mixed'
  ];

  return (
    <motion.div
      className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Report Waste</h3>
        <p className="text-gray-300 text-sm">
          Submit a new waste report to earn points and help keep the environment clean
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Input */}
        <div>
          <label className="block text-white font-medium mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location or address"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Waste Type Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Waste Type</label>
          <select
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="" className="bg-gray-800">Select waste type</option>
            {wasteTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-800">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-white font-medium mb-2">Quantity</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="" className="bg-gray-800">Select quantity</option>
            <option value="Small" className="bg-gray-800">Small (1-5 items)</option>
            <option value="Medium" className="bg-gray-800">Medium (6-20 items)</option>
            <option value="Large" className="bg-gray-800">Large (20+ items)</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting || !location || !quantity || !wasteType}
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
              <Coins className="w-4 h-4" />
              <span>+25 pts</span>
            </div>
          )}
        </Button>
      </form>

      {/* Info Section */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <h4 className="text-blue-400 font-medium mb-2">Earn Rewards</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Basic report: +15 points</li>
          <li>• With photo: +25 points</li>
          <li>• Verified report: +50 points</li>
        </ul>
      </div>
    </motion.div>
  );
}