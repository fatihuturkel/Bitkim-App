import Button from '@/components/Button'; // Import Button
import ResultList, { ResultItem } from '@/components/ResultList';
import AppleSection from '@/components/Section'; // Added import
import { ThemedView } from '@/components/ThemedView';
import ToastNotification from '@/components/ToastNotification'; // Import ToastNotification
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n';
import { deleteBaseAnalyzeHistoryRecord, fetchBaseAnalyzeHistory } from '@/services/userDataService'; // Import delete function
import useUserStore from '@/zustand/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Import useNavigation
import React, { useCallback, useLayoutEffect, useState } from 'react'; // Add useLayoutEffect
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// Define a component for displaying expanded details of an analysis
const ExpandedAnalysisView = React.memo(({ item, onClose }: {
  item: ResultItem;
  onClose: () => void;
}) => {
  const textColor = useThemeColor({}, 'label');
  const analysisResults = item.expandedDetails?.analysisResults || [];
  const imageSource = item.expandedDetails?.imageSource;

  return (
    <ThemedView style={styles.expandedView}>
      <View style={styles.expandedHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.expandedTitle, { color: textColor }]}>{item.title}</Text>
      </View>

      <ScrollView style={styles.expandedScrollView}>
        {imageSource && (
          <Image
            source={{ uri: imageSource }}
            style={styles.expandedImage}
            resizeMode="contain"
            onError={() => console.error(`Failed to load image: ${imageSource}`)}
          />
        )}
        <ResultList
          results={analysisResults}
          title={i18n.t('analyze.analysis_details')}
          headerIcon={'analytics-outline' as keyof typeof Ionicons.glyphMap}
          emptyText={i18n.t('analyze.no_analysis_data')}
          isCollapsible={false}
          initiallyCollapsed={false}
        />
      </ScrollView>
    </ThemedView>
  );
});

export default function BaseAnalyzeHistoryScreen() {
  const [historyItems, setHistoryItems] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ResultItem | null>(null);
  const language = useUserStore((state) => state.preferences?.language) || 'en';

  const textColor = useThemeColor({}, 'label');
  const mixListItemBackgroundColor = useThemeColor({}, 'mixListItemBackground'); // Add this line
  const themedSeparatorColor = useThemeColor({}, 'separator'); // Added for themed separator

  const navigation = useNavigation(); // Get navigation object

  // State for delete operation
  const [isDeleting, setIsDeleting] = useState(false);

  // State for toast notification
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHistoryItems([]); // Clear previous items

    try {
      const items = await fetchBaseAnalyzeHistory(language);
      setHistoryItems(items);
    } catch (e: any) {
      console.error("Failed to fetch base analysis history from screen:", e);
      // The error from the service should already be i18n'd if it's a known type
      // Otherwise, use a generic fallback.
      const errorMessage = e instanceof Error ? e.message : i18n.t('error.fetch_data_error', { defaultValue: "Failed to fetch history." });
      setError(errorMessage);
      setHistoryItems([]); // Ensure history items are empty on error
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const handleItemSelect = (item: ResultItem) => {
    if (item.expandedDetails?.analysisResults) {
      setSelectedItem(item);
    }
  };

  const handleCloseExpanded = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string | undefined) => {
    if (!itemId) return;

    Alert.alert(
      i18n.t('activity.confirm_delete_title', { defaultValue: "Confirm Delete" }),
      i18n.t('activity.confirm_delete_message', { defaultValue: "Are you sure you want to delete this record? This action cannot be undone." }),
      [
        {
          text: i18n.t('common.cancel', { defaultValue: "Cancel" }),
          style: "cancel"
        },
        {
          text: i18n.t('common.delete', { defaultValue: "Delete" }),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteBaseAnalyzeHistoryRecord(itemId);
              setHistoryItems(prevItems => prevItems.filter(item => item.id !== itemId));
              handleCloseExpanded();
              showToast(i18n.t('activity.record_deleted_successfully', { defaultValue: 'Record deleted successfully.' }), 'success');
            } catch (e: any) {
              console.error("Failed to delete item from screen:", e);
              const errorMessage = e instanceof Error ? e.message : i18n.t('error.delete_record_failed', { defaultValue: "Failed to delete record." });
              showToast(errorMessage, 'error');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  }, [handleCloseExpanded, showToast]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (selectedItem) {
          return (
            <Button
              title={isDeleting ? i18n.t('common.deleting', { defaultValue: 'Deleting...' }) : i18n.t('common.delete', { defaultValue: 'Delete' })}
              onPress={() => handleDeleteItem(selectedItem.id)}
              disabled={isDeleting}
              role="destructive"
              buttonStyle="plain"
              icon={isDeleting ? undefined : <Ionicons name="trash-outline" size={20} />}
            />
          );
        }
        return null;
      },
      headerTitle: selectedItem ? i18n.t('activity.record_details_title', { defaultValue: 'Record Details' }) : i18n.t('activity.base_analyze_history_title', { defaultValue: 'Scan History' }),
    });
  }, [navigation, selectedItem, isDeleting, handleDeleteItem, i18n]);

  // Custom renderer for history items with click handling
  const renderHistoryItem = ({ item, index }: { item: ResultItem, index: number }) => {
    const isLastItem = index === historyItems.length - 1;
    return (
      <TouchableOpacity
        onPress={() => handleItemSelect(item)}
        style={[
          styles.itemContainer,
          {
            backgroundColor: mixListItemBackgroundColor,
            borderBottomColor: themedSeparatorColor,
            borderBottomWidth: isLastItem ? 0 : StyleSheet.hairlineWidth,
          }
        ]}
        activeOpacity={item.expandedDetails?.analysisResults ? 0.7 : 1}
      >
        <View style={styles.itemContent}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.itemTextContainer}>
            <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
            {item.details && item.details.map((detail, i) => (
              <Text key={i} style={[styles.itemDetail, { color: textColor }]}>{detail}</Text>
            ))}
            {item.timestamp && (
              <Text style={[styles.itemTimestamp, { color: textColor }]}>
                {new Date(item.timestamp).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color={textColor} style={styles.itemArrow} />
        </View>
      </TouchableOpacity>
    );
  };

  let content;
  if (isLoading) {
    content = (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={textColor} />
      </ThemedView>
    );
  } else if (error) {
    content = (
      <ThemedView style={styles.centered}>
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
      </ThemedView>
    );
  } else if (selectedItem) {
    content = <ExpandedAnalysisView item={selectedItem} onClose={handleCloseExpanded} />;
  } else {
    content = (
      <SafeAreaView style={styles.flex}>
        <AppleSection >
          <FlatList
            data={historyItems}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: styles.scrollContent.paddingVertical || 8 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textColor }]}>
                  {i18n.t('activity.no_base_analyze_history_found')}
                </Text>
              </View>
            }
          />
        </AppleSection>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ToastNotification
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={dismissToast}
      />
      <View style={styles.contentWrapper}>
        {content}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    margin: 8,
  },
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
  scrollContent: {
    paddingVertical: 8, // Changed from padding: 16
    paddingHorizontal: 16, // Added for specific horizontal padding
  },
  expandedView: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Add elevation for Android
    elevation: 4,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 8,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  expandedImage: {
    width: '100%',
    height: 200,
  },
  expandedScrollView: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'transparent', // Base background, dynamic one will override
    // borderBottomColor is now applied dynamically
    borderBottomWidth: StyleSheet.hairlineWidth, // Default width, can be overridden to 0 for last item
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thumbnailImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 14,
    marginTop: 4,
  },
  itemTimestamp: {
    fontSize: 12,
    marginTop: 8,
  },
  itemArrow: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});