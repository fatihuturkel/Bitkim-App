FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0

# Copy the application code
COPY ./app ./app
COPY plant_village_dataset_turkish_names.csv .
COPY weights ./weights
COPY static ./static

# Expose the port the app runs on
# EXPOSE 8000 # This is more for documentation; Cloud Run uses the PORT env var.

# Command to run the application
# Use the PORT environment variable provided by Cloud Run, default to 8000 if not set.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]