import { StyleSheet, Platform, View, Alert, Text, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native'; // Import View, Alert, Text, ActivityIndicator
import Button from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AppleSection from '@/components/Section';
import FormInputField from '@/components/Input'; // Import AppleGroupedForm
import { useState, useEffect } from 'react'; // Import useEffect
import { useSession } from '@/context/AuthContext'; // Import useSession
import { useRouter } from 'expo-router'; // Import useRouter for navigation


export default function Login() {
  // Define state variables for theme colors
  const systemBlue = useThemeColor({}, 'systemBlue');

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
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailErrorMessage(''); // Clear error if valid
    }

    // check if password is valid
    if (!validatePassword(password)) {
      setPasswordErrorMessage('Password must be at least 6 characters long.');
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
      // Set local error state based on the error from signIn
      // You might want to parse the error message for a user-friendly display
      setLoginError(err.message || 'Login failed. Please check your credentials.');
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
                  value : email,
                  onChangeText: function (id: string, value: string): void {
                    setEmail(value);
                    if (emailErrorMessage) setEmailErrorMessage(''); // Clear error message on input change
                    if (loginError) setLoginError(''); // Clear general login error
                  },
                  placeholder: 'Enter your email',
                  keyboardType: 'email-address',
                  maxLength: 50,
                  multiline: false,
                  secureTextEntry: false,
                  showClearButton: true,
                  errorMessage: emailErrorMessage,
                },
                {
                  id: 'password',
                  value : password,
                  onChangeText: function (id: string, value: string): void {
                    setPassword(value);
                    if (passwordErrorMessage) setPasswordErrorMessage(''); // Clear error message on input change
                    if (loginError) setLoginError(''); // Clear general login error
                  },
                  placeholder: 'Enter your password',
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
              title="Login"
              onPress={handleLoginPress}
              disabled={isLoading} // Disable button while loading (use context isLoading)
            />
            {/* Show loading indicator */}
            {isLoading && <ActivityIndicator size="small" color={systemBlue} style={styles.loadingIndicator} />}
          </AppleSection>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  leftButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    marginRight: 4, // Keep consistent spacing
  },
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
  }
});
