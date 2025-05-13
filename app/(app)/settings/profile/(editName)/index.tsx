import FormInputField from '@/components/Input';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import ToastNotification from '@/components/ToastNotification';
import { auth } from '@/firebaseConfig';
import i18n from '@/i18n';
import { updateUserProfileName } from '@/services/userDataService'; // Added import
import useUserStore from '@/zustand/userStore';
import { useNavigation } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function EditName() {
  const navigation = useNavigation();
  const authenticatedUser = auth.currentUser;

  // Select each value individually to avoid infinite re-renders
  const currentFirstName = useUserStore((state) => state.firstName);
  const currentLastName = useUserStore((state) => state.lastName);
  const setUserData = useUserStore((state) => state.setUserData);

  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);

  const [firstNameErrorMessage, setFirstNameErrorMessage] = useState('');
  const [lastNameErrorMessage, setLastNameErrorMessage] = useState('');

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
  };

  const validateInputs = useCallback((): boolean => {
    let isValid = true;
    if (!firstName?.trim()) {
      setFirstNameErrorMessage(i18n.t('error.first_name_required'));
      isValid = false;
    } else {
      setFirstNameErrorMessage('');
    }

    if (!lastName?.trim()) {
      setLastNameErrorMessage(i18n.t('error.last_name_required'));
      isValid = false;
    } else {
      setLastNameErrorMessage('');
    }
    return isValid;
  }, [firstName, lastName]);

  const handleChanges = useCallback(async () => {
    setIsLoading(true);

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    if (!authenticatedUser) {
      showToast(i18n.t('error.user_not_authenticated'), 'error');
      setIsLoading(false);
      return;
    }

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();

    if (trimmedFirstName === currentFirstName && trimmedLastName === currentLastName) {
      showToast(i18n.t('error.no_changes_detected'), 'info');
      setIsLoading(false);
      return;
    }

    try {
      await updateUserProfileName({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      showToast(i18n.t('success.name_updated'), 'success');
    } catch (error: any) {
      // The updateUserProfileName function already logs the error and throws a translated one.
      // You might want to display error.message if it's user-friendly,
      // or a generic message.
      showToast(error.message || i18n.t('error.failed_to_update_name'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    authenticatedUser,
    firstName,
    lastName,
    currentFirstName,
    currentLastName,
    validateInputs,
    showToast,
    // setUserData, // No longer directly used here
    // updateUserProfileName, // Add if ESLint complains, though it's stable
  ]);

  // useLayoutEffect to set header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: i18n.t('profile.edit_name_title'), // Changed title
      headerRight: () => (
        <Button
          title={isLoading ? i18n.t('common.saving') : i18n.t('common.save')}
          onPress={handleChanges}
          disabled={isLoading} // Disable button while loading
        />
      ),
    });
  }, [navigation, handleChanges, isLoading]);

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
          <AppleSection title={i18n.t('profile.edit_name')}>
            <FormInputField
              formItems={[
                {
                  id: 'firstName',
                  value: firstName || '',
                  onChangeText: function (id: string, value: string): void {
                    setFirstName(value);
                    if (firstNameErrorMessage) setFirstNameErrorMessage(''); // Clear error message on input change
                  },
                  placeholder: i18n.t('profile.first_name_placeholder'),
                  keyboardType: 'default',
                  maxLength: 50,
                  multiline: false,
                  secureTextEntry: false,
                  showClearButton: true,
                  errorMessage: firstNameErrorMessage,
                },
                {
                  id: 'lastName',
                  value: lastName || '',
                  onChangeText: function (id: string, value: string): void {
                    setLastName(value);
                    if (lastNameErrorMessage) setLastNameErrorMessage(''); // Clear error message on input change
                  },
                  placeholder: i18n.t('profile.last_name_placeholder'),
                  keyboardType: 'default',
                  maxLength: 50,
                  multiline: false,
                  secureTextEntry: false,
                  showClearButton: true,
                  errorMessage: lastNameErrorMessage,
                }]}
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