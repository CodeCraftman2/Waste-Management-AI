"use client"

import React from 'react';

export default function Map() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Waste Map</h2>
        <p className="text-gray-600 mb-4">
          Map component is temporarily disabled due to initialization issues.
        </p>
        <p className="text-sm text-gray-500">
          Using Google Maps API for location search instead.
        </p>
      </div>
    </div>
  );
}