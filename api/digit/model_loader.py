import os
from tensorflow import keras


def load_primary(path: str):
    """Load and return the primary Keras model from the given path."""
    return keras.models.load_model(path)


def load_ensemble(count: int = 5) -> list:
    """Load and return a list of ensemble Keras models (up to count)."""
    models = []
    for i in range(count):
        model_path = f'ensemble_model_{i}.keras'
        if os.path.exists(model_path):
            models.append(keras.models.load_model(model_path))
    return models
