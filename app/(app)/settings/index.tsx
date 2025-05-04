// External libraries
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";


// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import ToastNotification from "@/components/ToastNotification";
import AppleSection from "@/components/Section";
import ListItem from "@/components/ListItem";
import UserProfileListItem from "@/components/ListProfilePicItem";
import { ThemedView } from "@/components/ThemedView";
import { fetchAuthenticatedUserData } from "@/services/userDataService";


export default function Settings() {
  // Select each value individually to avoid infinite re-renders
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const email = useUserStore((state) => state.email);

  // Combine first and last name for the header
  const userName = `${firstName} ${lastName}`.trim();

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
        <AppleSection>
          <UserProfileListItem
            headline={userName || "User Name"}
            onPress={() => console.log("User Profile pressed")}
            subheading={email || "User Email"}
            isLast={true}
          />
        </AppleSection>

        <AppleSection title="Settings">
          <ListItem
            label="Activity"
            onPress={() => console.log("Activity pressed")}
            icon={<Ionicons name="analytics-outline" />}
          />
          <ListItem
            label="Preferences"
            onPress={() => console.log("Preferences pressed")}
            icon={<Ionicons name="options-outline" />}
          />
          <ListItem
            label="Security"
            onPress={() => router.push('/(app)/settings/security')}
            isLast={true}
            icon={<Ionicons name="shield-outline" />}
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