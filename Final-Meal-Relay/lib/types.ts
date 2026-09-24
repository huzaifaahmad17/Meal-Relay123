// Core domain types shared across the demo store, dashboards, and components.

export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

export type DonationStatus =
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'picked-up'
  | 'in-transit'
  | 'delivered'
  | 'cancelled';

export type FoodCategory =
  | 'cooked-meals'
  | 'fresh-produce'
  | 'packaged-food'
  | 'dairy-products'
  | 'baked-goods'
  | 'beverages'
  | 'frozen-food'
  | 'grains-cereals'
  | 'snacks'
  | 'desserts';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — never in real app
  role: UserRole;
  phone: string;
  avatarColor: string;
  initials: string;
  city: string;
  joinedAt: string;
  rating: number;
  // Role specific
  organization?: string; // donor businesses or NGO
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | 'van' | 'truck';
  capacity?: number; // NGO daily meal capacity
  servingAreas?: string[];
  location: LatLng;
  address: Address;
  stats: {
    totalDonations: number;
    totalKgRescued: number;
    mealsProvided: number;
    co2Saved: number;
    impactScore: number;
  };
  online?: boolean;
  isActive: boolean;
}

export interface Donation {
  id: string;
  donorId: string;
  ngoId?: string;
  volunteerId?: string;
  title: string;
  description: string;
  category: FoodCategory;
  cuisine: string;
  quantityKg: number;
  servings: number;
  isVegetarian: boolean;
  allergens: string[];
  imageUrl: string;
  pickupAddress: Address;
  pickupLocation: LatLng;
  dropoffLocation?: LatLng;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  expiresAt: string;
  status: DonationStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  trackingPath?: LatLng[];
  freshness: number; // 0-100
  estimatedMeals: number;
  co2SavedKg: number;
  beneficiaries?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  type: 'text' | 'system' | 'location' | 'image';
  createdAt: string;
  read: boolean;
  metadata?: {
    location?: LatLng & { address: string };
    imageUrl?: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'support';
  donationId?: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinned?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  type:
    | 'donation_created'
    | 'donation_accepted'
    | 'donation_picked_up'
    | 'donation_delivered'
    | 'message'
    | 'achievement'
    | 'system';
  title: string;
  description: string;
  link?: string;
  read: boolean;
  createdAt: string;
  icon?: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  actor: string;
  action: string;
  subject: string;
  meta?: Record<string, string | number>;
  createdAt: string;
}

export interface ImpactSnapshot {
  totalDonations: number;
  totalKgRescued: number;
  mealsProvided: number;
  co2Saved: number;
  activeUsers: number;
  partnerNGOs: number;
  activeVolunteers: number;
  citiesCovered: number;
}
