import FormInputField from '@/components/Input';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import ToastNotification from '@/components/ToastNotification';
import { auth } from '@/firebaseConfig';
import i18n from '@/i18n';
import { updateUserPhoneNumber } from '@/services/userDataService';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/formatters'; // Adjust path if your utils folder is elsewhere
import useUserStore from '@/zustand/userStore';
import { useNavigation } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function EditPhoneNumber() {
  const navigation = useNavigation();
  const authenticatedUser = auth.currentUser;

  const currentPhoneNumber = useUserStore((state) => state.phoneNumber);
  // setUserData is not directly used here for updating phone, updateUserPhoneNumber handles store update
  // const setUserData = useUserStore((state) => state.setUserData); 

  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(currentPhoneNumber || '')); // Use imported formatPhoneNumber
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const dismissToast = () => {
    setToastVisible(false);
  };

  const validateInputs = useCallback((): boolean => {
    let isValid = true;
    const rawPhoneNumber = unformatPhoneNumber(phoneNumber); // Use imported unformatPhoneNumber
    const phoneRegex = /^\d{10}$/; // Regex to check for exactly 10 digits

    if (!rawPhoneNumber) {
      setPhoneNumberErrorMessage(i18n.t('error.phone_number_required', { defaultValue: 'Phone number is required.' }));
      isValid = false;
    } else if (!phoneRegex.test(rawPhoneNumber)) {
      setPhoneNumberErrorMessage(i18n.t('error.phone_number_invalid_length', { defaultValue: 'Phone number must be 10 digits.' }));
      isValid = false;
    } else {
      setPhoneNumberErrorMessage('');
    }
    return isValid;
  }, [phoneNumber]);

  const handleChanges = useCallback(async () => {
    setIsLoading(true);

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    if (!authenticatedUser) {
      showToast(i18n.t('error.user_not_authenticated', { defaultValue: 'User not authenticated.' }), 'error');
      setIsLoading(false);
      return;
    }

    const rawNewPhoneNumber = unformatPhoneNumber(phoneNumber); // Use imported unformatPhoneNumber
    const rawCurrentPhoneNumber = unformatPhoneNumber(currentPhoneNumber); // Use imported unformatPhoneNumber

    if (rawNewPhoneNumber === rawCurrentPhoneNumber) {
      showToast(i18n.t('error.no_changes_detected', { defaultValue: 'No changes detected.' }), 'info');
      setIsLoading(false);
      return;
    }

    try {
      if (rawNewPhoneNumber) { // Ensure rawPhoneNumber is not empty
        await updateUserPhoneNumber(rawNewPhoneNumber); // Send raw number to service
        showToast(i18n.t('success.phone_number_updated', { defaultValue: 'Phone number updated successfully.' }), 'success');
      } else {
        // This case should ideally be caught by validateInputs
        showToast(i18n.t('error.phone_number_invalid', { defaultValue: 'Invalid phone number.' }), 'error');
      }
    } catch (error: any) {
      showToast(error.message || i18n.t('error.failed_to_update_phone_number', { defaultValue: 'Failed to update phone number.' }), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    authenticatedUser,
    phoneNumber, // State is formatted
    currentPhoneNumber, // Store value is raw
    validateInputs,
    showToast,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: i18n.t('profile.edit_phone_number_title', { defaultValue: 'Edit Phone Number' }),
      headerRight: () => (
        <Button
          title={isLoading ? i18n.t('common.saving', { defaultValue: 'Saving...' }) : i18n.t('common.save', { defaultValue: 'Save' })}
          onPress={handleChanges}
          disabled={isLoading}
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
          <AppleSection title={i18n.t('profile.edit_phone_number_section_title', { defaultValue: 'Phone Number' })}>
            <FormInputField
              formItems={[
                {
                  id: 'phoneNumber',
                  value: phoneNumber || '', // Display formatted number
                  onChangeText: (id: string, value: string) => {
                    const formatted = formatPhoneNumber(value); // Use imported formatPhoneNumber
                    setPhoneNumber(formatted);
                    if (phoneNumberErrorMessage) setPhoneNumberErrorMessage('');
                  },
                  placeholder: i18n.t('profile.phone_number_placeholder', { defaultValue: 'Enter your phone number (xxx) xxx xx xx' }),
                  keyboardType: 'phone-pad',
                  maxLength: 16, // Length of "(xxx) xxx xx xx" is 16. Adjust if needed
                  multiline: false,
                  secureTextEntry: false,
                  showClearButton: true,
                  errorMessage: phoneNumberErrorMessage,
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