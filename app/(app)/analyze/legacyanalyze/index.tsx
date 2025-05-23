import ResultList, { ResultItem } from '@/components/ResultList';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { uploadImagesForPrediction } from '@/services/imageService';
import { UriPrediction, useImagePredictionStore } from '@/zustand/imagePredictionData';
import { useImageSelectionStore } from '@/zustand/imageSelectionStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '@/i18n'; // Add this import

const { width: screenWidth } = Dimensions.get('window');

export default function Analyze() {
  const storeSelectedImageUris = useImageSelectionStore((state) => state.selectedImageUris);
  const predictionsFromStore = useImagePredictionStore((state) => state.predictions);
  const clearStorePredictions = useImagePredictionStore((state) => state.clearPredictions);

  // const [analysisData, setAnalysisData] = useState<UriPrediction[]>(> // Removed
  const [isLoading, setIsLoading] = useState(false);
  const [currentBatchUris, setCurrentBatchUris] = useState<string[]>([]);

  const textColor = useThemeColor({}, 'label');
  const systemBackgroundColor = useThemeColor({}, 'systemBackground');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryLabel');
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // Added
  const navigation = useNavigation<any>(); // Added navigation

  // Add useFocusEffect to hide/show tab bar
  useFocusEffect(
    useCallback(() => {
      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        // Hide the tab bar
        parentNavigator.setOptions({
          tabBarStyle: { display: 'none' },
        });
      }

      return () => {
        // Restore the tab bar when the screen is unfocused
        if (parentNavigator) {
          parentNavigator.setOptions({
            tabBarStyle: undefined, // Resets to the default style defined in the Tabs navigator
          });
        }
      };
    }, [navigation])
  );

  useEffect(() => {
    if (isFocused) { // Check if the screen is focused
      if (storeSelectedImageUris.length > 0) {
        const isNewBatch =
          storeSelectedImageUris.length !== currentBatchUris.length ||
          !storeSelectedImageUris.every((uri, index) => uri === currentBatchUris[index]);

        if (isNewBatch) {
          setIsLoading(true);
          setCurrentBatchUris([...storeSelectedImageUris]);
          clearStorePredictions(); // Clear previous predictions from the store

          const process = async () => {
            try {
              await uploadImagesForPrediction();
            } catch (error) {
              console.error("Error during image upload process:", error);
              // setIsLoading(false) will be handled by the finally block
            } finally {
              setIsLoading(false); // Ensure loading is set to false after process completes or fails
            }
          };
          process();
        }
        // If not a new batch, and screen is focused, existing state (isLoading, predictions) persists.
        // If isLoading was true from a previous unfocused state, it will be set to false by the finally block
        // once the pending process completes.
      } else {
        // Focused, but no images selected (e.g., images were cleared)
        setIsLoading(false);
        setCurrentBatchUris([]); // Reset current batch tracking
        // clearStorePredictions(); // Optionally clear predictions if no images are selected.
                                 // Be mindful if clearStorePredictions itself triggers this effect.
      }
    }
    // If not focused, do nothing in this effect. Analysis won't start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, storeSelectedImageUris, clearStorePredictions]); // Added isFocused to dependencies
                                                                  // currentBatchUris is intentionally not in deps here

  // Effect 2 removed as predictionsFromStore will be used directly for rendering

  const renderItem = ({ item }: { item: UriPrediction }) => {
    const analysisResults: ResultItem[] = [];

    const top = item.prediction?.analysis_results?.top_prediction;
    if (top) {
      analysisResults.push({
        id: `${item.uri}-top-prediction`,
        title: i18n.t('analyze.top_prediction', { name: top.english_name }),
        details: [
          i18n.t('analyze.turkish', { name: top.turkish_name }),
          i18n.t('analyze.latin', { name: top.latin_name }),
          i18n.t('analyze.confidence', { percentage: (top.confidence * 100).toFixed(2) }),
        ],
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
        status: i18n.t('analyze.prediction'),
        isItemCollapsible: true,
        initiallyItemCollapsed: true,
      });
    }

    if (item.prediction?.analysis_results?.alternative_predictions) {
      item.prediction.analysis_results.alternative_predictions.forEach((alt, index) => {
        analysisResults.push({
          id: `${item.uri}-alt-prediction-${index}`,
          title: i18n.t('analyze.alternative_prediction', { 
            index: index + 1, 
            name: alt.english_name 
          }),
          details: [
            i18n.t('analyze.turkish', { name: alt.turkish_name }),
            i18n.t('analyze.latin', { name: alt.latin_name }),
            i18n.t('analyze.confidence', { percentage: (alt.confidence * 100).toFixed(2) }),
          ],
          icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
          status: i18n.t('analyze.alternative'),
          isItemCollapsible: true,
          initiallyItemCollapsed: true,
        });
      });
    }

    const perf = item.prediction?.performance_metrics;
    if (perf) {
      analysisResults.push({
        id: `${item.uri}-performance-metrics`,
        title: i18n.t('analyze.performance_metrics'),
        details: [
          i18n.t('analyze.preprocessing', { ms: perf.preprocessing_ms?.toString() || '0' }),
          i18n.t('analyze.inference', { ms: perf.inference_ms?.toString() || '0' }),
          i18n.t('analyze.postprocessing', { ms: perf.postprocessing_ms?.toString() || '0' }),
        ],
        icon: 'speedometer-outline' as keyof typeof Ionicons.glyphMap,
        status: i18n.t('analyze.metrics'),
        isItemCollapsible: true,
        initiallyItemCollapsed: true,
      });
    }

    return (
      <View style={[styles.slide, { backgroundColor: systemBackgroundColor }]}>
        <Image source={{ uri: item.uri }} style={styles.image} />
        <ScrollView
          style={styles.predictionScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          <ResultList
            results={analysisResults}
            title={i18n.t('analyze.analysis_details')}
            headerIcon={'analytics-outline' as keyof typeof Ionicons.glyphMap}
            emptyText={i18n.t('analyze.no_analysis_data')}
            isCollapsible={false}
            initiallyCollapsed={false}
          />
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={textColor} />
            <Text style={{ color: textColor, marginTop: 10 }}>
              {i18n.t('analyze.analyzing_images')}
            </Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (predictionsFromStore.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyContainer}>
            <Text style={{ color: textColor }}>
              {i18n.t('analyze.no_images_selected')}
            </Text>
            <Text style={{ color: tertiaryTextColor }}>
              {i18n.t('analyze.please_go_back_select')}
            </Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: systemBackgroundColor }]}>
      <FlatList
        data={predictionsFromStore} // Use predictionsFromStore directly
        renderItem={renderItem}
        keyExtractor={(item) => item.uri}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  slide: {
    width: screenWidth,
    flex: 1,
  },
  image: {
    width: screenWidth,
    height: screenWidth, // Make image height same as width for a square aspect ratio
    resizeMode: 'contain',
  },
  predictionScrollView: {
    flex: 1,
  },
  // predictionContainer, header, subHeader, alternativePrediction styles can be removed if not directly used
});
