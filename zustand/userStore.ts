import * as Localization from 'expo-localization';
import { create } from 'zustand';

interface User {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  bio?: string;
  isEmailVerified?: boolean;
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  language: string;
}

interface UserActivity {
  lastActive: string;
  totalScans: number;
  favoriteLeaves: string[];
}

// Define the UserAddress interface
interface UserAddress {
  street?: string;
  country?: string;
  postalCode?: string;
}

export interface UserState extends User {
  loggedIn: boolean;
  address?: UserAddress;
  preferences?: UserPreferences;
  activity?: UserActivity;
  setLoggedIn: (loggedIn: boolean) => void;
  setUserData: (data: Partial<UserState>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateActivity: (activityData: Partial<UserActivity>) => void;
  updateAddress: (addressData: Partial<UserAddress>) => void;
  clearUserData: () => void;
}

const useUserStore = create<UserState>((set) => ({
  // Initial State
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  createdAt: new Date().toISOString(), // Default to current time
  bio: undefined,
  isEmailVerified: false,
  loggedIn: false,
  address: undefined, // Initialize address as undefined or with default values
  preferences: {
    notifications: true,
    darkMode: false,
    language: Localization.getLocales()[0]?.languageCode || 'en',
  },
  activity: {
    lastActive: new Date().toISOString(),
    totalScans: 0,
    favoriteLeaves: [],
  },

  // Actions
  setUserData: (data) => set((state) => ({ ...state, ...data })),
  
  setLoggedIn: (loggedIn) => set((state) => ({ ...state, loggedIn })),

  updatePreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences!, ...prefs },
    })),

  updateActivity: (activityData) =>
    set((state) => ({
      activity: { ...state.activity!, ...activityData },
    })),

  // Action to update address details
  updateAddress: (addressData) =>
    set((state) => ({
      address: { ...state.address, ...addressData }, // Merge existing address with new data
    })),

  clearUserData: () =>
    set({
      loggedIn: false,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      address: undefined, // Reset address
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
      bio: undefined,
      activity: {
        lastActive: new Date().toISOString(),
        totalScans: 0,
        favoriteLeaves: [],
      },
    }),
}));

export default useUserStore;