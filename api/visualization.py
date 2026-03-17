import numpy as np
from PIL import Image
import io
import base64
from tensorflow.keras import Model


def extract_layer_activations(image, model) -> list:
    """Extract intermediate layer activations for visualization.

    Args:
        image: 28x28 float32 numpy array (the preprocessed digit).
        model: Primary Keras model.

    Returns:
        List of layer dicts suitable for JSON serialization.
        Each dict has keys: layer_name, type, shape, and either
        feature_maps (conv) or values (dense).
    """
    # Prepare input
    input_data = image.reshape(1, 28, 28, 1)

    layer_outputs = []
    layer_names = []

    # Build a list of layer outputs we want to visualize
    outputs_to_extract = []
    for layer in model.layers:
        if 'conv' in layer.name or 'dense' in layer.name or 'max_pooling' in layer.name:
            outputs_to_extract.append(layer.output)
            layer_names.append(layer.name)

    if outputs_to_extract:
        # Create a model that outputs all intermediate activations
        try:
            activation_model = Model(inputs=model.input, outputs=outputs_to_extract)
            activations = activation_model.predict(input_data, verbose=0)

            # If only one output, wrap it in a list
            if not isinstance(activations, list):
                activations = [activations]

            for activation in activations:
                layer_outputs.append(activation[0])  # Remove batch dimension

        except Exception as e:
            print(f"Error extracting activations: {e}")
            # Fallback: try layer by layer
            for layer in model.layers:
                if 'conv' in layer.name or 'dense' in layer.name or 'max_pooling' in layer.name:
                    try:
                        temp_model = Model(inputs=model.input, outputs=layer.output)
                        activation = temp_model.predict(input_data, verbose=0)[0]
                        layer_outputs.append(activation)
                    except Exception:
                        continue

    # Convert activations to base64 images
    visualizations = []
    for layer_name, activation in zip(layer_names, layer_outputs):
        if len(activation.shape) == 3:  # Conv layers (height, width, channels)
            # Take first 8 feature maps
            num_features = min(8, activation.shape[-1])
            feature_maps = []

            for i in range(num_features):
                feature_map = activation[:, :, i]
                # Normalize
                if feature_map.max() > feature_map.min():
                    feature_map = (feature_map - feature_map.min()) / (feature_map.max() - feature_map.min())
                feature_map = (feature_map * 255).astype(np.uint8)

                # Convert to base64
                img = Image.fromarray(feature_map)
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                img_base64 = base64.b64encode(buffered.getvalue()).decode()
                feature_maps.append(f'data:image/png;base64,{img_base64}')

            visualizations.append({
                'layer_name': layer_name,
                'type': 'conv',
                'shape': list(activation.shape),
                'feature_maps': feature_maps
            })
        elif len(activation.shape) == 1:  # Dense layers
            visualizations.append({
                'layer_name': layer_name,
                'type': 'dense',
                'shape': list(activation.shape),
                'values': activation.tolist()
            })

    return visualizations
