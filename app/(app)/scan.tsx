import AppleStyleCard from "@/components/AppleStyleCard";
import Button from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { Alert, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
export default function Scan() {
  const [firstImageUri, setFirstImageUri] = useState<string | null>(null);
  const [selectedImageCount, setSelectedImageCount] = useState<number>(0);

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
      setFirstImageUri(result.assets[0].uri);
      setSelectedImageCount(result.assets.length);
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Permission to access camera is required! Do you want to go to settings to grant permission?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
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
      setFirstImageUri(result.assets[0].uri);
      setSelectedImageCount(1); // Camera usually returns one image
    }
  };

  const clearImages = () => {
    setFirstImageUri(null);
    setSelectedImageCount(0);
  };

  const handleNavigate = () => {
    // Navigation logic will be implemented later
    Alert.alert("Navigate", "Navigation will be implemented here.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {firstImageUri && selectedImageCount > 0 ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: firstImageUri }} style={styles.previewImage} />
              <Text style={styles.imageCountText}>Selected Images: {selectedImageCount}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="Clear Images"
                  onPress={clearImages}
                  role="destructive"
                />
                <Button
                  title="Navigate"
                  onPress={handleNavigate}
                  role="normal"
                />

              </View>
            </View>
          ) : (
            <>
              <View style={styles.cardContainer}>
                <AppleStyleCard
                  style={styles.expandedCard}
                  title="Camera Roll"
                  onPress={pickImage}
                />
                <AppleStyleCard
                  style={styles.expandedCard}
                  title="Take Photo"
                  onPress={takePhoto}
                />
              </View>
              <View style={styles.cardContainer}>
                <AppleStyleCard
                  style={styles.expandedCard}
                  title="Scan QR Cod"
                  onPress={() => Alert.alert('Scan QR Code')}
                />
                <AppleStyleCard
                  style={styles.expandedCard}
                  title="Scan Barcode"
                  onPress={() => Alert.alert('Scan Barcode')}
                />
              </View>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
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
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
    verticalAlign: 'middle',
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
  },
});

