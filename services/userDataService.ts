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
import { ResultItem } from '@/components/ResultList'; // Added import
import i18n from '@/i18n';
import { UriPrediction } from '@/zustand/imagePredictionData'; // Added import
import useUserStore, { UserPreferences, UserState } from '@/zustand/userStore'; // Adjust the path to your zustand store
import { Ionicons } from '@expo/vector-icons'; // Added import for icon type consistency, though not directly used in logic
import * as FileSystem from 'expo-file-system'; // Import FileSystem
import * as Localization from 'expo-localization';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { deleteField, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
      }      // Extract preferences from Firestore data with defaults if not present
      const preferences = {
        notifications: userDocumentData.preferences?.notifications ?? true,
        darkMode: userDocumentData.preferences?.darkMode ?? false,
        language: userDocumentData.preferences?.language ?? 
          (userDocumentData.language || Localization.getLocales()[0]?.languageCode || 'en'),
        isBasicScanHistoryEnabled: userDocumentData.preferences?.isBasicScanHistoryEnabled ?? true, // Fixed to match the correct property name in UserPreferences interface
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

/**
 * Updates a user's preferences in both Firebase Firestore and the local Zustand store.
 * 
 * This function takes a partial UserPreferences object containing one or more preference 
 * settings to update. It first attempts to update the preferences in Firestore.
 * If successful, it then updates the local Zustand store with the same preferences.
 * 
 * @async
 * @function updateUserPreferences
 * @param {Partial<UserPreferences>} updatedPreferences - The preference settings to update
 * @returns {Promise<void>} A promise that resolves when the update is complete
 * @throws {Error} If there's no authenticated user, or if the Firestore update fails
 */
export const updateUserPreferences = async (updatedPreferences: Partial<UserPreferences>): Promise<void> => {
  const currentUser = auth.currentUser;
  const { updatePreferences } = useUserStore.getState(); // Get the update function from the store

  if (!currentUser) {
    throw new Error(i18n.t("error.not_authenticated"));
  }

  try {
    const userId = currentUser.uid;
    const userDocRef = doc(db, 'users', userId);
    
    // First, get the current document to ensure it exists
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      // Update only the specified preferences in Firestore
      // Using updateDoc to update only the specific preference fields
      await updateDoc(userDocRef, {
        'preferences': {
          // Merge with existing preferences
          ...(userDocSnap.data().preferences || {}),
          ...updatedPreferences
        }
      });
      
      // On successful Firestore update, update the local Zustand store
      updatePreferences(updatedPreferences);
    } else {
      // If user document doesn't exist yet, create it with the preferences
      await setDoc(userDocRef, {
        preferences: updatedPreferences,
        createdAt: new Date().toISOString()
      });
      
      // Update the local store
      updatePreferences(updatedPreferences);
    }
  } catch (error) {
    // Handle error appropriately
    console.error("Failed to update preferences:", error);
    if (error instanceof Error) {
      throw new Error(`${i18n.t("error.update_preferences")}: ${error.message}`);
    } else {
      throw new Error(i18n.t("error.update_preferences"));
    }
  }
};

/**
 * Updates a user's first name and last name in both Firebase Firestore and the local Zustand store.
 *
 * This function takes an object containing the `firstName` and/or `lastName` to update.
 * It first attempts to update these fields in Firestore. If successful, it then updates
 * the local Zustand store.
 *
 * @async
 * @function updateUserProfileName
 * @param {Partial<Pick<UserState, 'firstName' | 'lastName'>>} nameUpdates - The name fields to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @throws {Error} If there's no authenticated user, or if the Firestore update fails.
 */
