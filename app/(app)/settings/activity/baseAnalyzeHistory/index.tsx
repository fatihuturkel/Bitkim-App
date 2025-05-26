import ResultList, { ResultItem } from '@/components/ResultList';
import { ThemedView } from '@/components/ThemedView';
import { auth, db } from '@/firebaseConfig';
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { UriPrediction } from '@/zustand/imagePredictionData';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

export default function BaseAnalyzeHistoryScreen() {
  const [historyItems, setHistoryItems] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themedBackgroundColor = useThemeColor({}, 'systemBackground');
  const textColor = useThemeColor({}, 'label');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryLabel');

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError(i18n.t('error.not_authenticated', {defaultValue: "User not authenticated."}));
      setIsLoading(false);
      setHistoryItems([]);
      return;
    }

    try {
      const userHistoryRef = doc(db, 'user_legacy_scan_history', currentUser.uid);
      const docSnap = await getDoc(userHistoryRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        const items: ResultItem[] = Object.keys(firestoreData)
          .map(key => {
            const record = firestoreData[key] as UriPrediction;
            const topPrediction = record.prediction?.analysis_results?.top_prediction;
            const itemDetails: string[] = [];

            if (topPrediction) {
              itemDetails.push(
                `${i18n.t('analyze.top_prediction', { name: topPrediction.english_name || 'N/A' })}: ${(topPrediction.confidence * 100).toFixed(1)}%`
              );              if (topPrediction.latin_name) {
                itemDetails.push(
                  i18n.t('analyze.latin', { name: topPrediction.latin_name })
                );
              }
            } else {
              itemDetails.push(i18n.t('analyze.no_prediction_data', {defaultValue: "No prediction data available."}));
            }
            
            let title = key; // Default title to the Firestore document key
            let imageUrl = null; // Initialize imageUrl variable
            
            // Use top prediction as title if available
            if (topPrediction && topPrediction.english_name) {
              title = topPrediction.english_name;
            } else {
              // Fall back to filename if no prediction is available
              // Use permanent image path if available, otherwise fallback to uri
              if (record.permanentImagePath) {
                imageUrl = record.permanentImagePath;
                const permanentPathString = String(record.permanentImagePath);
                try {
                  // Get filename from permanent path
                  const decodedPath = decodeURIComponent(permanentPathString);
                  const lastSlashIndex = decodedPath.lastIndexOf('/');
                  if (lastSlashIndex !== -1 && lastSlashIndex < decodedPath.length - 1) {
                    title = decodedPath.substring(lastSlashIndex + 1);
                  } else if (decodedPath) {
                    title = decodedPath;
                  }
                } catch (e) {
                  // Fallback for permanent path handling errors
                  const lastSlashIdx = permanentPathString.lastIndexOf('/');
                  if (lastSlashIdx !== -1 && lastSlashIdx < permanentPathString.length - 1) {
                    title = decodeURIComponent(permanentPathString.substring(lastSlashIdx + 1));
                  } else if (permanentPathString) {
                    title = decodeURIComponent(permanentPathString);
                  }
                }
              } else if (record.uri) {
                // Fallback to original URI if no permanent path is available
                imageUrl = record.uri;
                const uriString = String(record.uri);
                try {
                  // Attempt to decode and extract the last segment of the URI path
                  const decodedUriPath = decodeURIComponent(uriString.includes('://') ? new URL(uriString).pathname : uriString);
                  const lastSlashIndex = decodedUriPath.lastIndexOf('/');
                  if (lastSlashIndex !== -1 && lastSlashIndex < decodedUriPath.length - 1) {
                    title = decodedUriPath.substring(lastSlashIndex + 1);
                  } else if (decodedUriPath) { // If no slash, or it's the last char, but path is not empty
                    title = decodedUriPath;
                  }
                } catch (e) {
                  // Fallback for invalid URIs or if URL parsing fails: use the part after the last slash
                  const lastSlashIdx = uriString.lastIndexOf('/');
                  if (lastSlashIdx !== -1 && lastSlashIdx < uriString.length - 1) {
                    title = decodeURIComponent(uriString.substring(lastSlashIdx + 1));
                  } else if (uriString) {
                     title = decodeURIComponent(uriString);
                  }                  // If all else fails, title remains 'key'
                }
              }
            }
            
            // Set image URL regardless of title source
            if (record.permanentImagePath) {
              imageUrl = record.permanentImagePath;
            } else if (record.uri) {
              imageUrl = record.uri;
            }
            
            return {
              id: key,
              title: title, // Use the derived title (from URI or key)
              timestamp: record.scanDate,
              details: itemDetails,
              icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
              isItemCollapsible: true,
              initiallyItemCollapsed: true,
              imageUrl: imageUrl, // Add the image URL
            };
          })
          .sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());
        setHistoryItems(items);
      } else {
        setHistoryItems([]); // No history document found
      }
    } catch (e) {
      console.error("Failed to fetch base analysis history:", e);
      setError(i18n.t('error.fetch_data_error', {defaultValue: "Failed to fetch history."}));
      setHistoryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={textColor} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <SafeAreaView style={styles.flex}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ResultList
            results={historyItems}
            title={i18n.t('activity.base_analyze_history')}
            headerIcon={'archive-outline' as keyof typeof Ionicons.glyphMap}
            emptyText={i18n.t('activity.no_base_analyze_history_found')}
            isCollapsible={false} // The list itself is not collapsible
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8, // Changed from padding: 16
    paddingHorizontal: 16, // Added for specific horizontal padding
  },
});