import Button from '@/components/Button';
import FormInputField from '@/components/Input';
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import i18n from '@/i18n'; // Import i18n
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const { signUp, user, isLoading } = useSession();
  const systemBlue = useThemeColor({}, 'systemBlue'); // Define systemBlue

  // State for form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added state for confirm password

  // State for error messages
  const [firstNameErrorMessage, setFirstNameErrorMessage] = useState('');
  const [lastNameErrorMessage, setLastNameErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState(''); // Added state for confirm password error
  const [signUpError, setSignUpError] = useState(''); // General sign-up error

  useEffect(() => {
    if (user) router.replace('/(app)');
  }, [user, router]); // Add router to dependency array

  // Validation functions
  const validateName = (name: string) => name.trim().length > 0;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => password.length >= 6;

  const validateForm = () => {
    let isValid = true;
    setSignUpError(''); // Clear previous general errors

    if (!validateName(firstName)) {
      setFirstNameErrorMessage(i18n.t('error.first_name_required'));
      isValid = false;
    } else {
      setFirstNameErrorMessage('');
    }

    if (!validateName(lastName)) {
      setLastNameErrorMessage(i18n.t('error.last_name_required'));
      isValid = false;
    } else {
      setLastNameErrorMessage('');
    }

    if (!validateEmail(email)) {
      setEmailErrorMessage(i18n.t('error.invalid_email'));
      isValid = false;
    } else {
      setEmailErrorMessage('');
    }

    if (!validatePassword(password)) {
      setPasswordErrorMessage(i18n.t('error.password_length', { length: 6 }));
      isValid = false;
    } else {
      setPasswordErrorMessage('');
    }

    if (password !== confirmPassword) { // Added confirm password validation
      setConfirmPasswordErrorMessage(i18n.t('error.password_mismatch'));
      isValid = false;
    } else {
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    setSignUpError(''); // Clear previous errors

    try {
      await signUp(email, password, firstName, lastName);
      // Navigation is handled by useEffect
    } catch (err: any) {
      console.error("Sign up failed in component:", err);
      setSignUpError(err.message || i18n.t('auth.signUpFailed'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppleSection>
            <FormInputField
              formItems={[
                {
                  id: 'firstName',
                  value: firstName,
                  placeholder: i18n.t('auth.firstName_placeholder'),
                  onChangeText: (_, val) => {
                    setFirstName(val);
                    if (firstNameErrorMessage) setFirstNameErrorMessage('');
                    if (signUpError) setSignUpError('');
                  },
                  errorMessage: firstNameErrorMessage,
                  showClearButton: true,
                },
                {
                  id: 'lastName',
                  value: lastName,
                  placeholder: i18n.t('auth.lastName_placeholder'),
                  onChangeText: (_, val) => {
                    setLastName(val);
                    if (lastNameErrorMessage) setLastNameErrorMessage('');
                    if (signUpError) setSignUpError('');
                  },
                  errorMessage: lastNameErrorMessage,
                  showClearButton: true,
                },
              ]}
            />
          </AppleSection>
          <AppleSection>
            <FormInputField
              formItems={[
                {
                  id: 'email',
                  value: email,
                  placeholder: i18n.t('auth.email_placeholder'),
                  onChangeText: (_, val) => {
                    setEmail(val);
                    if (emailErrorMessage) setEmailErrorMessage('');
                    if (signUpError) setSignUpError('');
                  },
                  keyboardType: 'email-address',
                  errorMessage: emailErrorMessage,
                  showClearButton: true,
                },
                {
                  id: 'password',
                  value: password,
                  placeholder: i18n.t('auth.password_placeholder'),
                  onChangeText: (_, val) => {
                    setPassword(val);
                    if (passwordErrorMessage) setPasswordErrorMessage('');
                    if (confirmPasswordErrorMessage) setConfirmPasswordErrorMessage(''); // Clear confirm password error
                    if (signUpError) setSignUpError('');
                  },
                  secureTextEntry: true,
                  errorMessage: passwordErrorMessage,
                  showClearButton: true,
                },
                { // Added confirm password field
                  id: 'confirmPassword',
                  value: confirmPassword,
                  placeholder: i18n.t('auth.confirm_password_placeholder'), // Add this translation key to your i18n files
                  onChangeText: (_, val) => {
                    setConfirmPassword(val);
                    if (confirmPasswordErrorMessage) setConfirmPasswordErrorMessage('');
                    if (signUpError) setSignUpError('');
                  },
                  secureTextEntry: true,
                  errorMessage: confirmPasswordErrorMessage,
                  showClearButton: true,
                },
              ]}
            />
          </AppleSection>

          {signUpError ? <Text style={styles.errorText}>{signUpError}</Text> : null}

          <AppleSection>
            <Button
              title={isLoading ? i18n.t('common.loading') : i18n.t('auth.signUp')}
              onPress={handleSignUp}
              disabled={isLoading}
            />
            {isLoading && <ActivityIndicator size="small" color={systemBlue} style={styles.loadingIndicator} />}
          </AppleSection>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollView: { // Added from sign-in
    flex: 1,
  },
  scrollContent: { padding: 16 },
  errorText: { // Matched with sign-in
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  loadingIndicator: { // Matched with sign-in
    marginTop: 10,
  },
});
