import AppleStyleCard from "@/components/AppleStyleCard";
import Button from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from '@/i18n'; // Add this import
import { useImageSelectionStore } from '@/zustand/imageSelectionStore'; // Import the store
import { Ionicons } from '@expo/vector-icons'; // Import an icon set
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React, { useRef, useState } from "react"; // Import useState and useRef
import { Alert, Dimensions, FlatList, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Analyze() {
  const { selectedImageUris, setSelectedImageUris, addImageUri, clearSelectedImages: clearStoreImages } = useImageSelectionStore();
  const [currentIndex, setCurrentIndex] = useState(0); // Add state for current index
  const flatListRef = useRef<FlatList<string>>(null); // Add ref for FlatList
  const tertiaryLabelColor = useThemeColor({}, 'tertiaryLabel');

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: true
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImageUris(uris);
      setCurrentIndex(0); // Reset index when new images are picked
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        i18n.t('analyze.permission_required_title'),
        i18n.t('analyze.permission_required_message'),
        [
          { text: i18n.t('common.cancel'), style: 'cancel' },
          { text: i18n.t('chat.open_settings'), onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUris([result.assets[0].uri]);
      setCurrentIndex(0); // Reset index when a new photo is taken
    }
  };

  const clearImages = () => {
    clearStoreImages();
    setCurrentIndex(0); // Reset index when images are cleared
  };

  const selectedImageCount = selectedImageUris.length;

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const scrollToNext = () => {
    if (flatListRef.current && currentIndex < selectedImageUris.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const scrollToPrevious = () => {
    if (flatListRef.current && currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {selectedImageUris.length > 0 ? (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.flatListContainer}>
                {selectedImageUris.length > 1 && currentIndex > 0 && (
                  <TouchableOpacity onPress={scrollToPrevious} style={[styles.chevron, styles.chevronLeft]}>
                    <Ionicons name="chevron-back" size={32} color={tertiaryLabelColor} />
                  </TouchableOpacity>
                )}
                <FlatList
                  ref={flatListRef}
                  data={selectedImageUris}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.previewImage} />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageList}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  scrollEventThrottle={200}
                />
                {selectedImageUris.length > 1 && currentIndex < selectedImageUris.length - 1 && (
                  <TouchableOpacity onPress={scrollToNext} style={[styles.chevron, styles.chevronRight]}>
                    <Ionicons name="chevron-forward" size={32} color={tertiaryLabelColor} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.imageCountText}>{i18n.t('analyze.selected_images_count', { count: selectedImageCount })}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title={i18n.t('analyze.ai_chat_button')}
                  onPress={() => router.push('/analyze/chat')}
                  role="normal"
                  style={styles.actionButton}
                />
                <Button
                  title={i18n.t('analyze.legacy_analyzer_button')}
                  onPress={() => router.push('/analyze/legacyanalyze')}
                  role="normal"
                  style={styles.actionButton}
                />
                <Button
                  title={i18n.t('analyze.clear_images')}
                  onPress={clearImages}
                  role="destructive"
                  style={styles.clearButtonTopMargin} // Apply top margin style here
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.cardContainer}>
                <AppleStyleCard
                  style={styles.expandedCard}
                  title={i18n.t('analyze.camera_roll_card_title')}
                  onPress={pickImage}
                />
                <AppleStyleCard
                  style={styles.expandedCard}
                  title={i18n.t('analyze.take_photo_card_title')}
                  onPress={takePhoto}
                />
              </View>
              <View style={styles.cardContainer}>
                <AppleStyleCard
                  style={styles.expandedCard}
                  title={i18n.t('analyze.legacy_analyzer_button')}
                  onPress={() => router.push('/analyze/legacyanalyze')}
                />
                <AppleStyleCard
                  style={styles.expandedCard}
                  title={i18n.t('analyze.ai_chat_button')}
                  onPress={() => router.push('/analyze/chat')}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
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
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  expandedCard: {
    flex: 1,
    marginHorizontal: 8,
  },
  imagePreviewContainer: {
    flex: 1,
    //alignItems: 'center', // Keep commented or adjust as needed
    //justifyContent: 'center', // Keep commented or adjust as needed
  },
  flatListContainer: { // Added to wrap FlatList and chevrons
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center FlatList if it's smaller than container
    position: 'relative', // Needed for absolute positioning of chevrons
    height: Dimensions.get('window').width - 32, // Match imageList height
  },
  imageList: {
    height: Dimensions.get('window').width - 32, // Assuming padding of 16 on each side
    // Or a fixed height, e.g., 300
    width: Dimensions.get('window').width - 32, // Ensure FlatList takes up the space
  },
  previewImage: {
    width: Dimensions.get('window').width - 32, // Match parent FlatList item width (ScrollView padding)
    height: '100%', // Take full height of the FlatList item
    aspectRatio: 1, // Keep aspect ratio if desired, or remove for full height
    resizeMode: 'contain',
    // verticalAlign: 'middle', // Not applicable for FlatList items directly like this
  },
  chevron: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }], // Adjust based on icon size / 2
    zIndex: 1, // Ensure chevrons are above the image
    padding: 10, // Add some padding for easier touch
  },
  chevronLeft: {
    left: 5, // Adjust as needed
  },
  chevronRight: {
    right: 5, // Adjust as needed
  },
  imageCountText: {
    fontSize: 16,
    padding: 16,
    textAlign: 'center',
    color: 'red'
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'column', // Changed from 'row'
    alignItems: 'stretch', // Ensure buttons take full width
  },
  actionButton: {
    marginBottom: 8, // Add space between buttons
  },
  clearButtonTopMargin: { // Add this new style
    marginTop: 16, // This will add extra space above the clear button
  },
  clearButton: {
    // This style might no longer be needed or can be merged into actionButton
    // marginRight: 8, 
  },
  rightButtonsContainer: {
    // This container is no longer used
    // flexDirection: 'column',
    // alignItems: 'stretch', 
  },
  legacyAnalyzerButton: {
    // This style might no longer be needed or can be merged into actionButton
    // marginTop: 8, 
  },
});

