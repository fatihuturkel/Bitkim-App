import AppleStyleCard from "@/components/AppleStyleCard";
import Button from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import i18n from '@/i18n'; // Add this import
import { useImageSelectionStore } from '@/zustand/imageSelectionStore'; // Import the store
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React from "react"; // Removed useState
import { Alert, Dimensions, FlatList, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Analyze() {
  const { selectedImageUris, setSelectedImageUris, addImageUri, clearSelectedImages: clearStoreImages } = useImageSelectionStore();

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
    }
  };

  const clearImages = () => {
    clearStoreImages();
  };

  const selectedImageCount = selectedImageUris.length;

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
              <FlatList
                data={selectedImageUris}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.previewImage} />
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageList}
              />
              <Text style={styles.imageCountText}>{i18n.t('analyze.selected_images_count', { count: selectedImageCount })}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title={i18n.t('analyze.clear_images')}
                  onPress={clearImages}
                  role="destructive"
                />
                <View style={styles.rightButtonsContainer}>
                  <Button
                    title={i18n.t('analyze.ai_chat_button')}
                    onPress={() => router.push('/analyze/chat')}
                    role="normal"
                  />
                  <Button
                    title={i18n.t('analyze.legacy_analyzer_button')}
                    onPress={() => router.push('/analyze/legacyanalyze')}
                    role="normal"
                    style={styles.legacyAnalyzerButton}
                  />
                </View>
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
  imageList: {
    height: Dimensions.get('window').width - 32, // Assuming padding of 16 on each side
    // Or a fixed height, e.g., 300
  },
  previewImage: {
    width: Dimensions.get('window').width - 32, // Match parent FlatList item width (ScrollView padding)
    height: '100%', // Take full height of the FlatList item
    aspectRatio: 1, // Keep aspect ratio if desired, or remove for full height
    resizeMode: 'contain',
    // verticalAlign: 'middle', // Not applicable for FlatList items directly like this
  },
  imageCountText: {
    fontSize: 16,
    padding: 16,
    textAlign: 'center',
    color: 'red'
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
  },
  rightButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch', // Changed from 'flex-end' to 'stretch'
  },
  legacyAnalyzerButton: {
    marginTop: 8, // Add some space between AI Chat and Legacy Analyzer buttons
  },
});

