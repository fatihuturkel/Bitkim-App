/**
 * `ChangeEmailPage` Component
 *
 * This component renders a screen that allows authenticated users to change their account's email address.
 * It requires the user to enter their desired new email address and their current password for verification.
 *
 * Features:
 * - Input fields for the new email address and current password.
 * - Input validation for both fields (format, presence, password length).
 * - Re-authenticates the user using their current password via Firebase Authentication.
 * - Updates the email address in Firebase Authentication.
 * - Updates the user's email in the Zustand global state (`userStore`).
 * - Sends a verification email to the newly updated email address.
 * - Handles various Firebase Authentication errors gracefully (e.g., wrong password, email already in use, invalid email, requires recent login).
 * - Provides user feedback through toast notifications for success and error messages.
 * - Displays a loading state during the email change process.
 * - Integrates with `expo-router` for navigation and header customization (adds a "Save" button).
 * - Uses `KeyboardAvoidingView` and `ScrollView` for better user experience on different screen sizes and when the keyboard is visible.
 *
 * State Management:
 * - `newEmail`, `currentPassword`: Store user input.
 * - `newEmailError`, `currentPasswordError`: Store validation error messages for the respective fields.
 * - `isLoading`: Tracks the asynchronous operation state for changing the email.
 * - `toastVisible`, `toastMessage`, `toastType`: Manage the visibility, content, and type of toast notifications.
 * - `useUserStore`: Connects to the Zustand store to update the user's email globally after a successful change.
 *
 * Hooks:
 * - `useState`: Manages local component state.
 * - `useCallback`: Memoizes functions (`showToast`, `validateInputs`, `handleChangeEmail`) to optimize performance and prevent unnecessary re-renders, especially when passed as dependencies or props.
 * - `useLayoutEffect`: Configures the navigation header options (title, save button) before the component renders.
 * - `useNavigation`: Accesses the navigation object provided by `expo-router`.
 *
 * @returns {React.ReactElement} The rendered change email screen.
 */

// External libraries
import React, { useLayoutEffect, useState, useCallback } from "react";
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";

// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import ToastNotification from "@/components/ToastNotification";
import AppleSection from "@/components/Section";
import FormInputField from "@/components/Input";
import { ThemedView } from "@/components/ThemedView";
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function ChangeEmailPage() {
  // For header options
  const navigation = useNavigation();

  const authenticatedUser = auth.currentUser;

  // Update user email in Zustand store
  const updateUserEmailInStore = useUserStore((state) => state.setUserData);


  // State for form inputs
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');


  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // State for toast notification
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Show toast message
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  // Dismiss toast message
  const dismissToast = () => {
    setToastVisible(false);
  }

  const validateInputs = useCallback((): boolean => { // Wrap in useCallback
    let isValid = true;

    // Validate new email
    if (!newEmail) {
      setNewEmailError('New email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setNewEmailError('Please enter a valid email address.');
        isValid = false;
      } else {
        setNewEmailError('');
      }
    }

    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    } else if (currentPassword.length < 6) {
      setCurrentPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setCurrentPasswordError('');
    }

    return isValid;
  }, [newEmail, currentPassword, setNewEmailError, setCurrentPasswordError]); // Add state values and setters it depends on


  // handleChangeEmail function to handle email change
  const handleChangeEmail = useCallback(async () => {
    setIsLoading(true); // Set loading state to true

    // Validate inputs before proceeding
    if (!validateInputs()) {
      setIsLoading(false); // Ensure loading is set to false if validation fails
      return;
    }

    if (!authenticatedUser) {
      showToast('User not authenticated. Please log in again.', 'error');
      setIsLoading(false); // Ensure loading is set to false
      return;
    }

    if (authenticatedUser.email === newEmail) {
      showToast('New email address is the same as the current one.', 'info');
      setIsLoading(false); // Ensure loading is set to false
      return;
    }

    try {
      // Get user's credential using the current password
      const credential = EmailAuthProvider.credential(
        authenticatedUser.email || '',
        currentPassword
      );

      // Re-authenticate the user with current password
      await reauthenticateWithCredential(authenticatedUser, credential);

      // Update the user's email address in Firebase Auth
      await updateEmail(authenticatedUser, newEmail);

      // Update the user's email in Zustand store
      updateUserEmailInStore({ email: newEmail });

      // send verification email to the new address
      await sendEmailVerification(authenticatedUser);

      showToast('Email changed successfully! A verification email has been sent.', 'success');

      // clear password field after successful change
      setNewEmail('');
    } catch (error: any) {
      // Default error message
      let errorMessage = 'Failed to change email. Please try again.';
      setCurrentPasswordError(''); // Clear previous password error first
      setNewEmailError(''); // Clear previous email error first

      // Handle specific error cases using switch-case
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = 'Incorrect current password. Please try again.';
          setCurrentPasswordError('Incorrect current password.');
          break;

        case 'auth/invalid-email':
          errorMessage = 'Invalid new email address format.';
          setNewEmailError('Invalid email address format.');
          break;

        case 'auth/email-already-in-use':
          // If email already in use, we can still show a success message for security reasons.
          // Send password reset to new email address
          try {
            await sendPasswordResetEmail(auth, newEmail);
          } catch (resetError) {
            // Do nothing, we already handled the error above
          }

          showToast('Email changed successfully! A verification email has been sent.', 'success');
          break;

        case 'auth/requires-recent-login':
          errorMessage = 'Your session has expired. Please log out and log back in to change your email.';
          // Potentially navigate the user to the login screen or show a re-auth prompt
          setCurrentPasswordError('Please re-authenticate to change your email.');
          break;

        default:
          // Generic error for other cases
          setCurrentPasswordError('An error occurred. Please try again.');
          break;
      }

      if (error.code !== 'auth/email-already-in-use') { // Avoid double toast if handled above
        showToast(errorMessage, 'error');
      }

    } finally {
      setIsLoading(false); // Set loading state to false
    }
  }, [
    authenticatedUser,
    newEmail,
    currentPassword,
    setIsLoading,
    showToast,
    setNewEmailError,
    setCurrentPasswordError,
    validateInputs,
    updateUserEmailInStore,
    // auth, EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification, sendPasswordResetEmail are stable imports
  ]); // Add all dependencies here


  // useLayoutEffect to set header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Change Email',
      headerRight: () => (
        <Button
          title={isLoading ? 'Saving' : 'Save'}
          onPress={handleChangeEmail}
          disabled={isLoading} // Disable button while loading
        />
      ),
    });
  }, [navigation, handleChangeEmail, isLoading]);


  return (
    <ThemedView style={styles.container}>
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={dismissToast}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppleSection title="New Email Address" >
            <FormInputField
              formItems={
                [
                  {
                    id: 'newEmail',
                    value: newEmail,
                    onChangeText: function (id: string, value: string): void {
                      setNewEmail(value);
                      if (newEmailError) setNewEmailError(''); // Clear error message on input change
                    },
                    placeholder: 'Enter your new email address',
                    keyboardType: 'email-address',
                    maxLength: 50,
                    multiline: false,
                    secureTextEntry: false,
                    showClearButton: true,
                    errorMessage: newEmailError,
                    autoCapitalize: 'none',
                    autoComplete: 'email',
                  }
                ]}
            />
          </AppleSection>
          <AppleSection title="Current Password" footer="Enter your current password to confirm the change.">
            <FormInputField
              formItems={
                [
                  {
                    id: 'currentPassword',
                    value: currentPassword,
                    onChangeText: function (id: string, value: string): void {
                      setCurrentPassword(value);
                      if (currentPasswordError) setCurrentPasswordError(''); // Clear error message on input change
                    },
                    placeholder: 'Enter your current password',
                    keyboardType: 'default',
                    maxLength: 50,
                    multiline: false,
                    secureTextEntry: true,
                    showClearButton: true,
                    errorMessage: currentPasswordError,
                    autoCapitalize: 'none',
                    autoComplete: 'password',
                  }
                ]}
            />
          </AppleSection>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

});