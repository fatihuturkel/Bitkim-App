/**
 * `ChangePassword` is a screen component that allows authenticated users to change their account password.
 *
 * It provides input fields for the current password, new password, and confirmation of the new password.
 * The component performs validation on the inputs, ensuring all fields are filled, the new password meets
 * the minimum length requirement, and the new password and confirmation match.
 *
 * Before updating the password, it re-authenticates the user using their current password via Firebase Authentication
 * to ensure security. Upon successful re-authentication and validation, it updates the user's password in Firebase.
 *
 * Feedback is provided to the user through toast notifications for success or error messages (e.g., incorrect current password,
 * weak new password, requirement for recent login, or unexpected errors).
 *
 * A loading indicator is displayed during the password change process, and the header's "Change" button is dynamically
 * updated to show "Changing" and becomes disabled while loading.
 *
 * After a successful password change, the user is automatically navigated back to the previous screen after a short delay.
 *
 * @component
 * @returns {React.ReactElement} The rendered ChangePassword screen.
 *
 * @example
 * // Usage within Expo Router navigation stack
 * <Stack.Screen name="settings/security/changePassword" />
 */

// External libraries
import { ScrollView, StyleSheet } from "react-native";
import { router, useNavigation } from "expo-router"; // Import useNavigation
import { KeyboardAvoidingView } from "react-native";
import { Platform, Button } from "react-native";
import { useState, useLayoutEffect } from "react"; // Import useEffect or useLayoutEffect

// Internal components
import AppleSection from "@/components/Section";
import FormInputField from "@/components/Input";
import { ThemedView } from "@/components/ThemedView";
import { auth } from "@/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import ToastNotification from "@/components/ToastNotification"; // Import your Toast component
const MIN_PASSWORD_LENGTH = 6; // Define constant for minimum password length

export default function ChangePassword() {
  // For header options
  const navigation = useNavigation();

  // For validation and re-authentication, we can use the current user's email from Firebase Auth
  const currentUser = auth.currentUser;

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // State for form inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State form error messages
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Toast notification states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Dismiss toast message
  const dismissToast = () => {
    setToastVisible(false);
  };

  // Validate password fields
  const validateInputs = (): boolean => {
    let isValid = true;

    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    } else {
      setCurrentPasswordError('');
    }

    // Validate new password
    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setNewPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    // Validate confirm password
    if (!confirmNewPassword) {
      setConfirmPasswordError('Confirm password is required');
      isValid = false;
    } else if (confirmNewPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true); // Set loading state to true

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    if (!currentUser || !currentUser.email) {
      showToast('User not found', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Re-authenticate the user with the current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      // Re-authenticate the user
      await reauthenticateWithCredential(currentUser, credential);

      // Update the password
      await updatePassword(currentUser, newPassword);

      showToast('Password changed successfully', 'success');

      // Navigate to the previous screen after a delay
      setTimeout(() => {
        router.back();
      }, 3000);

    } catch (error: any) {
      // Handle errors
      switch (error.code) {
        case 'auth/wrong-password':
          setCurrentPasswordError('The current password is incorrect');
          break;

        case 'auth/weak-password':
          setNewPasswordError('The new password is too weak');
          break;

        case 'auth/requires-recent-login':
          showToast('Please log in again to change your password', 'error');
          break;

        default:
          showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Set header options dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleSubmit}
          title={isLoading ? "Changing" : "Change"}
          disabled={isLoading}
        />
      ),
    });
  }, [navigation, handleSubmit, isLoading]);

  return (
    <ThemedView style={styles.container}>

      <ToastNotification
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
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
          <AppleSection title="Current Password">
            <FormInputField
              formItems={[
                {
                  id: 'currentPassword',
                  value: currentPassword,
                  onChangeText: (id, value) => {
                    setCurrentPassword(value);
                    if (currentPasswordError) setCurrentPasswordError('');
                  },
                  placeholder: 'Enter current password',
                  showClearButton: true,
                  secureTextEntry: true,
                  errorMessage: currentPasswordError,
                  autoCapitalize: "none"
                },
              ]}
            />
          </AppleSection>

          <AppleSection title={`New Password`} footer={`Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`}>
            <FormInputField
              formItems={[
                {
                  id: 'newPassword',
                  value: newPassword,
                  onChangeText: (id, value) => {
                    setNewPassword(value);
                    if (newPasswordError) setNewPasswordError('');
                  },
                  placeholder: 'Enter new password',
                  showClearButton: true,
                  secureTextEntry: true,
                  errorMessage: newPasswordError,
                  autoCapitalize: "none"
                },
                {
                  id: 'confirmNewPassword',
                  value: confirmNewPassword,
                  onChangeText: (id, value) => {
                    setConfirmNewPassword(value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  },
                  placeholder: 'Confirm new password',
                  showClearButton: true,
                  secureTextEntry: true,
                  errorMessage: confirmPasswordError,
                  autoCapitalize: "none"
                },
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
