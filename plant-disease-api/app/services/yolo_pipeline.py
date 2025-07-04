from ultralytics import YOLO
import csv
import logging # Add logging

logger = logging.getLogger(__name__) # Add logger

class YOLOPipeline:
    def __init__(self, weights_path):
        self.model = YOLO(weights_path)
        self.class_names = {}
        self._load_class_names()

    def _load_class_names(self):
        """Loads class names from the CSV file."""
        try:
            # Path relative to /app in Docker container
            with open("plant_village_dataset_turkish_names.csv", mode='r', encoding='utf-8') as file:
                reader = csv.reader(file)
                header = next(reader)  # Skip the header row
                logger.info(f"CSV Header: {header}") # Log header for debugging
                for row in reader:
                    if row and len(row) >= 4:  # Ensure row has class_id, english, turkish, latin names
                        try:
                            class_id = int(row[0])
                            # CSV columns: 0:id, 1:english_name, 2:turkish_name, 3:latin_name
                            self.class_names[class_id] = {
                                "english": row[4].strip(),  # Use the second English name (column 4)
                                "turkish": row[2].strip(),
                                "latin": row[3].strip()
                            }
                        except ValueError:
                            logger.warning(f"Skipping invalid row (ValueError parsing class_id): {row}")
                        except IndexError:
                            logger.warning(f"Skipping row with not enough columns (expected 4, got {len(row)}): {row}")
                    elif row: # Row exists but doesn't have enough columns
                        logger.warning(f"Skipping row with not enough columns (expected 4, got {len(row)}): {row}")
            logger.info(f"Loaded {len(self.class_names)} class names.")
            if not self.class_names:
                logger.warning("No class names were loaded. Check CSV format and content.")
        except FileNotFoundError:
            logger.error(f"Error: The file plant_village_dataset_turkish_names.csv was not found at /app/plant_village_dataset_turkish_names.csv.")
            # Depending on the application's needs, you might raise an error here
        except Exception as e:
            logger.error(f"An error occurred while loading class names: {e}", exc_info=True)

    def _get_prediction_dict(self, class_id, confidence):
        class_info = self.class_names.get(int(class_id), None) # Ensure class_id is int for lookup
        
        if class_info is None:
            # Handle case where class_id is not found in our loaded names
            logger.warning(f"Class ID {class_id} not found in loaded class names.")
            english_name = 'Unknown Class'
            turkish_name = 'Bilinmeyen Sınıf'
            latin_name = 'Unknown Latin Name'
        else:
            # Use correct mapping: English name from 'english', Turkish name from 'turkish'
            english_name = class_info.get('english', 'English name not available')
            turkish_name = class_info.get('turkish', 'Türkçe isim mevcut değil')
            latin_name = class_info.get('latin', 'Latin name not available')
        
        return {
            "english_name": english_name,
            "turkish_name": turkish_name,
            "latin_name": latin_name,
            "confidence": confidence  # Store as float, e.g., 0.7601
        }

    def classify(self, image):
        results = self.model.predict(source=image, task="classify", verbose=False)

        if not results or len(results) == 0:
            logger.warning("Model prediction returned no results.")
            return {"error": "No prediction made or model error."}
            
        result = results[0] # Assuming single image prediction
        
        if result.probs is None:
            logger.warning("Model prediction result has no 'probs' attribute.")
            return {"error": "Prediction made, but probabilities are not available."}

        analysis_results = {}
        
        top1_class_id = result.probs.top1
        top1_confidence = result.probs.top1conf.item() # .item() to get Python number
        
        analysis_results["top_prediction"] = self._get_prediction_dict(top1_class_id, top1_confidence)

        alternative_predictions_list = []
        # Check if there are enough classes for top5 and if confidence warrants alternatives
        if len(result.names) > 1 and top1_confidence < 0.98 and result.probs.top5 is not None and len(result.probs.top5) > 1:
            top_k_indices = result.probs.top5[1:] 
            top_k_confidences = result.probs.top5conf[1:]

            for class_id, conf_tensor in zip(top_k_indices, top_k_confidences):
                alternative_predictions_list.append(self._get_prediction_dict(class_id, conf_tensor.item()))
        
        analysis_results["alternative_predictions"] = alternative_predictions_list

        performance_metrics = {}
        if result.speed:
            performance_metrics["preprocessing_ms"] = round(result.speed.get('preprocess', 0.0), 2)
            performance_metrics["inference_ms"] = round(result.speed.get('inference', 0.0), 2)
            performance_metrics["postprocessing_ms"] = round(result.speed.get('postprocess', 0.0), 2)
        
        return {
            "analysis_results": analysis_results,
            "performance_metrics": performance_metrics
        }