export const updateUserProfileName = async (nameUpdates: Partial<Pick<UserState, 'firstName' | 'lastName'>>): Promise<void> => {
  const currentUser = auth.currentUser;
  const { setUserData } = useUserStore.getState(); // Get the setUserData function from the store

  if (!currentUser) {
    throw new Error(i18n.t("error.not_authenticated"));
  }

  const trimmedFirstName = nameUpdates.firstName?.trim();
  const trimmedLastName = nameUpdates.lastName?.trim();

  // Service-level validation
  // Check if at least one name field is being provided for update
  if (!nameUpdates.hasOwnProperty('firstName') && !nameUpdates.hasOwnProperty('lastName')) {
    // This case might indicate an issue with how the function is called,
    // or it could be a valid scenario where no update is intended.
    // For now, we assume the UI prevents completely empty calls if an update is expected.
    // If an update *must* have at least one field, you could throw an error here.
    console.log("No specific name fields provided for update.");
    return; 
  }
  
  // Validate firstName if it's part of the update
  if (nameUpdates.hasOwnProperty('firstName') && !trimmedFirstName) {
    throw new Error(i18n.t('error.first_name_required'));
  }

  // Validate lastName if it's part of the update
  if (nameUpdates.hasOwnProperty('lastName') && !trimmedLastName) {
    throw new Error(i18n.t('error.last_name_required'));
  }

  try {
    const userId = currentUser.uid;
    const userDocRef = doc(db, 'users', userId);

    // Prepare the data for Firestore update, only including fields that have valid, trimmed values
    const firestoreUpdateData: { firstName?: string; lastName?: string } = {};
    if (nameUpdates.hasOwnProperty('firstName') && trimmedFirstName) {
      firestoreUpdateData.firstName = trimmedFirstName;
    }
    if (nameUpdates.hasOwnProperty('lastName') && trimmedLastName) {
      firestoreUpdateData.lastName = trimmedLastName;
    }

    // Only proceed if there's actually something to update
    if (Object.keys(firestoreUpdateData).length === 0) {
      // This could happen if inputs were spaces only, and now they are empty after trim.
      // The UI should ideally catch "no changes detected" before this.
      // If we reach here, it means the intent was to update but values became invalid.
      // Depending on strictness, you might throw or just log.
      // Re-checking against current store values to see if it's truly "no change" vs "invalid new value"
      // is more complex here and better handled by UI's "no changes" logic.
      // For now, if firestoreUpdateData is empty, it means valid inputs were not provided for the intended fields.
      // This scenario should be caught by the individual field checks above.
      // If, for example, only firstName was provided but it was empty after trim, an error would have been thrown.
      // If both were provided but both were empty after trim, errors would have been thrown.
      // So, if we reach here and firestoreUpdateData is empty, it implies an edge case or
      // that no fields intended for update had valid values.
      // The existing `if (!nameUpdates.firstName && !nameUpdates.lastName)` at the component level
      // and the `hasOwnProperty` checks should largely prevent an empty `firestoreUpdateData`
      // unless the provided values for update were just whitespace.
      console.log("No valid name data to update after trimming.");
      // If you want to be strict and say that an attempt to update with only whitespace is an error:
      // throw new Error(i18n.t("error.invalid_name_format", { defaultValue: "Name fields cannot be only whitespace."}));
      return; // Or throw, depending on desired behavior for whitespace-only inputs
    }


    // Update the document in Firestore
    await updateDoc(userDocRef, firestoreUpdateData);

    // On successful Firestore update, update the local Zustand store
    // Only pass the fields that were actually updated to setUserData
    setUserData(firestoreUpdateData);

  } catch (error) {
    console.error("Failed to update user name:", error);
    // If it's one of our specific validation errors, re-throw it as is
    if (error instanceof Error && 
        (error.message === i18n.t('error.first_name_required') || 
         error.message === i18n.t('error.last_name_required'))) {
      throw error;
    }
    // Otherwise, wrap it in a generic update error message
    if (error instanceof Error) {
      throw new Error(`${i18n.t("error.update_profile_name", { defaultValue: "Failed to update profile name" })}: ${error.message}`);
    } else {
      throw new Error(i18n.t("error.update_profile_name", { defaultValue: "Failed to update profile name" }));
    }
  }
};

/**
 * Updates a user's phone number in both Firebase Firestore and the local Zustand store.
 *
 * This function takes the new phone number as a string.
 * It first attempts to update the `phoneNumber` field in Firestore. If successful,
 * it then updates the local Zustand store.
 *
 * @async
 * @function updateUserPhoneNumber
 * @param {string} phoneNumber - The new phone number.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @throws {Error} If there's no authenticated user, or if the Firestore update fails.
 */
