from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import base64

from model_loader import load_primary, load_ensemble
from segmentation import find_connected_components
from preprocessing import preprocess_digit
from inference import predict_with_tta
from visualization import extract_layer_activations

app = Flask(__name__)
CORS(app)

# Load models at startup
MODEL_PATH = 'best_model.keras'
print("Loading model...")
model = load_primary(MODEL_PATH)
print("Model loaded!")

ensemble_models = load_ensemble(count=5)
if ensemble_models:
    print(f"Loaded {len(ensemble_models)} ensemble models")


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': True,
        'ensemble_models': len(ensemble_models),
        'tta_enabled': True
    })


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
        processed_digits = [preprocess_digit(img_array, c['bbox']) for c in components]

        results = []
        recognized_digits = []

        for component, processed in zip(components, processed_digits):
            bbox = component['bbox']

            predictions = predict_with_tta(processed, model, ensemble_models, num_augmentations=8)

            top_3_idx = np.argsort(predictions)[-3:][::-1]
            predicted_digit = int(top_3_idx[0])
            confidence = float(predictions[predicted_digit])

            recognized_digits.append(str(predicted_digit))

            # Convert processed to base64 for display
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
    """Get CNN layer activations for educational visualization."""
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
            return jsonify({'error': 'Please draw a digit first'}), 400

        if len(components) > 1:
            return jsonify({'error': 'Please draw only ONE digit for visualization (detected multiple)'}), 400

        bbox = components[0]['bbox']
        processed = preprocess_digit(img_array, bbox)

        predictions = model.predict(processed.reshape(1, 28, 28, 1), verbose=0)[0]
        predicted_digit = int(np.argmax(predictions))

        layer_activations = extract_layer_activations(processed, model)

        # Input image for display
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
