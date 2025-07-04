from pydantic import BaseSettings

class Settings(BaseSettings):
    weights_path: str = "weights/yolo11m/best.pt"
    class_names_file: str = "plant_village_dataset_turkish_names.csv"

    class Config:
        env_file = ".env"

settings = Settings()