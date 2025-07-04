from fastapi import FastAPI
from app.api.routes.classification import classify as classification_router # Renamed import for clarity

app = FastAPI()

# Remove or comment out the existing @app.post("/classify/") endpoint
# as it conflicts with the router's purpose and was implemented incorrectly.
# @app.post("/classify/")
# async def classify_image(file: UploadFile = File(...)):
#     try:
#         contents = await file.read()
#         # The line below was incorrect as 'classify' is an APIRouter, not a callable function here.
#         results = classify(contents)
#         return JSONResponse(content={"results": results})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

# Include the router from app.api.routes.classification.py
# This will make the @classification_router.post("/predict/") endpoint
# available at the path /predict/
app.include_router(classification_router)