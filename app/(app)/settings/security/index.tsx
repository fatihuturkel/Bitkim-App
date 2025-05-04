// External libraries
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import ToastNotification from "@/components/ToastNotification";
import AppleSection from "@/components/Section";
import ListItem from "@/components/ListItem";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchAuthenticatedUserData } from "@/services/userDataService";

export default function Settings() {
  const systemGreen = useThemeColor({}, 'systemGreen'); // For success messages
  const systemRed = useThemeColor({}, 'systemRed'); // For error messages

  const email = useUserStore((state) => state.email);
  const isEmailVerified = useUserStore((state) => state.isEmailVerified);

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchAuthenticatedUserData();
    } catch (error) {
      showToast("Failed to refresh user data", "error");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ToastNotification
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={dismissToast}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <AppleSection title="Security Information">
          <ListItem
            label="Email"
            value={email}
            onPress={() => router.push('/(app)/settings/security/(changeEmail)')}
          />
          <ListItem
            label="E-Mail Verification"
            value={isEmailVerified ? "Verified" : "Not Verified"}
            valueStyle={{ color: isEmailVerified ? systemGreen : systemRed }}
            onPress={() => { if (!isEmailVerified) router.push('/(app)/settings/security/(emailVerification)'); }}
            accessoryType={isEmailVerified ? "none" : "chevron"}
          />
          <ListItem
            label="Change Password"
            onPress={() => router.push('/(app)/settings/security/(changePassword)')}
          />
          <ListItem
            label="Reset Password"
            onPress={() => router.push('/(app)/settings/security/(resetPassword)')}
          />
          <ListItem
            label="Sign Out"
            onPress={() => router.push('/(app)/settings/security/(signOut)')}
            isLast={true}
          />
        </AppleSection>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});

