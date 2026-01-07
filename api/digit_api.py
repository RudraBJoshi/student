from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import base64
from scipy import ndimage
from scipy.ndimage import rotate, shift
import cv2
import os

app = Flask(__name__)
CORS(app)

# Load ultimate model
MODEL_PATH = 'mnist_model_enhanced.keras'
print("Loading model...")
model = keras.models.load_model(MODEL_PATH)
print("Model loaded!")

# Try to load ensemble if available
ensemble_models = []
for i in range(5):
    if os.path.exists(f'ensemble_model_{i}.keras'):
        ensemble_models.append(keras.models.load_model(f'ensemble_model_{i}.keras'))

if ensemble_models:
    print(f"✓ Loaded {len(ensemble_models)} ensemble models")

def find_connected_components(img_array, threshold=250):
    """Find separate digits with intelligent merging"""
    binary = img_array < threshold
    labeled, num_features = ndimage.label(binary)
    
    raw_components = []
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
        
        raw_components.append({
            'bbox': (rmin, rmax, cmin, cmax),
            'center_x': (cmin + cmax) / 2,
            'center_y': (rmin + rmax) / 2,
            'width': width,
            'height': height
        })
    
    # Merge nearby components
    merged_components = []
    used = set()
    
    for i, comp1 in enumerate(raw_components):
        if i in used:
            continue
        
        current_bbox = comp1['bbox']
        merge_group = [i]
        
        changed = True
        while changed:
            changed = False
            for j, comp2 in enumerate(raw_components):
                if j in used or j in merge_group:
                    continue
                
                r1min, r1max, c1min, c1max = current_bbox
                r2min, r2max, c2min, c2max = comp2['bbox']
                
                horiz_dist = abs((c1min + c1max)/2 - (c2min + c2max)/2)
                vert_dist = abs((r1min + r1max)/2 - (r2min + r2max)/2)
                avg_width = ((c1max - c1min) + (c2max - c2min)) / 2
                avg_height = ((r1max - r1min) + (r2max - r2min)) / 2
                
                if horiz_dist < avg_width * 0.8 and vert_dist < avg_height * 0.8:
                    current_bbox = (
                        min(r1min, r2min),
                        max(r1max, r2max),
                        min(c1min, c2min),
                        max(c1max, c2max)
                    )
                    merge_group.append(j)
                    changed = True
        
        used.update(merge_group)
        
        rmin, rmax, cmin, cmax = current_bbox
        width = cmax - cmin
        height = rmax - rmin
        
        padding = max(int(0.15 * max(width, height)), 10)
        rmin = max(0, rmin - padding)
        rmax = min(img_array.shape[0], rmax + padding)
        cmin = max(0, cmin - padding)
        cmax = min(img_array.shape[1], cmax + padding)
        
        merged_components.append({
            'bbox': (rmin, rmax, cmin, cmax),
            'center_x': (cmin + cmax) / 2
        })
    
    merged_components.sort(key=lambda x: x['center_x'])
    return merged_components

