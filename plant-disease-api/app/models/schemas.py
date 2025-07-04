from pydantic import BaseModel
from typing import List, Optional

class ClassificationRequest(BaseModel):
    image: str  # Base64 encoded image or image URL

class ClassificationResponse(BaseModel):
    predictions: List[str]  # List of classification results
    confidence: List[float]  # List of confidence scores for each prediction
    performance_metrics: Optional[dict] = None  # Optional performance metrics like processing time