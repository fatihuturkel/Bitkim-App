// External libraries
import { useNavigation } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import FormInputField from "@/components/Input";
import AppleSection from "@/components/Section";
import { ThemedView } from "@/components/ThemedView";
import ToastNotification from "@/components/ToastNotification";
import { auth } from "@/firebaseConfig";
import i18n from "@/i18n";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  // For header options
  const navigation = useNavigation();

  // For auto-filling the email field, we can use the current user's email from Zustand store
  const activeUserEmail = useUserStore((state) => state.email); // Get the current user's email from Zustand

  // State for form inputs
  const [email, setEmail] = useState(activeUserEmail || ''); // Initialize with current user's email if available

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // State form error messages
  const [emailError, setEmailError] = useState('');

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

  // Validate email input
  const validateInput = (): boolean => {
    let isValid = true;
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(i18n.t('error.email_required'));
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError(i18n.t('error.invalid_email'));
      isValid = false;
    } else {
      setEmailError('');
    }
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    setEmailError(''); // Clear previous errors

    try {
      await sendPasswordResetEmail(auth, email);
      showToast(i18n.t('success.password_reset_email_sent'), 'success');

    } catch (error: any) {
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          // Even if the user is not found, we can still show a success message for security reasons
          // Wait for 1 seconds to mimic sending time for security
          await new Promise(resolve => setTimeout(resolve, 1000));
          showToast(i18n.t('success.password_reset_email_sent'), 'success');
          break;
        case 'auth/invalid-email':
          setEmailError(i18n.t('error.invalid_email'));
          showToast(i18n.t('error.invalid_email'), 'error');
          break;
        default:
          setEmailError(i18n.t('error.generic_error'));
          showToast(i18n.t('error.generic_error'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set header options dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleSubmit}
          title={isLoading ? i18n.t('common.sending') : i18n.t('common.send')}
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
          <AppleSection title={i18n.t('reset_password.title')} footer={i18n.t('reset_password.description')}>
            <FormInputField
              formItems={[
                {
                  id: 'email',
                  value: email,
                  onChangeText: (id, value) => {
                    setEmail(value);
                    if (emailError) setEmailError(''); // Clear error on change
                  },
                  placeholder: i18n.t('auth.email_placeholder'),
                  showClearButton: true,
                  secureTextEntry: false,
                  errorMessage: emailError,
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  autoComplete: 'email',
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