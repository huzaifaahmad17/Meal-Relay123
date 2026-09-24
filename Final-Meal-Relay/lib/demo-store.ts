'use client';

import {
  ActivityEvent,
  AppNotification,
  ChatMessage,
  ChatRoom,
  DemoUser,
  Donation,
  DonationStatus,
  ImpactSnapshot,
  LatLng,
  UserRole,
} from './types';
import {
  seedActivity,
  seedChatRooms,
  seedDonations,
  seedMessages,
  seedNotifications,
  seedUsers,
} from './seed-data';

// ────────────────────────────────────────────────────────────────────────────────
// Storage layer
// ────────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'meal-relay-demo-store-v3';
const SESSION_KEY = 'zwl-session-v2';

interface StoreState {
  users: DemoUser[];
  donations: Donation[];
  rooms: ChatRoom[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  activity: ActivityEvent[];
}

const initialState = (): StoreState => ({
  users: structuredClone(seedUsers),
  donations: structuredClone(seedDonations),
  rooms: structuredClone(seedChatRooms),
  messages: structuredClone(seedMessages),
  notifications: structuredClone(seedNotifications),
  activity: structuredClone(seedActivity),
});

let state: StoreState | null = null;
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== 'undefined';

function load(): StoreState {
  if (state) return state;
  if (!isBrowser()) {
    state = initialState();
    return state;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as StoreState;
      return state;
    }
  } catch {
    // ignore corrupt state
  }
  state = initialState();
  persist();
  return state;
}

