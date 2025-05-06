/**
 * Fetches the authenticated user's data from Firebase Authentication and Firestore,
 * then updates the Zustand user store (`useUserStore`) with the combined information.
 *
 * It first checks for a currently authenticated user in Firebase Auth. If found,
 * it retrieves the user's UID, email, and email verification status directly from the
 * auth object. It then attempts to fetch the corresponding user document from the
 * 'users' collection in Firestore using the UID.
 *
 * If the Firestore document exists, it merges the data from the document
 * (like firstName, lastName, phoneNumber, bio, createdAt) with the email and
 * verification status from Firebase Auth. It carefully handles the `createdAt`
 * field, converting Firestore Timestamps, date strings, or numbers to ISO date strings.
 * The combined data is then set in the Zustand store using `setUserData`.
 *
 * If the Firestore document does not exist (e.g., first login after signup),
 * it sets default data in the Zustand store, using the email and verification
 * status from Firebase Auth and providing default empty values for other fields.
 *
 * If no user is authenticated, the function exits early.
 * In case of any errors during the Firestore fetch process, it clears the
 * user data in the Zustand store using `clearUserData`.
 *
 * @async
 * @function fetchAuthenticatedUserData
 * @returns {Promise<void>} A promise that resolves when the user data fetching
 *                          and store update process is complete (or an error occurs).
 *                          It does not return any value upon successful completion.
 * @throws {Error} Can potentially throw errors during Firestore operations, although
 *                 the current implementation catches them and clears user data instead
 *                 of re-throwing.
 *
 * @sideEffects Updates the state of `useUserStore` by calling `setUserData` or `clearUserData`.
 * @sideEffects Interacts with Firebase Authentication and Firestore services.
 */
import i18n from '@/i18n';
import useUserStore from '@/zustand/userStore'; // Adjust the path to your zustand store
import * as Localization from 'expo-localization';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Adjust the path if your firebaseConfig is elsewhere

export const retrieveCurrentUserData = async (): Promise<void> => {
  const { setUserData, clearUserData } = useUserStore.getState(); // Get actions directly from the store state

  try {
    const currentUser = auth.currentUser; // Get the current user from Firebase Auth
    
    // Try to reload the user to ensure we have the latest data
    // This will fail if there's no internet connection
    try {
      await currentUser?.reload();
    } catch (reloadError) {
      // Network error during reload, throw a more specific error
      throw new Error(i18n.t("error.network_error"));
    }

    if (!currentUser) {
      return; // Exit if no authenticated user is found
    }

    const userId = currentUser.uid; // Get the UID directly from the auth object

    // Get email and verification status directly from the authenticated user
    const authenticatedUserEmail = currentUser.email || '';
    const isUserVerified = currentUser.emailVerified; // Get verification status

    const userDocRef = doc(db, 'users', userId); // Reference to the user's document in the 'users' collection
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userDocumentData = userDocSnap.data();

      // Handle createdAt field carefully
      let createdAtISOString: string;
      const createdAtData = userDocumentData.createdAt;

      if (createdAtData && typeof createdAtData.toDate === 'function') {
        // It's a Firestore Timestamp
        createdAtISOString = createdAtData.toDate().toISOString();
      } else if (typeof createdAtData === 'string') {
        // It might already be an ISO string or another date string format
        // Attempt to parse it, fallback to current date if invalid
        const parsedDate = new Date(createdAtData);
        createdAtISOString = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString();
      } else if (typeof createdAtData === 'number') {
        // It might be a Unix timestamp (seconds or milliseconds)
        // Assuming milliseconds for Firestore, adjust if it's seconds (* 1000)
        createdAtISOString = new Date(createdAtData).toISOString();
      } else {
        // Fallback if createdAt is missing or has an unexpected type
        createdAtISOString = new Date().toISOString();
      }

      // Extract preferences from Firestore data with defaults if not present
      const preferences = {
        notifications: userDocumentData.preferences?.notifications ?? true,
        darkMode: userDocumentData.preferences?.darkMode ?? false,
        language: userDocumentData.preferences?.language ?? 
          (userDocumentData.language || Localization.getLocales()[0]?.languageCode || 'en'),
      };

      // Extract address if available
      const address = userDocumentData.address ? {
        street: userDocumentData.address.street || '',
        country: userDocumentData.address.country || '',
        postalCode: userDocumentData.address.postalCode || '',
      } : undefined;

      // Extract activity data if available
      const activity = {
        lastActive: userDocumentData.activity?.lastActive || new Date().toISOString(),
        totalScans: userDocumentData.activity?.totalScans || 0,
        favoriteLeaves: userDocumentData.activity?.favoriteLeaves || [],
      };

      setUserData({
        // Map Firestore data to your Zustand state structure
        firstName: userDocumentData.firstName || '',
        lastName: userDocumentData.lastName || '',
        phoneNumber: userDocumentData.phoneNumber || '',
        email: authenticatedUserEmail, // Use the email from the authenticated user
        isEmailVerified: isUserVerified, // Set the verified status from the authenticated user
        createdAt: createdAtISOString, // Use the processed ISO string
        bio: userDocumentData.bio || '',
        loggedIn: true, // Set logged in status
        preferences, // Include preferences from Firestore
        address, // Include address data if available
        activity, // Include activity data
      });
    } else {
      // Handle case where user document doesn't exist (e.g., first login)
      setUserData({
        // Set authentication data and leave other fields empty or default
        email: authenticatedUserEmail, // Use email from auth
        isEmailVerified: isUserVerified, // Use verified status from auth
        loggedIn: true,
        // Keep default preferences from the store
      });
    }
  } catch (error) {
    // Handle error (e.g., show a message, clear user data)
    //clearUserData(); // Clear data in case of an error
    
    // Re-throw the error with a descriptive message for better error handling
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user data: ${error.message}`);
    } else {
      throw new Error('Failed to fetch user data: Unknown error');
    }
  }
};

// You can add other data fetching/manipulation functions related to user data here
// e.g., updateUserData, createUserDocument, etc.