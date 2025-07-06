// DISABLED - Using Google Maps API for location search instead
// This component was causing "Map container is already initialized" errors
/*
"use client"

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Leaf, Filter, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import { getRecentReports } from '../utils/db/actions';
import { useThemeColors } from '../lib/themeUtils';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface WastePoint {
  id: number;
  location: string;
  wasteType: string;
  status: string;
  lat: number;
  lng: number;
  amount: string;
  createdAt: string;
}

// Mock waste points data - in real app, this would come from your database
const mockWastePoints: WastePoint[] = [
  {
    id: 1,
    location: 'India Gate, New Delhi',
    wasteType: 'Plastic',
    status: 'pending',
    lat: 28.6129,
    lng: 77.2295,
    amount: 'Large',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    location: 'Gateway of India, Mumbai',
    wasteType: 'Paper',
    status: 'verified',
    lat: 18.921984,
    lng: 72.834654,
    amount: 'Medium',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    location: 'Howrah Bridge, Kolkata',
    wasteType: 'Organic',
    status: 'collected',
    lat: 22.5850,
    lng: 88.3468,
    amount: 'Small',
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    location: 'Charminar, Hyderabad',
    wasteType: 'Electronic',
    status: 'pending',
    lat: 17.3616,
    lng: 78.4747,
    amount: 'Large',
    createdAt: '2024-01-12'
  },
  {
    id: 5,
    location: 'Marine Drive, Mumbai',
    wasteType: 'Glass',
    status: 'verified',
    lat: 18.9430,
    lng: 72.8238,
    amount: 'Medium',
    createdAt: '2024-01-11'
  },
  {
    id: 6,
    location: 'MG Road, Bengaluru',
    wasteType: 'Metal',
    status: 'collected',
    lat: 12.9756,
    lng: 77.6050,
    amount: 'Small',
    createdAt: '2024-01-10'
  },
  {
    id: 7,
    location: 'Sabarmati Ashram, Ahmedabad',
    wasteType: 'Paper',
    status: 'pending',
    lat: 23.0600,
    lng: 72.5800,
    amount: 'Large',
    createdAt: '2024-01-09'
  },
  {
    id: 8,
    location: 'Marina Beach, Chennai',
    wasteType: 'Organic',
    status: 'verified',
    lat: 13.0500,
    lng: 80.2824,
    amount: 'Medium',
    createdAt: '2024-01-08'
  },
  {
    id: 9,
    location: 'Sector 17, Chandigarh',
    wasteType: 'Electronic',
    status: 'collected',
    lat: 30.7415,
    lng: 76.7681,
    amount: 'Small',
    createdAt: '2024-01-07'
  },
  {
    id: 10,
    location: 'Baga Beach, Goa',
    wasteType: 'Glass',
    status: 'pending',
    lat: 15.5524,
    lng: 73.7517,
    amount: 'Large',
    createdAt: '2024-01-06'
  },
  {
    id: 11,
    location: 'Lalbagh, Bengaluru',
    wasteType: 'Metal',
    status: 'verified',
    lat: 12.9507,
    lng: 77.5848,
    amount: 'Medium',
    createdAt: '2024-01-05'
  }
];

export default function Map() {
  const [wastePoints, setWastePoints] = useState<WastePoint[]>(mockWastePoints);
  const [filteredPoints, setFilteredPoints] = useState<WastePoint[]>(mockWastePoints);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default: New Delhi
  const [mapZoom, setMapZoom] = useState(5);
  const [mapKey, setMapKey] = useState(0);
  const colors = useThemeColors();
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Load Leaflet CSS and create custom icons
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');
        
        // Import Leaflet and fix default markers
        const L = await import('leaflet');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setLeafletLoaded(true);
      }
    };
    
    loadLeaflet();
  }, []);

  useEffect(() => {
    const permission = getCookie('location_permission');
    if (permission === 'granted') {
      getUserLocation();
    } else if (permission !== 'denied') {
      // Ask for permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCookie('location_permission', 'granted', 30);
            setMapCenter([position.coords.latitude, position.coords.longitude]);
            setMapZoom(13);
          },
          (error) => {
            setCookie('location_permission', 'denied', 30);
            // Keep default center
          }
        );
      }
    }
    // eslint-disable-next-line
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(13);
        }
      );
    }
  };

  const filters = [
    { id: 'all', label: 'All Reports', color: 'bg-gray-500' },
    { id: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { id: 'verified', label: 'Verified', color: 'bg-blue-500' },
    { id: 'collected', label: 'Collected', color: 'bg-green-500' }
  ];

  const wasteTypeColors = {
    'Plastic': '#3B82F6', // Blue
    'Paper': '#10B981', // Green
    'Organic': '#F59E0B', // Yellow
    'Electronic': '#8B5CF6', // Purple
    'Glass': '#EC4899', // Pink
    'Metal': '#6B7280' // Gray
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    if (filterId === 'all') {
      setFilteredPoints(wastePoints);
    } else {
      setFilteredPoints(wastePoints.filter(point => point.status === filterId));
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from your database
      const reports = await getRecentReports(20);
      // For now, we'll use mock data
      setWastePoints(mockWastePoints);
      setFilteredPoints(selectedFilter === 'all' ? mockWastePoints : mockWastePoints.filter(point => point.status === selectedFilter));
    } catch (error) {
      console.error('Error fetching waste points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'verified': return '#3B82F6';
      case 'collected': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Create custom colored markers for each waste type
  const createCustomMarker = (wasteType: string) => {
    const color = wasteTypeColors[wasteType as keyof typeof wasteTypeColors] || '#6B7280';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 20px; 
        height: 20px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">${wasteType.charAt(0).toUpperCase()}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Add error handling for map initialization
  const handleMapLoad = (map: any) => {
    mapRef.current = map;
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup function to prevent memory leaks
      if (typeof window !== 'undefined') {
        // Remove any existing map instances
        const mapElements = document.querySelectorAll('.leaflet-container');
        mapElements.forEach(element => {
          if (element._leaflet_id) {
            element._leaflet_id = null;
          }
        });
      }
    };
  }, []);

  if (mapError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Map Error: {mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              setMapKey(prev => prev + 1);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!leafletLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={colors.textPrimary}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          whenCreated={handleMapLoad}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={createCustomMarker(point.wasteType)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: wasteTypeColors[point.wasteType as keyof typeof wasteTypeColors] }}
                    />
                    <h3 className="font-semibold text-gray-800">{point.location}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Type:</strong> {point.wasteType}</p>
                    <p><strong>Amount:</strong> {point.amount}</p>
                    <p><strong>Status:</strong> 
                      <span 
                        className="ml-1 px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: getStatusColor(point.status) }}
                      >
                        {point.status}
                      </span>
                    </p>
                    <p><strong>Reported:</strong> {point.createdAt}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <Button
            variant="primary"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="bg-white/90 text-gray-800 hover:bg-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        className={`w-80 ${colors.isDark ? 'bg-black/30' : 'bg-white/90'} backdrop-blur-lg border-l ${colors.borderPrimary} p-6 overflow-y-auto`}
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className={`text-2xl font-bold ${colors.textPrimary} mb-2`}>Waste Map</h2>
            <p className={`${colors.textSecondary} text-sm`}>
              Interactive map showing waste reports and collection points
            </p>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Filters</h3>
            </div>
            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                      : `${colors.bgSecondary} ${colors.textSecondary} ${colors.hoverBg}`
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${filter.color}`} />
                    <span>{filter.label}</span>
                    <span className="ml-auto text-sm">
                      {filter.id === 'all' 
                        ? wastePoints.length 
                        : wastePoints.filter(p => p.status === filter.id).length
                      }
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Waste Types</h3>
            <div className="space-y-2">
              {Object.entries(wasteTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className={colors.textSecondary}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Statistics</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-blue-400">{wastePoints.length}</div>
                <div className={`text-sm ${colors.textTertiary}`}>Total Reports</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-green-400">
                  {wastePoints.filter(p => p.status === 'collected').length}
                </div>
                <div className={`text-sm ${colors.textTertiary}`}>Collected</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-yellow-400">
                  {wastePoints.filter(p => p.status === 'pending').length}
                </div>
                <div className={`text-sm ${colors.textTertiary}`}>Pending</div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>Recent Reports</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredPoints.slice(0, 5).map((point) => (
                <div key={point.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`${colors.textPrimary} font-medium truncate`}>{point.location}</p>
                      <p className={`text-sm ${colors.textTertiary}`}>{point.wasteType} • {point.amount}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span 
                          className="px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: getStatusColor(point.status) }}
                        >
                          {point.status}
                        </span>
                        <span className={`text-xs ${colors.textMuted}`}>{point.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}
*/