def advanced_preprocess_digit(img_array, bbox):
    """Enhanced preprocessing"""
    rmin, rmax, cmin, cmax = bbox
    cropped = img_array[rmin:rmax, cmin:cmax]
    
    # Adaptive thresholding
    cropped = cv2.adaptiveThreshold(
        cropped, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    cropped = 255 - cropped
    
    # Find actual content
    coords = cv2.findNonZero(cropped)
    if coords is None:
        return np.zeros((28, 28))
    
    x, y, w, h = cv2.boundingRect(coords)
    cropped = cropped[y:y+h, x:x+w]
    
    height, width = cropped.shape
    
    # Resize maintaining aspect ratio
    if height > width:
        new_height = 20
        new_width = max(1, int(20 * width / height))
    else:
        new_width = 20
        new_height = max(1, int(20 * height / width))
    
    resized = cv2.resize(cropped, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    # Center in 28x28
    final = np.zeros((28, 28), dtype=np.uint8)
    y_offset = (28 - new_height) // 2
    x_offset = (28 - new_width) // 2
    final[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = resized
    
    # Smooth like MNIST
    final = cv2.GaussianBlur(final, (3, 3), 0.5)
    
    # Normalize
    final = final.astype(np.float32) / 255.0
    if final.max() > 0:
        final = (final - final.min()) / (final.max() - final.min())
    
    return final

def predict_with_tta(image, num_augmentations=8):
    """Test-Time Augmentation for robust predictions"""
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

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': True,
        'ensemble_models': len(ensemble_models),
        'tta_enabled': True
    })

def extract_layer_activations(image):
    """Extract intermediate layer activations for visualization"""
    # Prepare input
    input_data = image.reshape(1, 28, 28, 1)

    # Use a functional approach to extract activations
    layer_outputs = []
    layer_names = []

    # Get activations by running inference and accessing intermediate outputs
    from tensorflow.keras import Model

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
                    except:
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

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes)).convert('L')
        img_array = np.array(img)

        components = find_connected_components(img_array)

        if not components:
            return jsonify({
                'success': True,
                'digits': [],
                'number': '',
                'message': 'No digits found'
            })

        # Process all digits
        processed_digits = []
        for component in components:
            bbox = component['bbox']
            processed = advanced_preprocess_digit(img_array, bbox)
            processed_digits.append(processed)

        # Batch predict with TTA
        results = []
        recognized_digits = []

        for idx, (component, processed) in enumerate(zip(components, processed_digits)):
            bbox = component['bbox']

            # Predict with TTA
            predictions = predict_with_tta(processed, num_augmentations=8)

            top_3_idx = np.argsort(predictions)[-3:][::-1]
            predicted_digit = int(top_3_idx[0])
            confidence = float(predictions[predicted_digit])

            recognized_digits.append(str(predicted_digit))

            # Convert processed to base64
            processed_display = ((1 - processed) * 255).astype(np.uint8)
            processed_img = Image.fromarray(processed_display)
            buffered = io.BytesIO()
            processed_img.save(buffered, format="PNG")
            processed_base64 = base64.b64encode(buffered.getvalue()).decode()

            results.append({
                'digit': predicted_digit,
                'confidence': confidence,
                'top3': [
                    {
                        'digit': int(top_3_idx[i]),
                        'confidence': float(predictions[top_3_idx[i]])
                    }
                    for i in range(3)
                ],
                'bbox': {
                    'x': int(bbox[2]),
                    'y': int(bbox[0]),
                    'width': int(bbox[3] - bbox[2]),
                    'height': int(bbox[1] - bbox[0])
                },
                'processed_image': f'data:image/png;base64,{processed_base64}'
            })

        full_number = ''.join(recognized_digits)

        return jsonify({
            'success': True,
            'digits': results,
            'number': full_number,
            'count': len(results)
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize', methods=['POST'])
def visualize():
    """Get CNN layer activations for educational visualization"""
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes)).convert('L')
        img_array = np.array(img)

        # Get all digits
        components = find_connected_components(img_array)
        if not components:
            return jsonify({'error': 'Please draw a digit first'}), 400

        if len(components) > 1:
            return jsonify({'error': 'Please draw only ONE digit for visualization (detected multiple)'}), 400

        # Process the single digit
        bbox = components[0]['bbox']
        processed = advanced_preprocess_digit(img_array, bbox)

        # Get predictions
        predictions = model.predict(processed.reshape(1, 28, 28, 1), verbose=0)[0]
        predicted_digit = int(np.argmax(predictions))

        # Get layer activations
        layer_activations = extract_layer_activations(processed)

        # Input image
        input_display = ((1 - processed) * 255).astype(np.uint8)
        input_img = Image.fromarray(input_display)
        buffered = io.BytesIO()
        input_img.save(buffered, format="PNG")
        input_base64 = base64.b64encode(buffered.getvalue()).decode()

        return jsonify({
            'success': True,
            'input_image': f'data:image/png;base64,{input_base64}',
            'predicted_digit': predicted_digit,
            'confidence': float(predictions[predicted_digit]),
            'all_probabilities': predictions.tolist(),
            'layers': layer_activations
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)