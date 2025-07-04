# Plant Disease API

This project is a FastAPI application that utilizes a YOLO (You Only Look Once) model for classifying plant diseases based on images. The application provides an API endpoint for users to upload images and receive classification results.

## Project Structure

```
plant-disease-api
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── api
│   │   ├── __init__.py
│   │   └── routes
│   │       ├── __init__.py
│   │       └── classification.py
│   ├── core
│   │   ├── __init__.py
│   │   └── config.py
│   ├── models
│   │   ├── __init__.py
│   │   └── schemas.py
│   └── services
│       ├── __init__.py
│       └── yolo_pipeline.py
├── weights
│   └── yolo11m
│       └── best.pt
├── static
│   └── uploads
├── plant_village_dataset_turkish_names.csv
├── requirements.txt
├── Dockerfile
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd plant-disease-api
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Access the API:**
   The API will be available at `http://127.0.0.1:8000`. You can use tools like Postman or curl to interact with the endpoints.

## Usage

### Image Classification Endpoint

- **Endpoint:** `/predict/`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Form field:** `file` — the image file to classify (e.g., JPEG, PNG).

Request example (curl):

```bash
curl -X POST "http://127.0.0.1:8000/predict/" -F "file=@/path/to/leaf.jpg"
```

Python `requests` example:

```python
import requests

url = "http://127.0.0.1:8000/predict/"
with open("leaf.jpg", "rb") as f:
      files = {"file": f}
      resp = requests.post(url, files=files)
print(resp.status_code)
print(resp.json())
```

Response format
 - Root fields:
    - `filename` (string): original uploaded filename.
    - `prediction` (object): model output.
 - `prediction.analysis_results.top_prediction` (object):
    - `english_name` (string)
    - `turkish_name` (string)
    - `latin_name` (string)
    - `confidence` (float, 0.0–1.0)
 - `prediction.analysis_results.alternative_predictions` (array): zero or more alternative prediction objects (same shape as `top_prediction`).
 - `prediction.performance_metrics` (object): timing metrics in milliseconds, e.g. `preprocessing_ms`, `inference_ms`, `postprocessing_ms`.

Example success response:

```json
{
   "filename": "leaf.jpg",
   "prediction": {
      "analysis_results": {
         "top_prediction": {
            "english_name": "Tomato___Early_blight",
            "turkish_name": "Domates Erken Yanıklığı",
            "latin_name": "Alternaria solani",
            "confidence": 0.9876
         },
         "alternative_predictions": [
            {
               "english_name": "Tomato___Late_blight",
               "turkish_name": "Domates Geç Yanıklığı",
               "latin_name": "Phytophthora infestans",
               "confidence": 0.0123
            }
         ]
      },
      "performance_metrics": {
         "preprocessing_ms": 12.34,
         "inference_ms": 123.45,
         "postprocessing_ms": 1.23
      }
   }
}
```

Error responses
- `503 Service Unavailable` — model not loaded:

```json
{"detail":"Model not loaded. Service unavailable."}
```

- `500 Internal Server Error` — processing error:

```json
{"detail":"Error processing image: <error message>"}
```

Notes:
- The app includes the router without a path prefix, so the endpoint is available at `/predict/`. If you mount the app under a prefix (for example `/api`), the full path will change accordingly.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.