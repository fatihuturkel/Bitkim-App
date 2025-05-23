import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import FormInputField from '@/components/Input';
import AppleSection from '@/components/Section';
import Button from '@/components/Button';
import { useSession } from '@/context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { signUp, user, isLoading } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) router.replace('/(app)');
  }, [user]);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalı.');
      return;
    }

    try {
      await signUp(email, password, firstName, lastName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Kayıt başarısız oldu.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AppleSection>
            <FormInputField
              formItems={[
                {
                  id: 'firstName',
                  value: firstName,
                  placeholder: 'Ad',
                  onChangeText: (_, val) => setFirstName(val),
                },
                {
                  id: 'lastName',
                  value: lastName,
                  placeholder: 'Soyad',
                  onChangeText: (_, val) => setLastName(val),
                },
                {
                  id: 'email',
                  value: email,
                  placeholder: 'E-posta',
                  onChangeText: (_, val) => setEmail(val),
                  keyboardType: 'email-address',
                },
                {
                  id: 'password',
                  value: password,
                  placeholder: 'Şifre',
                  onChangeText: (_, val) => setPassword(val),
                  secureTextEntry: true,
                },
              ]}
            />
          </AppleSection>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <AppleSection>
            <Button title="Kayıt Ol" onPress={handleSignUp} disabled={isLoading} />
            {isLoading && <ActivityIndicator size="small" color="#007aff" style={{ marginTop: 10 }} />}
          </AppleSection>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: 16 },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});
