import numpy as np
import cv2


def preprocess_digit(img_array, bbox) -> np.ndarray:
    """Enhanced preprocessing with rotation correction and thinning.

    Mirrors the original advanced_preprocess_digit logic exactly.
    Returns a 28x28 float32 numpy array normalised to [0, 1].
    """
    rmin, rmax, cmin, cmax = bbox
    cropped = img_array[rmin:rmax, cmin:cmax]

    # Binary threshold (simple, not adaptive - works better for thick strokes)
    _, cropped = cv2.threshold(cropped, 127, 255, cv2.THRESH_BINARY)

    cropped = 255 - cropped

    # Detect and correct rotation using moments (conservative approach)
    coords = cv2.findNonZero(cropped)
    if coords is None:
        return np.zeros((28, 28), dtype=np.float32)

    # Calculate the angle of rotation using image moments
    moments = cv2.moments(coords)
    if moments['mu02'] != 0 and moments['mu20'] != 0:
        # Calculate the orientation angle
        angle = 0.5 * np.arctan2(2 * moments['mu11'], moments['mu20'] - moments['mu02'])
        angle_degrees = np.degrees(angle)

        # Normalize angle to [-45, 45] range to avoid over-rotation
        # This prevents rotating upright digits
        while angle_degrees > 45:
            angle_degrees -= 90
        while angle_degrees < -45:
            angle_degrees += 90

        # Only correct if angle is significant (> 10 degrees) and reasonable
        # Increased threshold to avoid rotating nearly-upright digits
        if abs(angle_degrees) > 10 and abs(angle_degrees) < 45:
            # Get rotation matrix
            center = (cropped.shape[1] // 2, cropped.shape[0] // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, angle_degrees, 1.0)

            # Apply rotation
            cropped = cv2.warpAffine(cropped, rotation_matrix, (cropped.shape[1], cropped.shape[0]),
                                     flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)

    # Morphological thinning to handle thick strokes
    kernel = np.ones((2, 2), np.uint8)
    cropped = cv2.erode(cropped, kernel, iterations=1)

    # Find content after rotation
    coords = cv2.findNonZero(cropped)
    if coords is None:
        return np.zeros((28, 28), dtype=np.float32)

    x, y, w, h = cv2.boundingRect(coords)
    cropped = cropped[y:y + h, x:x + w]

    height, width = cropped.shape

    # MNIST digits are roughly square, so we make ours similar
    if height > width:
        new_height = 20
        new_width = max(1, int(20 * width / height))
    else:
        new_width = 20
        new_height = max(1, int(20 * height / width))

    resized = cv2.resize(cropped, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Center in 28x28 with proper MNIST-style centering
    final = np.zeros((28, 28), dtype=np.uint8)
    y_offset = (28 - new_height) // 2
    x_offset = (28 - new_width) // 2
    final[y_offset:y_offset + new_height, x_offset:x_offset + new_width] = resized

    # Apply slight blur to match MNIST smoothness
    final = cv2.GaussianBlur(final, (3, 3), 0.8)

    # Normalize to 0-1 range
    final = final.astype(np.float32) / 255.0
    if final.max() > 0:
        final = (final - final.min()) / (final.max() - final.min())

    return final
