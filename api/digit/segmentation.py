import numpy as np
from scipy import ndimage


def find_connected_components(img_array, threshold=250) -> list:
    """Find separate digits using projection-based segmentation.

    Returns a list of dicts with keys 'bbox' (rmin, rmax, cmin, cmax) and
    'center_x', sorted left-to-right.
    """
    # Binarize
    binary = (img_array < threshold).astype(np.uint8) * 255

    # Try horizontal projection to find digit boundaries
    horizontal_projection = np.sum(binary, axis=0)

    # Find valleys in projection (gaps between digits)
    # Use a very sensitive threshold to catch even small gaps
    max_projection = np.max(horizontal_projection)
    threshold_proj = max_projection * 0.05  # Very low threshold to catch tiny gaps

    # Find segments where projection is below threshold (gaps)
    is_gap = horizontal_projection < threshold_proj

    # Find transitions from digit to gap and gap to digit
    transitions = np.diff(is_gap.astype(int))
    digit_starts = np.where(transitions == -1)[0] + 1
    digit_ends = np.where(transitions == 1)[0] + 1

    # Handle edge cases
    if len(horizontal_projection) > 0 and horizontal_projection[0] > threshold_proj:
        digit_starts = np.concatenate([[0], digit_starts])
    if len(horizontal_projection) > 0 and horizontal_projection[-1] > threshold_proj:
        digit_ends = np.concatenate([digit_ends, [len(horizontal_projection)]])

    # Create components from projection segments
    components = []

    if len(digit_starts) > 0 and len(digit_ends) > 0:
        # Match starts with ends
        for start, end in zip(digit_starts, digit_ends[:len(digit_starts)]):
            if end - start < 10:  # Too narrow
                continue

            # Find vertical bounds within this horizontal segment
            segment = binary[:, start:end]
            vertical_projection = np.sum(segment, axis=1)

            rows_with_content = np.where(vertical_projection > 0)[0]
            if len(rows_with_content) == 0:
                continue

            rmin = rows_with_content[0]
            rmax = rows_with_content[-1]

            if rmax - rmin < 10:  # Too short
                continue

            # Add padding
            width = end - start
            height = rmax - rmin
            padding = max(int(0.15 * max(width, height)), 10)

            rmin = max(0, rmin - padding)
            rmax = min(img_array.shape[0], rmax + padding)
            cmin = max(0, start - padding)
            cmax = min(img_array.shape[1], end + padding)

            components.append({
                'bbox': (rmin, rmax, cmin, cmax),
                'center_x': (cmin + cmax) / 2
            })

    # Fallback to connected components if projection fails
    if len(components) == 0:
        labeled, num_features = ndimage.label(binary)

        for i in range(1, num_features + 1):
            rows, cols = np.where(labeled == i)

            if len(rows) < 15:
                continue

            rmin, rmax = rows.min(), rows.max()
            cmin, cmax = cols.min(), cols.max()

            width = cmax - cmin
            height = rmax - rmin

            if width < 10 or height < 10:
                continue

            padding = max(int(0.15 * max(width, height)), 10)
            rmin = max(0, rmin - padding)
            rmax = min(img_array.shape[0], rmax + padding)
            cmin = max(0, cmin - padding)
            cmax = min(img_array.shape[1], cmax + padding)

            components.append({
                'bbox': (rmin, rmax, cmin, cmax),
                'center_x': (cmin + cmax) / 2
            })

    components.sort(key=lambda x: x['center_x'])
    return components
