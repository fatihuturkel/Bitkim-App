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
  uri: string;
  prediction: PredictionData['prediction'];
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