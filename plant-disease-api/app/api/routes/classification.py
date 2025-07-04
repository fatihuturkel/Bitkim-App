from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.yolo_pipeline import YOLOPipeline
import shutil
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This APIRouter instance must be named 'classify' to match the import in main.py
# e.g., from app.api.routes.classification import classify
classify = APIRouter()

# Initialize the pipeline
# The weights_path is relative to the WORKDIR /app in the Docker container.
# Your Dockerfile copies 'weights' to '/app/weights'.
try:
    pipeline = YOLOPipeline(weights_path="weights/yolo11m/best.pt")
    logger.info("YOLOPipeline initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize YOLOPipeline: {e}", exc_info=True)
    # Depending on requirements, you might want the app to not start,
    # or handle this gracefully in the endpoint.
    pipeline = None

@classify.post("/predict/", summary="Classify an image of a plant", description="Upload an image to classify plant disease or condition.")
async def predict_image_endpoint(file: UploadFile = File(...)):
    if pipeline is None:
        logger.error("Prediction attempt while pipeline is not initialized.")
        raise HTTPException(status_code=503, detail="Model not loaded. Service unavailable.")

    # Using /tmp for temporary files in a container is good practice
    temp_file_path = f"/tmp/{file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Temporary file saved: {temp_file_path}")

        prediction_results = pipeline.classify(temp_file_path)
        logger.info(f"Classification successful for {file.filename}")

        return {"filename": file.filename, "prediction": prediction_results}
    except Exception as e:
        logger.error(f"Error during image classification for {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Temporary file removed: {temp_file_path}")
            except Exception as e:
                logger.error(f"Error removing temporary file {temp_file_path}: {e}", exc_info=True)

# If your main.py looks like:
# from app.api.routes import classification
# app.include_router(classification.router)
# Then you would name the APIRouter instance 'router' instead of 'classify'.
# But given the error, 'classify' is the expected name.