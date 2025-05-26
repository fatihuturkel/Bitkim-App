import { create } from 'zustand';

interface Prediction {
  english_name: string;
  turkish_name: string;
  latin_name: string;
  confidence: number;
}

interface AnalysisResults {
  top_prediction: Prediction;
  alternative_predictions: Prediction[];
}

interface PerformanceMetrics {
  preprocessing_ms: number;
  inference_ms: number;
  postprocessing_ms: number;
}

export interface PredictionData {
  filename: string;
  prediction: {
    analysis_results: AnalysisResults;
    performance_metrics: PerformanceMetrics;
  };
}

export interface UriPrediction {
  uri: string; // Original URI of the image selected by the user
  prediction: PredictionData['prediction'];
  permanentImagePath?: string; // Path to the image after it has been saved permanently
  scanDate?: string;  // ISO string of the date when the scan/prediction was made
}

interface ImagePredictionState {
  predictions: UriPrediction[]; // Changed from predictionResult: PredictionData | null
  addPrediction: (uriPrediction: UriPrediction) => void; // Changed from setPredictionResult
  clearPredictions: () => void; // Changed from clearPredictionResult
}

export const useImagePredictionStore = create<ImagePredictionState>((set) => ({
  predictions: [], // Initialize as an empty array
  addPrediction: (uriPrediction) =>
    set((state) => ({ predictions: [...state.predictions, uriPrediction] })), // Add to the array
  clearPredictions: () => set({ predictions: [] }), // Clear the array
}));