export const updateUserPhoneNumber = async (phoneNumber: string): Promise<void> => {
  const currentUser = auth.currentUser;
  const { setUserData } = useUserStore.getState(); // Get the setUserData function from the store

  if (!currentUser) {
    throw new Error(i18n.t("error.not_authenticated"));
  }

  const trimmedPhoneNumber = phoneNumber?.trim();

  // Service-level validation
  if (!trimmedPhoneNumber) {
    throw new Error(i18n.t("error.phone_number_required", { defaultValue: "Phone number is required." }));
  }

  // Basic validation for phone number format (e.g., 10 digits)
  // Adjust regex as per your specific requirements for phone number formats
  const phoneRegex = /^\d{10}$/; 
  if (!phoneRegex.test(trimmedPhoneNumber)) {
    throw new Error(i18n.t("error.phone_number_invalid_format", { defaultValue: "Phone number format is invalid. Expected 10 digits." }));
  }

  try {
    const userId = currentUser.uid;
    const userDocRef = doc(db, 'users', userId);

    // Prepare the data for Firestore update
    const firestoreUpdateData = { phoneNumber: trimmedPhoneNumber };

    // Update the document in Firestore
    await updateDoc(userDocRef, firestoreUpdateData);

    // On successful Firestore update, update the local Zustand store
    setUserData({ phoneNumber: trimmedPhoneNumber });

  } catch (error) {
    console.error("Failed to update phone number:", error);
    // If it's one of our specific validation errors, re-throw it as is
    if (error instanceof Error &&
        (error.message === i18n.t("error.phone_number_required", { defaultValue: "Phone number is required." }) ||
         error.message === i18n.t("error.phone_number_invalid_format", { defaultValue: "Phone number format is invalid. Expected 10 digits." }))) {
      throw error;
    }
    // Otherwise, wrap it in a generic update error message
    if (error instanceof Error) {
      throw new Error(`${i18n.t("error.update_phone_number", { defaultValue: "Failed to update phone number" })}: ${error.message}`);
    } else {
      throw new Error(i18n.t("error.update_phone_number", { defaultValue: "Failed to update phone number" }));
    }
  }
};



export const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
  const { setUserData } = useUserStore.getState();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userData = {
    email,
    firstName,
    lastName,
    isEmailVerified: user.emailVerified,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);
  setUserData({ ...userData, loggedIn: true });
};

