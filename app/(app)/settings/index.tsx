import ListItem from "@/components/ListItem";
import UserProfileListItem from "@/components/ListProfilePicItem";
import AppleSection from "@/components/Section";
import { ThemedView } from "@/components/ThemedView";
import ToastNotification from "@/components/ToastNotification";
import i18n from "@/i18n";
import { retrieveCurrentUserData } from "@/services/userDataService";
import useUserStore from "@/zustand/userStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";


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
        await retrieveCurrentUserData();
      } catch (error) {
        showToast(i18n.t("error.user_data_refresh_error"), "error");
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
            onPress={() => router.push('/(app)/settings/profile')}
            subheading={email || "User Email"}
            isLast={true}
          />
        </AppleSection>

        <AppleSection title={i18n.t("navigation.settings")}>
          <ListItem
            label={i18n.t("navigation.activity")}
            onPress={() => router.push('/(app)/settings/activity')}
            icon={<Ionicons name="analytics-outline" />}
          />
          <ListItem
            label={i18n.t("navigation.preferences")}
            onPress={() => router.push('/(app)/settings/preferences')}
            icon={<Ionicons name="options-outline" />}
          />
          <ListItem
            label={i18n.t("navigation.security")}
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