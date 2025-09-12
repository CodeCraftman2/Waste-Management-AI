export interface ComponentProps {
  children: React.ReactNode;
}

export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  verifier?: string;
  verifierId?: string;
  typeOfLogin?: string;
  aggregateVerifier?: string;
  dappShare?: string;
  oAuthIdToken?: string;
  oAuthAccessToken?: string;
  appState?: string;
  touchIDPreference?: string;
  isMfaEnabled?: boolean;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface WasteReport {
  id: number;
  userId: number;
  location: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'verified' | 'collected' | 'rejected';
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  points: number;
  level: number;
  balance: number;
  createdAt: string;
}

export interface Reward {
  id: number;
  userId: number;
  points: number;
  level: number;
  totalEarned: number;
}

export interface CollectionTask {
  id: number;
  reportId: number;
  collectorId?: number;
  status: 'available' | 'assigned' | 'completed';
  reward: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high';
}