export const fetchBaseAnalyzeHistory = async (language: string = 'en'): Promise<ResultItem[]> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(i18n.t('error.not_authenticated', { defaultValue: "User not authenticated." }));
  }

  try {
    const userHistoryRef = doc(db, 'user_legacy_scan_history', currentUser.uid);
    const docSnap = await getDoc(userHistoryRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      const items: ResultItem[] = Object.keys(firestoreData)
        .map(key => {          const record = firestoreData[key] as UriPrediction;
          const topPrediction = record.prediction?.analysis_results?.top_prediction;
          const alternativePredictions = record.prediction?.analysis_results?.alternative_predictions || [];
          const performanceMetrics = record.prediction?.performance_metrics;
          
          // We'll prepare detailed results similar to legacyanalyze
          const analysisResults: ResultItem[] = [];
          
          // Add top prediction
          if (topPrediction) {
            let title = '';
            const details = [];
            if (language === 'tr') {
              title = i18n.t('analyze.top_prediction', { name: topPrediction.turkish_name || 'N/A' });
              details.push(i18n.t('analyze.english', { name: topPrediction.english_name || 'N/A' }));
              details.push(i18n.t('analyze.latin', { name: topPrediction.latin_name || 'N/A' }));
            } else {
              title = i18n.t('analyze.top_prediction', { name: topPrediction.english_name || 'N/A' });
              details.push(i18n.t('analyze.turkish', { name: topPrediction.turkish_name || 'N/A' }));
              details.push(i18n.t('analyze.latin', { name: topPrediction.latin_name || 'N/A' }));
            }
            details.push(i18n.t('analyze.confidence', { percentage: (topPrediction.confidence * 100).toFixed(2) }));
            
            analysisResults.push({
              id: `${key}-top-prediction`,
              title: title,
              details: details,
              icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
              status: i18n.t('analyze.prediction'),
              isItemCollapsible: true,
              initiallyItemCollapsed: true,
            });
          }
          
          // Add alternative predictions
          if (alternativePredictions && alternativePredictions.length > 0) {
            alternativePredictions.forEach((alt, index) => {
              let title = '';
              const details = [];
              if (language === 'tr') {
                title = i18n.t('analyze.alternative_prediction', { 
                  index: index + 1, 
                  name: alt.turkish_name || 'N/A'
                });
                details.push(i18n.t('analyze.english', { name: alt.english_name || 'N/A' }));
                details.push(i18n.t('analyze.latin', { name: alt.latin_name || 'N/A' }));
              } else {
                title = i18n.t('analyze.alternative_prediction', { 
                  index: index + 1, 
                  name: alt.english_name || 'N/A' 
                });
                details.push(i18n.t('analyze.turkish', { name: alt.turkish_name || 'N/A' }));
                details.push(i18n.t('analyze.latin', { name: alt.latin_name || 'N/A' }));
              }
              details.push(i18n.t('analyze.confidence', { percentage: (alt.confidence * 100).toFixed(2) }));
              
              analysisResults.push({
                id: `${key}-alt-prediction-${index}`,
                title: title,
                details: details,
                icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
                status: i18n.t('analyze.alternative'),
                isItemCollapsible: true,
                initiallyItemCollapsed: true,
              });
            });
          }
          
          // Add performance metrics if available
          if (performanceMetrics) {
            analysisResults.push({
              id: `${key}-performance-metrics`,
              title: i18n.t('analyze.performance_metrics'),
              details: [
                i18n.t('analyze.preprocessing', { ms: performanceMetrics.preprocessing_ms?.toString() || '0' }),
                i18n.t('analyze.inference', { ms: performanceMetrics.inference_ms?.toString() || '0' }),
                i18n.t('analyze.postprocessing', { ms: performanceMetrics.postprocessing_ms?.toString() || '0' }),
              ],
              icon: 'speedometer-outline' as keyof typeof Ionicons.glyphMap,
              status: i18n.t('analyze.metrics'),
              isItemCollapsible: true,
              initiallyItemCollapsed: true,
            });
          }
          
          // Create summary for the main history view
          const itemDetails: string[] = [];

          if (topPrediction) {
            // Use language parameter to display appropriate name
            if (language === 'tr') {
              itemDetails.push(
              `${i18n.t('analyze.top_prediction', { name: topPrediction.turkish_name || 'N/A' })}`
              );
              itemDetails.push(
                `${i18n.t('analyze.confidence', { percentage: (topPrediction.confidence * 100).toFixed(1) })}`
              );
            } else {
              // Default to English for any other language setting
              itemDetails.push(
                `${i18n.t('analyze.top_prediction', { name: topPrediction.english_name || 'N/A' })}: ${(topPrediction.confidence * 100).toFixed(1)}%`
              );
              if (topPrediction.latin_name) {
                itemDetails.push(
                  i18n.t('analyze.latin', { name: topPrediction.latin_name })
                );
              }
            }
          } else {
            itemDetails.push(i18n.t('analyze.no_prediction_data', { defaultValue: "No prediction data available." }));
          }          let title = key; // Default title to the Firestore document key
          let imageUrl = null; // Initialize imageUrl variable

          // Use top prediction as title if available, based on language
          if (topPrediction) {
            if (language === 'tr' && topPrediction.turkish_name) {
              title = topPrediction.turkish_name;
            } else if (topPrediction.english_name) {
              title = topPrediction.english_name;
            }
          } else {
            // Fall back to filename if no prediction is available
            // Use permanent image path if available, otherwise fallback to uri
            if (record.permanentImagePath) {
              imageUrl = record.permanentImagePath;
              const permanentPathString = String(record.permanentImagePath);
              try {
                // Get filename from permanent path
                const decodedPath = decodeURIComponent(permanentPathString);
                const lastSlashIndex = decodedPath.lastIndexOf('/');
                if (lastSlashIndex !== -1 && lastSlashIndex < decodedPath.length - 1) {
                  title = decodedPath.substring(lastSlashIndex + 1);
                } else if (decodedPath) {
                  title = decodedPath;
                }
              } catch (e) {
                // Fallback for permanent path handling errors
                const lastSlashIdx = permanentPathString.lastIndexOf('/');
                if (lastSlashIdx !== -1 && lastSlashIdx < permanentPathString.length - 1) {
                  title = decodeURIComponent(permanentPathString.substring(lastSlashIdx + 1));
                } else if (permanentPathString) {
                  title = decodeURIComponent(permanentPathString);
                }
              }
            } else if (record.uri) {
              // Fallback to original URI if no permanent path is available
              imageUrl = record.uri;
              const uriString = String(record.uri);
              try {
                // Attempt to decode and extract the last segment of the URI path
                const decodedUriPath = decodeURIComponent(uriString.includes('://') ? new URL(uriString).pathname : uriString);
                const lastSlashIndex = decodedUriPath.lastIndexOf('/');
                if (lastSlashIndex !== -1 && lastSlashIndex < decodedUriPath.length - 1) {
                  title = decodedUriPath.substring(lastSlashIndex + 1);
                } else if (decodedUriPath) { // If no slash, or it's the last char, but path is not empty
                  title = decodedUriPath;
                }
              } catch (e) {
                // Fallback for invalid URIs or if URL parsing fails: use the part after the last slash
                const lastSlashIdx = uriString.lastIndexOf('/');
                if (lastSlashIdx !== -1 && lastSlashIdx < uriString.length - 1) {
                  title = decodeURIComponent(uriString.substring(lastSlashIdx + 1));
                } else if (uriString) {
                  title = decodeURIComponent(uriString);
                }                  // If all else fails, title remains 'key'
              }
            }
          }

          // Set image URL regardless of title source
          if (record.permanentImagePath) {
            imageUrl = record.permanentImagePath;
          } else if (record.uri) {
            imageUrl = record.uri;
          }          return {
            id: key,
            title: title, // Use the derived title (from URI or key)
            timestamp: record.scanDate,
            details: itemDetails,
            icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
            isItemCollapsible: true,
            initiallyItemCollapsed: true,
            imageUrl: imageUrl, // Add the image URL
            expandedDetails: {
              analysisResults: analysisResults,
              imageSource: imageUrl,
            },
          };
        })
        .sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());
      return items;
    } else {
      return []; // No history document found
    }
  } catch (e) {
    console.error("Failed to fetch base analysis history from service:", e);
    // Re-throw a more specific error or a generic one for the component to handle
    if (e instanceof Error) {
        throw new Error(i18n.t('error.fetch_data_error_service', {defaultValue: `Failed to fetch history: ${e.message}`}));
    }
    throw new Error(i18n.t('error.fetch_data_error_service', {defaultValue: "Failed to fetch history due to an unknown error."}));
  }
};

