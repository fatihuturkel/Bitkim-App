import * as Localization from 'expo-localization';
import { Appearance } from 'react-native';
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

// Define and export default user preferences
export const defaultUserPreferences: UserPreferences = {
  notifications: true,
  darkMode: Appearance.getColorScheme() === 'dark',
  language: Localization.getLocales()[0]?.languageCode || 'en',
};

interface UserActivity {
  lastActive: string;
  totalScans: number;
  favoriteLeaves: string[];
}

// Define and export default user activity
export const defaultUserActivity: UserActivity = {
  lastActive: new Date().toISOString(),
  totalScans: 0,
  favoriteLeaves: [],
};

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
  preferences: { ...defaultUserPreferences }, // Use default preferences
  activity: { ...defaultUserActivity }, // Use default activity

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
      preferences: { ...defaultUserPreferences }, // Reset to default preferences
      bio: undefined,
      activity: { ...defaultUserActivity }, // Reset to default activity
    }),
}));

export default useUserStore;