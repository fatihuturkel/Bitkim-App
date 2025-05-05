// External libraries
import { router } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import ListItem from "@/components/ListItem";
import AppleSection from "@/components/Section";
import { ThemedView } from "@/components/ThemedView";
import ToastNotification from "@/components/ToastNotification";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/i18n";
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
      showToast(i18n.t("error.user_data_refresh_error"), "error");
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
        <AppleSection title={i18n.t('security.title')}>
          <ListItem
            label={i18n.t('auth.email')}
            value={email}
            onPress={() => router.push('/(app)/settings/security/(changeEmail)')}
          />
          <ListItem
            label={i18n.t('auth.email_verification')}
            value={isEmailVerified ? i18n.t('auth.verified') : i18n.t('auth.not_verified')}
            valueStyle={{ color: isEmailVerified ? systemGreen : systemRed }}
            onPress={() => { if (!isEmailVerified) router.push('/(app)/settings/security/(emailVerification)'); }}
            accessoryType={isEmailVerified ? "none" : "chevron"}
          />
          <ListItem
            label={i18n.t('auth.change_password')}
            onPress={() => router.push('/(app)/settings/security/(changePassword)')}
          />
          <ListItem
            label={i18n.t('auth.reset_password')}
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

