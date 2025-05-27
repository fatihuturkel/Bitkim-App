import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../firebaseConfig'; // Import Firestore and auth
import { saveImage } from '../utils/fileUtils'; // Assuming saveImage is in ../utils/fileUtils.ts
import { PredictionData, UriPrediction, useImagePredictionStore } from '../zustand/imagePredictionData';
import { useImageSelectionStore } from '../zustand/imageSelectionStore';
import useUserStore from '../zustand/userStore'; // Import the user store

const API_URL = "https://plant-disease-apiv2-2859171769.europe-west1.run.app/predict/";

// New function to fetch a prediction for a single image URI
const fetchPredictionForUri = async (imageUri: string): Promise<UriPrediction | null> => {
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const extensionMatch = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  let mimeType = 'image/jpeg';

  if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'jpg' || extension === 'jpeg') {
    mimeType = 'image/jpeg';
  }

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any);

    console.log(`Uploading ${filename} (Type: ${mimeType}) to ${API_URL}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(`Server error for ${filename}: ${response.status}`, responseBodyText);
      throw new Error(`Server responded with ${response.status} for ${filename}`);
    }

    let predictionResultData: PredictionData;
    try {
      predictionResultData = JSON.parse(responseBodyText);
    } catch (parseError) {
      console.error(`Error parsing JSON response for ${filename}:`, parseError, `Response body: ${responseBodyText}`);
      throw new Error(`Failed to parse server response for ${filename}.`);
    }

    if (!predictionResultData.filename) {
      predictionResultData.filename = filename; // Ensure filename is part of the data if not returned by API
    }

    console.log(`Successfully received prediction for ${filename}.`);
    return {
      uri: imageUri,
      prediction: predictionResultData.prediction,
      scanDate: new Date().toISOString(), // Add scanDate here
    };
  } catch (error) {
    console.error(`Failed to fetch prediction for image ${filename}:`, error);
    return null; // Return null if an error occurs for this specific image
  }
};

const savePredictionToFirestore = async (uriPrediction: UriPrediction): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("User not authenticated. Cannot save prediction to Firestore.");
    return;
  }

  const scanHistoryEnabled = useUserStore.getState().preferences?.isBasicScanHistoryEnabled;
  if (scanHistoryEnabled === false) {
    console.log("Scan history is disabled. Skipping save to Firestore.");
    return;
  }

  let permanentImageUri = uriPrediction.permanentImagePath; // Use if already provided

  if (!permanentImageUri) { // If not provided by the caller (e.g. first save attempt failed)
    try {
      permanentImageUri = await saveImage(uriPrediction.uri);
      console.log(`Image saved permanently at: ${permanentImageUri} (in savePredictionToFirestore)`);
    } catch (error) {
      console.error(`Failed to save image permanently for URI ${uriPrediction.uri} in Firestore path:`, error);
      permanentImageUri = uriPrediction.uri; // Fallback to original URI
    }
  }

  const filename = permanentImageUri.split('/').pop() || 'image.jpg';
  // It's good practice to ensure prediction and its nested properties exist
  if (!uriPrediction.prediction || !uriPrediction.prediction.analysis_results) {
      console.error(`Prediction data is incomplete for ${filename}. Cannot save to Firestore.`);
      return;
  }

  const userId = currentUser.uid;
  const userDocRef = doc(db, 'user_legacy_scan_history', userId);
  const filenameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;

  // Reconstruct a PredictionData-like object for Firestore, including the full prediction details and a timestamp
  // Make sure to store the permanentImageUri if you want to reference the saved image
  const predictionDataForFirestore: UriPrediction = {
    ...uriPrediction,
    uri: uriPrediction.uri, // Keep original URI for reference
    prediction: uriPrediction.prediction,
    scanDate: uriPrediction.scanDate || new Date().toISOString(),
    permanentImagePath: permanentImageUri, // Store the determined permanent path
  };

  try {
    await setDoc(userDocRef, { [filenameWithoutExtension]: predictionDataForFirestore }, { merge: true });
    console.log(`Prediction for ${filenameWithoutExtension} (image at ${permanentImageUri}) saved to Firestore for user ${userId}.`);
  } catch (error) {
    console.error(`Failed to save prediction for ${filenameWithoutExtension} to Firestore:`, error);
  }
};


export const uploadImagesForPrediction = async (): Promise<void> => {
  const selectedImageUris = useImageSelectionStore.getState().selectedImageUris;
  const clearSelectedImages = useImageSelectionStore.getState().clearSelectedImages;
  const addPredictionToStore = useImagePredictionStore.getState().addPrediction;

  if (selectedImageUris.length === 0) {
    console.log("No images selected for prediction.");
    return;
  }

  console.log(`Processing ${selectedImageUris.length} image(s)...`);

  for (const imageUri of selectedImageUris) {
    try {
      const fetchedPrediction = await fetchPredictionForUri(imageUri);

      if (fetchedPrediction) {
        const scanHistoryEnabled = useUserStore.getState().preferences?.isBasicScanHistoryEnabled;
        if (scanHistoryEnabled !== false) { // Attempt to save image if history is not explicitly disabled
          try {
            const permanentPath = await saveImage(fetchedPrediction.uri);
            fetchedPrediction.permanentImagePath = permanentPath; // Set for the store and subsequent Firestore save
            console.log(`Image saved permanently at: ${permanentPath} (before adding to store)`);
          } catch (error) {
            console.error(`Failed to save image ${fetchedPrediction.uri} to permanent storage before adding to store:`, error);
            // fetchedPrediction.permanentImagePath will remain undefined.
            // The Image component will fallback to fetchedPrediction.uri.
          }
        }

        addPredictionToStore(fetchedPrediction); // Add to Zustand store (now with permanentImagePath if successfully saved)
        await savePredictionToFirestore(fetchedPrediction); // Save to Firestore
      } else {
        // Error already logged in fetchPredictionForUri
        console.log(`Skipping further processing for ${imageUri.split('/').pop()} due to fetch error.`);
      }
    } catch (error) {
      // This catch block handles errors not caught within fetchPredictionForUri or savePredictionToFirestore,
      // though they are designed to handle their own errors.
      // It ensures the loop continues for other images.
      const filename = imageUri.split('/').pop() || 'image.jpg';
      console.error(`Unhandled error during processing of image ${filename}:`, error);
    }
  }

  clearSelectedImages();
  console.log("Finished attempting to process all selected images.");
};