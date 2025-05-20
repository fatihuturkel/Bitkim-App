import ResultList, { ResultItem } from '@/components/ResultList';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native'; // Added import
import React, { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import the hook
import { uploadImagesForPrediction } from '../../../services/imageService';
import { UriPrediction, useImagePredictionStore } from '../../../zustand/imagePredictionData';
import { useImageSelectionStore } from '../../../zustand/imageSelectionStore';

const { width: screenWidth } = Dimensions.get('window');

export default function Analyze() {
  const storeSelectedImageUris = useImageSelectionStore((state) => state.selectedImageUris);
  const predictionsFromStore = useImagePredictionStore((state) => state.predictions);
  const clearStorePredictions = useImagePredictionStore((state) => state.clearPredictions);

  // const [analysisData, setAnalysisData] = useState<UriPrediction[]>([]); // Removed
  const [isLoading, setIsLoading] = useState(false);
  const [currentBatchUris, setCurrentBatchUris] = useState<string[]>([]);

  const textColor = useThemeColor({}, 'label');
  const systemBackgroundColor = useThemeColor({}, 'systemBackground');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryLabel');
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // Added

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
        title: `Top: ${top.english_name}`,
        details: [
          `Turkish: ${top.turkish_name}`,
          `Latin: ${top.latin_name}`,
          `Confidence: ${(top.confidence * 100).toFixed(2)}%`,
        ],
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
        status: 'Prediction',
        isItemCollapsible: true,
        initiallyItemCollapsed: true,
      });
    }

    if (item.prediction?.analysis_results?.alternative_predictions) {
      item.prediction.analysis_results.alternative_predictions.forEach((alt, index) => {
        analysisResults.push({
          id: `${item.uri}-alt-prediction-${index}`,
          title: `Alt. ${index + 1}: ${alt.english_name}`,
          details: [
            `Turkish: ${alt.turkish_name}`,
            `Latin: ${alt.latin_name}`,
            `Confidence: ${(alt.confidence * 100).toFixed(2)}%`,
          ],
          icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
          status: 'Alternative',
          isItemCollapsible: true,
          initiallyItemCollapsed: true,
        });
      });
    }

    const perf = item.prediction?.performance_metrics;
    if (perf) {
      analysisResults.push({
        id: `${item.uri}-performance-metrics`,
        title: 'Performance Metrics',
        details: [
          `Preprocessing: ${perf.preprocessing_ms} ms`,
          `Inference: ${perf.inference_ms} ms`,
          `Postprocessing: ${perf.postprocessing_ms} ms`,
        ],
        icon: 'speedometer-outline' as keyof typeof Ionicons.glyphMap,
        status: 'Metrics',
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
            title="Analysis Details"
            headerIcon={'analytics-outline' as keyof typeof Ionicons.glyphMap}
            emptyText="No analysis data available for this item."
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
            <Text style={{ color: textColor, marginTop: 10 }}>Analyzing images...</Text>
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
            <Text style={{ color: textColor }}>No images selected for analysis.</Text>
            <Text style={{ color: tertiaryTextColor }}>Please go back and select images to analyze.</Text>
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
