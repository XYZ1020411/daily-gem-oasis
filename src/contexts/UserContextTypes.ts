
import { Product, Exchange, Announcement, GiftCode } from '@/hooks/useDatabase';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'vip' | 'user';
  status: 'active' | 'suspended' | 'inactive';
  points: number;
  vipLevel: number;
  joinDate: string;
  lastLogin: string;
  checkInStreak: number;
  lastCheckIn: string;
}

export interface UserContextType {
  user: User | null;
  profile: User | null;
  users: User[];
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  updateUserById: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updatePoints: (amount: number, description: string) => void;
  
  // 數據庫相關功能
  products: Product[];
  exchanges: Exchange[];
  announcements: Announcement[];
  giftCodes: GiftCode[];
  dbLoading: boolean;
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sync_version' | 'last_modified'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addExchange: (exchangeData: Omit<Exchange, 'id' | 'request_date' | 'sync_version' | 'last_modified'>) => Promise<Exchange>;
  updateExchange: (id: string, updates: Partial<Exchange>) => Promise<Exchange>;
  addAnnouncement: (announcementData: Omit<Announcement, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => Promise<Announcement>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addGiftCode: (giftCodeData: Omit<GiftCode, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => Promise<GiftCode>;
  updateGiftCode: (id: string, updates: Partial<GiftCode>) => Promise<GiftCode>;
  deleteGiftCode: (id: string) => Promise<void>;
  loadData: () => Promise<void>;
}