export const deleteBaseAnalyzeHistoryRecord = async (recordId: string, imagePath?: string | null): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(i18n.t('error.not_authenticated', { defaultValue: "User not authenticated." }));
  }

  try {
    // Delete the record from Firestore
    const userHistoryRef = doc(db, 'user_legacy_scan_history', currentUser.uid);
    await updateDoc(userHistoryRef, {
      [recordId]: deleteField()
    });

    // Attempt to delete the local image file if a path is provided and it's a local file
    if (imagePath && imagePath.startsWith('file://')) {
      try {
        await FileSystem.deleteAsync(imagePath);
        console.log(`Successfully deleted local image: ${imagePath}`);
      } catch (fileError) {
        console.error(`Failed to delete local image ${imagePath}:`, fileError);
        // Optionally, decide if this error should be surfaced to the user
        // For now, we'll log it and let the Firestore deletion be the primary success/failure indicator
      }
    }

  } catch (e) {
    console.error("Failed to delete base analysis history record from service:", e);
    if (e instanceof Error) {
      throw new Error(i18n.t('error.delete_record_error_service', { defaultValue: `Failed to delete record: ${e.message}` }));
    }
    throw new Error(i18n.t('error.delete_record_error_service', { defaultValue: "Failed to delete record due to an unknown error." }));
  }
};



