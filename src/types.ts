/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NavigationTab {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  CREATE_REPORT = 'create_report',
  SEARCH = 'search',
  ADMIN_DASHBOARD = 'admin_dashboard',
  MODERATION = 'moderation',
  USERS = 'users',
  ABOUT = 'about',
  CONTACT = 'contact',
  LOGIN = 'login',
  ANALYTICS = 'analytics',
  MESSAGES = 'messages'
}

export enum ItemCategory {
  ELECTRONICS = 'electronics',
  WALLETS = 'wallets',
  KEYS = 'keys',
  BAGS = 'bags',
  CLOTHING = 'clothing',
  PETS = 'pets',
  OTHER = 'other'
}

export enum ItemStatus {
  LOST = 'lost',
  FOUND = 'found',
  RETURNED = 'returned',
  PENDING = 'pending'
}

export interface LostOrFoundItem {
  id: string;
  name: string;
  category: ItemCategory;
  categoryLabel: string;
  status: ItemStatus;
  primaryColor?: string;
  brand?: string;
  description: string;
  date: string;
  location: string;
  locationContext?: string;
  imageUrl: string;
  reportedBy?: string;
  reportedEmail?: string;
}

export interface ModerationItem {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  description: string;
  date: string;
  location: string;
  reportedBy: string;
  reportedEmail: string;
  imageUrl: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  imageUrl?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  itemCategory: string;
  time: string;
  status: 'Pending' | 'Verified' | 'Matched' | 'Updated';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  item_id?: string;
  finder_email?: string;
  finder_contact?: string;
  status: 'pending' | 'approved' | 'rejected';
  owner_confirmed?: boolean;
  finder_confirmed?: boolean;
  created_at: string;
}

export interface AppStats {
  totalItems:        number;
  lostItems:         number;
  foundItems:        number;
  returnedItems:     number;
  recoveryRate:      number;
  totalUsers:        number;
  pendingModeration: number;
}
