import Button from '@/components/Button';
import FormInputField from '@/components/Input'; // Import AppleGroupedForm
import AppleSection from '@/components/Section';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context/AuthContext'; // Import useSession
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { useEffect, useState } from 'react'; // Import useEffect
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native'; // Import View, Alert, Text, ActivityIndicator

export default function Login() {
  // Define state variables for theme colors
  const systemBlue = useThemeColor({}, 'systemBlue');
  const secondaryLabelColor = useThemeColor({}, 'secondaryLabel'); // Define secondary label color
  const tintColor = useThemeColor({}, 'tint');

  // State for form inputs
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input

  // State for error messages
  const [emailErrorMessage, setEmailErrorMessage] = useState(''); // State for email error message
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(''); // State for password error message
  const [loginError, setLoginError] = useState(''); // State for general login errors

  // Get auth context values
  const { signIn, user, isLoading } = useSession(); // Use session context

  const router = useRouter(); // Initialize router

  // Effect to handle navigation after successful login
  useEffect(() => {
    if (user) {
      // Navigate to a different screen, e.g., the home tab
      router.replace('/(app)'); // Adjust the path as needed
    }
  }, [user, router]); // Depend on user from context

  // Validation function for email input
  const validateEmail = (email: string) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation function for password input
  const validatePassword = (password: string) => {
    // Check if password is at least 6 characters long
    return password.length >= 6;
  };

  // Validation function for form inputs
  const validateForm = () => {
    let isValid = true;
    setLoginError(''); // Clear previous login errors on new attempt
    // check if email is valid
    if (!validateEmail(email)) {
      setEmailErrorMessage(i18n.t('error.invalid_email'));
      isValid = false;
    } else {
      setEmailErrorMessage(''); // Clear error if valid
    }

    // check if password is valid
    if (!validatePassword(password)) {
      setPasswordErrorMessage(i18n.t('error.password_length'));
      isValid = false;
    } else {
      setPasswordErrorMessage(''); // Clear error if valid
    }

    return isValid;
  };

  // Handler for login button press
  const handleLoginPress = async () => { // Make the handler async
    // Validate form inputs
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Clear previous errors before attempting login
    setLoginError('');

    try {
      // Perform login action using the context's signIn function
      await signIn(email, password);
      console.log("Login attempt successful:", { email }); // Note: user state update is async via onAuthStateChanged
      // Navigation is handled by the useEffect hook watching user
    } catch (err: any) {
      console.error("Login failed in component:", err);
      let displayMessageKey = 'auth.loginFailed'; // Default error key

      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            displayMessageKey = 'error.invalid_email';
            break;
          case 'auth/wrong-password': // Specific to some SDK versions
          case 'auth/invalid-credential': // Common for wrong password or user not found in newer Firebase SDKs
          case 'auth/user-not-found': // Add this case
            displayMessageKey = 'error.invalid_credentials';
            break;
          case 'auth/user-disabled':
            displayMessageKey = 'error.user_disabled';
            break;
          // Add more specific error codes from your auth provider as needed
          default:
            console.warn(`Unhandled auth error code: ${err.code}. Falling back to default login error message.`);
            // displayMessageKey remains 'auth.loginFailed'
            break;
        }
      } else if (err.message) {
        // If no code, but there's a message, log it and use the default translated error.
        // Avoid displaying raw err.message directly if it's not meant for users or not translated.
        console.warn(`Login error without specific code (message: ${err.message}). Falling back to default login error message.`);
        // displayMessageKey remains 'auth.loginFailed'
      }
      setLoginError(i18n.t(displayMessageKey));
    }
  };

  // Optional: Define handlers if you add buttons to the NavigationBar
  const handleLeftNavPress = () => {
    // Navigate back or perform other action
    if (router.canGoBack()) {
      router.back();
    } else {
      // Handle case where there's no screen to go back to, maybe navigate home
      router.replace('/(app)');
    }
  };

  return (
    // Use ThemedView as the outer container
    <ThemedView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <AppleSection>
            <FormInputField
              formItems={
                [
                  {
                    id: 'email',
                    value: email,
                    onChangeText: function (id: string, value: string): void {
                      setEmail(value);
                      if (emailErrorMessage) setEmailErrorMessage(''); // Clear error message on input change
                      if (loginError) setLoginError(''); // Clear general login error
                    },
                    placeholder: i18n.t('auth.email_placeholder'),
                    keyboardType: 'email-address',
                    maxLength: 50,
                    multiline: false,
                    secureTextEntry: false,
                    showClearButton: true,
                    errorMessage: emailErrorMessage,
                  },
                  {
                    id: 'password',
                    value: password,
                    onChangeText: function (id: string, value: string): void {
                      setPassword(value);
                      if (passwordErrorMessage) setPasswordErrorMessage(''); // Clear error message on input change
                      if (loginError) setLoginError(''); // Clear general login error
                    },
                    placeholder: i18n.t('auth.password_placeholder'),
                    keyboardType: 'default',
                    maxLength: 50,
                    multiline: false,
                    secureTextEntry: true,
                    showClearButton: true,
                    errorMessage: passwordErrorMessage,
                  }
                ]}
            />
          </AppleSection>

          {/* Display general login error */}
          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}

          <AppleSection>
            <Button
              title={isLoading ? i18n.t('common.loading') : i18n.t('auth.login')}
              onPress={handleLoginPress}
              disabled={isLoading} // Disable button while loading (use context isLoading)
            />
            {/* Show loading indicator */}
            {isLoading && <ActivityIndicator size="small" color={systemBlue} style={styles.loadingIndicator} />}
          </AppleSection>

          <Text style={[styles.registerText, { color: secondaryLabelColor }]}>
            {i18n.t('home.signup_prompt')}{' '}
            <Text style={[styles.registerLink, { color: tintColor }]} onPress={() => router.push('/sign-up')}>
              {i18n.t('auth.signUp')}
            </Text>
          </Text>


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
  errorText: { // Style for general login error message
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5, // Add some space before the button section
  },
  loadingIndicator: {
    marginTop: 10, // Add some space above the indicator if needed
  },
  registerText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center', // Center the text
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '500',
    // Removed textAlign and marginTop as they are handled by the container
  },
});
