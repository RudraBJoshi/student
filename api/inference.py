import numpy as np
from scipy.ndimage import rotate, shift


def predict_with_tta(image, model, ensemble_models, num_augmentations: int = 8) -> np.ndarray:
    """Test-Time Augmentation for robust predictions.

    Args:
        image: 28x28 float32 numpy array (the preprocessed digit).
        model: Primary Keras model.
        ensemble_models: List of ensemble Keras models (may be empty).
        num_augmentations: Total number of TTA passes (including the original).

    Returns:
        Averaged probability array of shape (10,).
    """
    predictions = []

    # Original
    predictions.append(model.predict(image.reshape(1, 28, 28, 1), verbose=0)[0])

    # Augmented versions
    for _ in range(num_augmentations - 1):
        aug_image = image.copy()

        # Small rotation
        angle = np.random.uniform(-5, 5)
        aug_image = rotate(aug_image, angle, reshape=False, mode='constant', cval=0)

        # Small shift
        shift_x = np.random.randint(-2, 3)
        shift_y = np.random.randint(-2, 3)
        aug_image = shift(aug_image, [shift_y, shift_x], mode='constant', cval=0)

        predictions.append(model.predict(aug_image.reshape(1, 28, 28, 1), verbose=0)[0])

    # Ensemble if available
    if ensemble_models:
        for ens_model in ensemble_models:
            predictions.append(ens_model.predict(image.reshape(1, 28, 28, 1), verbose=0)[0])

    # Average
    avg_prediction = np.mean(predictions, axis=0)

    return avg_prediction
