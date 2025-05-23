import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../firebaseConfig'; // Import Firestore and auth
import { PredictionData, UriPrediction, useImagePredictionStore } from '../zustand/imagePredictionData';
import { useImageSelectionStore } from '../zustand/imageSelectionStore';
import useUserStore from '../zustand/userStore'; // Import the user store

const API_URL = "https://plant-disease-api-2859171769.europe-west1.run.app/predict/";

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
    };
  } catch (error) {
    console.error(`Failed to fetch prediction for image ${filename}:`, error);
    return null; // Return null if an error occurs for this specific image
  }
};

// New function to save a single prediction to Firestore
const savePredictionToFirestore = async (uriPrediction: UriPrediction): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("User not authenticated. Cannot save prediction to Firestore.");
    return;
  }

  // Check scan history preference
  const scanHistoryEnabled = useUserStore.getState().preferences?.isBasicScanHistoryEnabled;
  if (scanHistoryEnabled === false) { // Explicitly check for false
    console.log("Scan history is disabled. Skipping save to Firestore.");
    return;
  }

  const filename = uriPrediction.uri.split('/').pop() || 'image.jpg';
  // It's good practice to ensure prediction and its nested properties exist
  if (!uriPrediction.prediction || !uriPrediction.prediction.analysis_results) {
      console.error(`Prediction data is incomplete for ${filename}. Cannot save to Firestore.`);
      return;
  }

  const userId = currentUser.uid;
  const userDocRef = doc(db, 'user_legacy_scan_history', userId);
  const filenameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;

  // Reconstruct a PredictionData-like object for Firestore, including the full prediction details and a timestamp
  const predictionDataForFirestore: PredictionData & { scanDate: string } = {
    filename: filename, // Store the original filename
    prediction: uriPrediction.prediction, // This is the nested prediction object
    scanDate: new Date().toISOString(),
  };

  try {
    await setDoc(userDocRef, { [filenameWithoutExtension]: predictionDataForFirestore }, { merge: true });
    console.log(`Prediction for ${filenameWithoutExtension} saved to Firestore for user ${userId}.`);
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
      const uriPredictionResult = await fetchPredictionForUri(imageUri);

      if (uriPredictionResult) {
        addPredictionToStore(uriPredictionResult); // Add to Zustand store
        await savePredictionToFirestore(uriPredictionResult); // Save to Firestore
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