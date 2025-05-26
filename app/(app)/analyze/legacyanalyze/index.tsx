import ResultList, { ResultItem } from '@/components/ResultList';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import i18n from '@/i18n'; // Add this import
import { uploadImagesForPrediction } from '@/services/imageService';
import { UriPrediction, useImagePredictionStore } from '@/zustand/imagePredictionData';
import { useImageSelectionStore } from '@/zustand/imageSelectionStore';
import useUserStore from '@/zustand/userStore'; // Import useUserStore
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

const { width: screenWidth } = Dimensions.get('window');

// Create a separate component for rendering prediction items
// Define PredictionItem outside of the main component
const PredictionItem = React.memo(({ item, systemBackgroundColor, textColor, insets, index, totalItems }: {
  item: UriPrediction;
  systemBackgroundColor: string;
  textColor: string;
  insets: { bottom: number };
  index: number; // Added index
  totalItems: number; // Added totalItems
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const analysisResults: ResultItem[] = [];
  const language = useUserStore((state) => state.preferences?.language) || 'en'; // Get language from store

  // Use permanentImagePath if available, otherwise fall back to uri
  const imageSource = item.permanentImagePath || item.uri;
  
  console.log(`Rendering image from URI: ${imageSource}`);

  const top = item.prediction?.analysis_results?.top_prediction;
  if (top) {
    let title = '';
    const details = [];
    if (language === 'tr') {
      title = i18n.t('analyze.top_prediction', { name: top.turkish_name });
      details.push(i18n.t('analyze.english', { name: top.english_name }));
      details.push(i18n.t('analyze.latin', { name: top.latin_name }));
    } else if (language === 'en') {
      title = i18n.t('analyze.top_prediction', { name: top.english_name });
      details.push(i18n.t('analyze.turkish', { name: top.turkish_name }));
      details.push(i18n.t('analyze.latin', { name: top.latin_name }));
    } else {
      // Default to English name for title if language is not 'tr' or 'en'
      title = i18n.t('analyze.top_prediction', { name: top.english_name });
      details.push(i18n.t('analyze.turkish', { name: top.turkish_name }));
      details.push(i18n.t('analyze.latin', { name: top.latin_name }));
    }
    details.push(i18n.t('analyze.confidence', { percentage: (top.confidence * 100).toFixed(2) }));

    analysisResults.push({
      id: `${item.uri}-top-prediction`,
      title: title,
      details: details,
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      status: i18n.t('analyze.prediction'),
      isItemCollapsible: true,
      initiallyItemCollapsed: true,
    });
  }

  if (item.prediction?.analysis_results?.alternative_predictions) {
    item.prediction.analysis_results.alternative_predictions.forEach((alt, index) => {
      let title = '';
      const details = [];
      if (language === 'tr') {
        title = i18n.t('analyze.alternative_prediction', { 
          index: index + 1, 
          name: alt.turkish_name 
        });
        details.push(i18n.t('analyze.english', { name: alt.english_name }));
        details.push(i18n.t('analyze.latin', { name: alt.latin_name }));
      } else if (language === 'en') {
        title = i18n.t('analyze.alternative_prediction', { 
          index: index + 1, 
          name: alt.english_name 
        });
        details.push(i18n.t('analyze.turkish', { name: alt.turkish_name }));
        details.push(i18n.t('analyze.latin', { name: alt.latin_name }));
      } else {
        // Default to English name for title if language is not 'tr' or 'en'
        title = i18n.t('analyze.alternative_prediction', { 
          index: index + 1, 
          name: alt.english_name 
        });
        details.push(i18n.t('analyze.turkish', { name: alt.turkish_name }));
        details.push(i18n.t('analyze.latin', { name: alt.latin_name }));
      }
      details.push(i18n.t('analyze.confidence', { percentage: (alt.confidence * 100).toFixed(2) }));
      
      analysisResults.push({
        id: `${item.uri}-alt-prediction-${index}`,
        title: title,
        details: details,
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
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageSource }} 
          style={styles.image} 
          onError={(e) => {
            console.error(`Image failed to load: ${imageSource}`, e.nativeEvent.error);
            setImageLoadError(true);
          }}
        />
        {imageLoadError && (
          <View style={styles.imageErrorContainer}>
            <Ionicons name="image-outline" size={50} color={textColor} />
            <Text style={{ color: textColor, marginTop: 10 }}>
              {i18n.t('analyze.image_load_error')}
            </Text>
          </View>
        )}
        {/* Left Chevron */}
        {totalItems > 1 && index > 0 && (
          <View style={[styles.chevronContainer, styles.leftChevron]}>
            <Ionicons name="chevron-back" size={30} color={useThemeColor({}, 'tertiaryLabel')} />
          </View>
        )}
        {/* Right Chevron */}
        {totalItems > 1 && index < totalItems - 1 && (
          <View style={[styles.chevronContainer, styles.rightChevron]}>
            <Ionicons name="chevron-forward" size={30} color={useThemeColor({}, 'tertiaryLabel')} />
          </View>
        )}
      </View>
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
});

export default function Analyze() {
  const storeSelectedImageUris = useImageSelectionStore((state) => state.selectedImageUris);
  const predictionsFromStore = useImagePredictionStore((state) => state.predictions);
  const clearStorePredictions = useImagePredictionStore((state) => state.clearPredictions);
  const language = useUserStore((state) => state.preferences?.language) || 'en'; // Get language from store

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

  // Add debugging to see the image URIs being processed
  useEffect(() => {
    if (predictionsFromStore.length > 0) {
      console.log(`Current predictions in store: ${predictionsFromStore.length}`);
      predictionsFromStore.forEach((prediction, idx) => { // Changed index to idx to avoid conflict
        console.log(`Prediction ${idx + 1}:`);
        console.log(`  - URI: ${prediction.uri}`);
        console.log(`  - Permanent path: ${prediction.permanentImagePath || 'Not saved permanently'}`);
      });
    }  }, [predictionsFromStore]);

  const renderItem = ({ item, index }: { item: UriPrediction; index: number }) => { // Added index from FlatList
    return (
      <PredictionItem 
        item={item} 
        systemBackgroundColor={systemBackgroundColor} 
        textColor={textColor} 
        insets={insets} 
        index={index} // Pass index
        totalItems={predictionsFromStore.length} // Pass total number of items
      />
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
  imageContainer: { // Added imageContainer style
    width: screenWidth,
    height: screenWidth, // Make image height same as width for a square aspect ratio
    position: 'relative', // Needed for absolute positioning of chevrons
  },
  image: {
    width: '100%', // Image fills the container
    height: '100%',
    resizeMode: 'contain',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Cover the entire image container
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)', // Slightly tinted background
  },
  predictionScrollView: {
    flex: 1,
  },
  chevronContainer: { // Style for chevron containers
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10, // Add some padding
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: for debugging or slight background
  },
  leftChevron: { // Style for left chevron
    left: 5, // Position from the left
  },
  rightChevron: { // Style for right chevron
    right: 5, // Position from the right
  },
  // predictionContainer, header, subHeader, alternativePrediction styles can be removed if not directly used
});
