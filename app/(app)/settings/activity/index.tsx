import ListItem from "@/components/ListItem";
import AppleSection from "@/components/Section";
import { ThemedView } from "@/components/ThemedView";
import i18n from "@/i18n";
import { router } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

export default function ActivitySettings() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppleSection title={i18n.t('activity.history_section_title')}>
          <ListItem
            label={i18n.t('activity.base_analyze_history')}
            onPress={() => router.push('/(app)/settings/activity/baseAnalyzeHistory')} // TODO: Add navigation path
          />
          <ListItem
            label={i18n.t('activity.ai_history')}
            // onPress={() => router.push('/(app)/settings/activity/ai')} // TODO: Add navigation path
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