import Button from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context/AuthContext'; // Import useSession

export default function SignOutScreen() {
  const { signOut } = useSession();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sign Out" onPress={signOut} />
    </ThemedView>
  );
}