function persist() {
  if (!isBrowser() || !state) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetStore() {
  state = initialState();
  persist();
  notify();
}

// ────────────────────────────────────────────────────────────────────────────────
// Selectors
// ────────────────────────────────────────────────────────────────────────────────
export function getUsers(): DemoUser[] {
  return load().users;
}

export function getUserById(id?: string): DemoUser | undefined {
  if (!id) return undefined;
  return load().users.find((u) => u.id === id);
}

export function getUsersByRole(role: UserRole): DemoUser[] {
  return load().users.filter((u) => u.role === role);
}

export function getDonations(): Donation[] {
  return load().donations;
}

export function getDonationById(id: string): Donation | undefined {
  return load().donations.find((d) => d.id === id);
}

export function getDonationsByDonor(donorId: string): Donation[] {
  return load().donations.filter((d) => d.donorId === donorId);
}

export function getDonationsByNGO(ngoId: string): Donation[] {
  return load().donations.filter((d) => d.ngoId === ngoId);
}

export function getDonationsByVolunteer(volunteerId: string): Donation[] {
  return load().donations.filter((d) => d.volunteerId === volunteerId);
}

export function getPendingDonations(): Donation[] {
  return load().donations.filter((d) => d.status === 'pending');
}

export function getRooms(): ChatRoom[] {
  return load().rooms;
}

export function getRoomById(id?: string): ChatRoom | undefined {
  if (!id) return undefined;
  return load().rooms.find((r) => r.id === id);
}

export function getRoomsForUser(userId: string): ChatRoom[] {
  return load().rooms.filter((r) => r.participantIds.includes(userId));
}

export function getMessagesForRoom(roomId: string): ChatMessage[] {
  return load()
    .messages.filter((m) => m.roomId === roomId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getNotificationsForUser(userId: string): AppNotification[] {
  return load()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRecentActivity(limit = 12): ActivityEvent[] {
  return load()
    .activity.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// ────────────────────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────────────────────
function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreateDonationInput {
  donorId: string;
  title: string;
  description: string;
  category: Donation['category'];
  cuisine?: string;
  quantityKg: number;
  isVegetarian: boolean;
  allergens?: string[];
  pickupAddress: Donation['pickupAddress'];
  pickupLocation: LatLng;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  expiresAt: string;
  notes?: string;
  imageUrl?: string;
  priority?: Donation['priority'];
}

export function createDonation(input: CreateDonationInput): Donation {
  const s = load();
  const servings = Math.round(input.quantityKg * 3);
  const donation: Donation = {
    id: uid('don'),
    donorId: input.donorId,
    title: input.title,
    description: input.description,
    category: input.category,
    cuisine: input.cuisine || 'Indian',
    quantityKg: input.quantityKg,
    servings,
    isVegetarian: input.isVegetarian,
    allergens: input.allergens || [],
    imageUrl:
      input.imageUrl ||
      'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800',
    pickupAddress: input.pickupAddress,
    pickupLocation: input.pickupLocation,
    pickupWindowStart: input.pickupWindowStart,
    pickupWindowEnd: input.pickupWindowEnd,
    expiresAt: input.expiresAt,
    status: 'pending',
    priority: input.priority || 'medium',
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    freshness: 95,
    estimatedMeals: servings,
    co2SavedKg: Math.round(input.quantityKg * 0.7 * 10) / 10,
  };
  s.donations = [donation, ...s.donations];

  // Update donor stats
  const donor = s.users.find((u) => u.id === input.donorId);
  if (donor) {
    donor.stats.totalDonations += 1;
    donor.stats.totalKgRescued += input.quantityKg;
    donor.stats.mealsProvided += servings;
    donor.stats.co2Saved += donation.co2SavedKg;
    donor.stats.impactScore += Math.round(input.quantityKg * 10);
  }

  // Activity event
  s.activity = [
    {
      id: uid('act'),
      userId: input.donorId,
      actor: donor?.name || 'Donor',
      action: 'created',
      subject: input.title,
      meta: { quantity: `${input.quantityKg} kg`, servings },
      createdAt: new Date().toISOString(),
    },
    ...s.activity,
  ];

  // Notify donor
  s.notifications = [
    {
      id: uid('notif'),
      userId: input.donorId,
      type: 'donation_created',
      title: 'Donation listed',
      description: `Your donation "${input.title}" is now visible to nearby NGOs.`,
      read: false,
      createdAt: new Date().toISOString(),
      icon: 'package',
      link: '/dashboard',
    },
    ...s.notifications,
  ];

  persist();
  notify();
  return donation;
}

export function updateDonationStatus(
  donationId: string,
  status: DonationStatus,
  options?: { ngoId?: string; volunteerId?: string },
) {
  const s = load();
  const donation = s.donations.find((d) => d.id === donationId);
  if (!donation) return;
  donation.status = status;
  donation.updatedAt = new Date().toISOString();
  if (options?.ngoId) donation.ngoId = options.ngoId;
  if (options?.volunteerId) donation.volunteerId = options.volunteerId;

  // Push activity
  s.activity = [
    {
      id: uid('act'),
      userId: options?.ngoId || options?.volunteerId || donation.donorId,
      actor: 'System',
      action: status.replace('-', ' '),
      subject: donation.title,
      createdAt: new Date().toISOString(),
    },
    ...s.activity,
  ];

  // Notify donor
  s.notifications = [
    {
      id: uid('notif'),
      userId: donation.donorId,
      type:
        status === 'accepted'
          ? 'donation_accepted'
          : status === 'picked-up'
          ? 'donation_picked_up'
          : status === 'delivered'
          ? 'donation_delivered'
          : 'system',
      title: `Donation ${status.replace('-', ' ')}`,
      description: `${donation.title} is now ${status.replace('-', ' ')}.`,
      read: false,
      createdAt: new Date().toISOString(),
      icon: 'truck',
      link: '/dashboard',
    },
    ...s.notifications,
  ];

  persist();
  notify();
}

export function sendMessage(
  roomId: string,
  sender: { id: string; name: string; role: UserRole },
  content: string,
) {
  if (!content.trim()) return;
  const s = load();
  const room = s.rooms.find((r) => r.id === roomId);
  if (!room) return;
  const msg: ChatMessage = {
    id: uid('m'),
    roomId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    content,
    type: 'text',
    createdAt: new Date().toISOString(),
    read: false,
  };
  s.messages = [...s.messages, msg];
  room.lastMessage = msg;
  room.unreadCount += 1;
  persist();
  notify();
  return msg;
}

export function markRoomRead(roomId: string) {
  const s = load();
  const room = s.rooms.find((r) => r.id === roomId);
  if (!room) return;
  room.unreadCount = 0;
  s.messages = s.messages.map((m) =>
    m.roomId === roomId ? { ...m, read: true } : m,
  );
  persist();
  notify();
}

export function markNotificationRead(notificationId: string) {
  const s = load();
  s.notifications = s.notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n,
  );
  persist();
  notify();
}

export function markAllNotificationsRead(userId: string) {
  const s = load();
  s.notifications = s.notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n,
  );
  persist();
  notify();
}

// ────────────────────────────────────────────────────────────────────────────────
// Aggregations / impact snapshot
// ────────────────────────────────────────────────────────────────────────────────
export function getImpactSnapshot(): ImpactSnapshot {
  const s = load();
  const totalDonations = s.donations.length;
  const totalKgRescued = s.donations.reduce((acc, d) => acc + d.quantityKg, 0);
  const mealsProvided = s.donations.reduce((acc, d) => acc + d.estimatedMeals, 0);
  const co2Saved = s.donations.reduce((acc, d) => acc + d.co2SavedKg, 0);
  const partnerNGOs = s.users.filter((u) => u.role === 'ngo').length;
  const activeVolunteers = s.users.filter((u) => u.role === 'volunteer').length;
  const cities = new Set(s.users.map((u) => u.city));
  return {
    totalDonations,
    totalKgRescued: Math.round(totalKgRescued),
    mealsProvided,
    co2Saved: Math.round(co2Saved),
    activeUsers: s.users.length,
    partnerNGOs,
    activeVolunteers,
    citiesCovered: cities.size,
  };
}

export function getDonationsByDay(days = 14) {
  const s = load();
  const buckets: { date: string; donations: number; meals: number; kg: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    buckets.push({ date: key, donations: 0, meals: 0, kg: 0 });
  }
  s.donations.forEach((d) => {
    const key = d.createdAt.slice(0, 10);
    const bucket = buckets.find((b) => b.date === key);
    if (bucket) {
      bucket.donations += 1;
      bucket.meals += d.estimatedMeals;
      bucket.kg += d.quantityKg;
    }
  });
  // Pad realistic numbers for demo (so chart isn't empty)
  let baseline = 12;
  return buckets.map((b, i) => ({
    ...b,
    donations: b.donations || baseline + Math.round(Math.sin(i) * 3 + (i % 4)),
    meals: b.meals || (baseline + Math.round(Math.sin(i) * 3 + (i % 4))) * 18,
    kg: b.kg || (baseline + Math.round(Math.sin(i) * 3 + (i % 4))) * 6,
  }));
}

export function getDonationsByCategory() {
  const s = load();
  const counts = new Map<string, number>();
  s.donations.forEach((d) => {
    counts.set(d.category, (counts.get(d.category) || 0) + d.quantityKg);
  });
  const labelMap: Record<string, string> = {
    'cooked-meals': 'Cooked Meals',
    'fresh-produce': 'Fresh Produce',
    'packaged-food': 'Packaged',
    'dairy-products': 'Dairy',
    'baked-goods': 'Baked Goods',
    beverages: 'Beverages',
    'frozen-food': 'Frozen',
    'grains-cereals': 'Grains',
    snacks: 'Snacks',
    desserts: 'Desserts',
  };
  return Array.from(counts.entries()).map(([key, value]) => ({
    name: labelMap[key] || key,
    value: Math.round(value),
  }));
}

export function getDonationStatusBreakdown() {
  const s = load();
  const counts: Record<string, number> = {};
  s.donations.forEach((d) => {
    counts[d.status] = (counts[d.status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export function getCityBreakdown() {
  const s = load();
  const counts = new Map<string, number>();
  s.users.forEach((u) => {
    if (u.role === 'donor' || u.role === 'ngo') {
      counts.set(u.city, (counts.get(u.city) || 0) + 1);
    }
  });
  return Array.from(counts.entries()).map(([city, count]) => ({ city, count }));
}

// ────────────────────────────────────────────────────────────────────────────────
// Auth — fully client-side, demo only
// ────────────────────────────────────────────────────────────────────────────────
export interface SessionUser extends DemoUser {}

export function login(email: string, password: string): SessionUser | null {
  const user = load().users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) return null;
  if (isBrowser()) {
    window.localStorage.setItem(SESSION_KEY, user.id);
  }
  notify();
  return user;
}

export function logout() {
  if (isBrowser()) {
    window.localStorage.removeItem(SESSION_KEY);
  }
  notify();
}

export function getCurrentUser(): SessionUser | null {
  if (!isBrowser()) return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUserById(id) || null;
}

export function setCurrentUser(userId: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSION_KEY, userId);
  notify();
}

export const DEMO_CREDENTIALS = [
  { role: 'donor', email: 'priya@tajpalace.com', password: 'demo1234', label: 'Priya Menon (Taj Palace, Jaipur)' },
  { role: 'ngo', email: 'contact@jaipurfoodbank.org', password: 'demo1234', label: 'Jaipur Food Bank' },
  { role: 'volunteer', email: 'amit.k@volunteer.com', password: 'demo1234', label: 'Amit Kumar (Volunteer)' },
  { role: 'admin', email: 'admin@mealrelay.org', password: 'admin1234', label: 'Aarav Sharma (Admin)' },
] as const;
