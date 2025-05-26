import Button from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context/AuthContext'; // Import useSession
import i18n from '@/i18n'; // Added import

export default function SignOutScreen() {
  const { signOut } = useSession();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={i18n.t('auth.sign_out')} // Changed to use i18n
        onPress={signOut}
        role="destructive"
        buttonStyle='filled'
      />
    </ThemedView>
  );
}