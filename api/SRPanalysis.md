# SRP Analysis: digit_api.py

## What is SRP?

The **Single Responsibility Principle** states that a class or module should have only one reason to change. When a single file owns multiple concerns, a change to any one of them risks breaking the others.

---

## Original Violations

`digit_api.py` is a single flat module handling **five distinct responsibilities**:

```
digit_api.py (original)
├── Model management     → loads primary + ensemble models as global state at startup
├── Image segmentation   → find_connected_components(): projection-based digit isolation
├── Image preprocessing  → advanced_preprocess_digit(): rotation, thinning, resize, normalize
├── Inference            → predict_with_tta(): TTA loop + ensemble averaging
├── Visualization        → extract_layer_activations(): builds sub-models, encodes base64 images
└── HTTP routing         → /api/health, /api/predict, /api/visualize route handlers
```

### Why each is a separate reason to change

| Responsibility | What would force a change |
|---|---|
| Model management | Switching model format, adding versioning, lazy loading |
| Image segmentation | Tuning gap detection thresholds, trying a different algorithm |
| Image preprocessing | Changing rotation logic, adjusting MNIST normalization |
| Inference / TTA | Swapping augmentation strategy, disabling ensemble |
| Visualization | Changing output format, adding new layer types |
| HTTP routing | Changing API contract, adding authentication, new endpoints |

Every one of these is an independent axis of change, yet a change to any requires opening the same file.

### Code examples of each violation

**1. Model management baked into module startup**

Model loading runs as top-level module code, making it impossible to import the file without triggering I/O and coupling the load strategy to every other concern:

```python
# digit_api.py — runs on import, not in a dedicated loader
app = Flask(__name__)
CORS(app)

MODEL_PATH = 'best_model.keras'
model = keras.models.load_model(MODEL_PATH)   # side-effect on import

ensemble_models = []
for i in range(5):
    if os.path.exists(f'ensemble_model_{i}.keras'):
        ensemble_models.append(keras.models.load_model(f'ensemble_model_{i}.keras'))
```

**2. Inference function reaches into global state**

`predict_with_tta` silently depends on the module-level `model` and `ensemble_models` globals instead of receiving them as arguments. Swapping the model requires editing the inference logic:

```python
def predict_with_tta(image, num_augmentations=8):
    predictions = []
    predictions.append(model.predict(...))        # global — not injected

    if ensemble_models:                           # global — not injected
        for ens_model in ensemble_models:
            predictions.append(ens_model.predict(...))
```

**3. Route handler doing segmentation, preprocessing, inference, encoding, and response building**

The `/api/predict` handler owns at least five concerns in one function:

```python
@app.route('/api/predict', methods=['POST'])
def predict():
    # 1. HTTP parsing
    data = request.get_json()
    image_data = data['image'].split(',')[1]
    img_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(img_bytes)).convert('L')
    img_array = np.array(img)

    # 2. Segmentation
    components = find_connected_components(img_array)

    # 3. Preprocessing
    processed = advanced_preprocess_digit(img_array, bbox)

    # 4. Inference
    predictions = predict_with_tta(processed, num_augmentations=8)

    # 5. Image encoding for response
    processed_display = ((1 - processed) * 255).astype(np.uint8)
    processed_img = Image.fromarray(processed_display)
    buffered = io.BytesIO()
    processed_img.save(buffered, format="PNG")
    processed_base64 = base64.b64encode(buffered.getvalue()).decode()

    # 6. Response construction
    return jsonify({ 'digits': results, 'number': full_number, ... })
```

Any change to segmentation thresholds, preprocessing steps, TTA count, image encoding format, or response schema requires editing this single function.

**4. Layer activation extraction and base64 encoding combined**

`extract_layer_activations` both builds Keras sub-models to extract activations *and* converts them to base64-encoded PNG strings — two unrelated concerns in one function:

```python
def extract_layer_activations(image):
    # Concern 1: build a sub-model and run inference
    activation_model = Model(inputs=model.input, outputs=outputs_to_extract)
    activations = activation_model.predict(input_data, verbose=0)

    # Concern 2: encode results as base64 images for HTTP transport
    img = Image.fromarray(feature_map)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()
    feature_maps.append(f'data:image/png;base64,{img_base64}')
```

Switching from PNG to WebP, or from base64 to binary streaming, requires editing the activation extraction logic.

### Summary

The `/api/predict` route handler directly calls `find_connected_components`, `advanced_preprocess_digit`, and `predict_with_tta` — and also constructs the JSON response and encodes images to base64. A change to the segmentation threshold, the preprocessing pipeline, the TTA count, *and* the response schema all touch the same function.

`predict_with_tta` references the global `model` and `ensemble_models` variables directly. Swapping the model format requires editing the inference function, not just the loading logic.

---

## Before vs. After

```
BEFORE                              AFTER
──────────────────────────          ─────────────────────────────────────
digit_api.py                        model_loader.py
  global model loading  ─────────►    load_primary()
  global ensemble                      load_ensemble()

  find_connected_        ─────────►  segmentation.py
  components()                         find_connected_components()

  advanced_preprocess_   ─────────►  preprocessing.py
  digit()                              preprocess_digit()

  predict_with_tta()     ─────────►  inference.py
                                       predict_with_tta()

  extract_layer_         ─────────►  visualization.py
  activations()                        extract_layer_activations()

  /health, /predict,     ─────────►  digit_api.py (routes only)
  /visualize routes                    thin HTTP handlers
```

---

## Benefits of the Refactor

- **Isolated changes** — tuning the segmentation threshold only touches `segmentation.py`
- **Easier testing** — each module can be unit-tested with mock inputs, no Flask context needed
- **Reusability** — `preprocessing.py` and `inference.py` can be reused in a batch script or CLI tool without importing Flask
- **Clearer ownership** — the filename tells you exactly what the module does
- **Reduced risk** — a bug in TTA logic cannot accidentally break the image decoder or route handler

---

## Migration — What Was Changed

The refactor produced five new files and a slimmed-down `digit_api.py`. All logic is identical — only the organization changed.

### `model_loader.py` — was: global side-effects on import

**Before** (runs on every import of `digit_api.py`):
```python
model = keras.models.load_model(MODEL_PATH)   # side-effect on import

ensemble_models = []
for i in range(5):
    if os.path.exists(f'ensemble_model_{i}.keras'):
        ensemble_models.append(keras.models.load_model(f'ensemble_model_{i}.keras'))
```

**After** (explicit functions, called once at startup):
```python
# model_loader.py
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
```

**Why this enforces SRP:** loading strategy is now isolated. Switching to lazy loading or a model registry only touches this file.

---

### `inference.py` — was: closed over globals

**Before** (`model` and `ensemble_models` captured from module scope):
```python
def predict_with_tta(image, num_augmentations=8):
    predictions.append(model.predict(...))       # implicit global

    if ensemble_models:                          # implicit global
        for ens_model in ensemble_models:
            predictions.append(ens_model.predict(...))
```

**After** (model and ensemble passed as explicit arguments):
```python
# inference.py
def predict_with_tta(image, model, ensemble_models, num_augmentations: int = 8) -> np.ndarray:
    predictions.append(model.predict(image.reshape(1, 28, 28, 1), verbose=0)[0])

    if ensemble_models:
        for ens_model in ensemble_models:
            predictions.append(ens_model.predict(image.reshape(1, 28, 28, 1), verbose=0)[0])

    return np.mean(predictions, axis=0)
```

**Why this enforces SRP:** the function no longer depends on where models come from. It can be tested by passing any mock model object.

---

### `visualization.py` — was: embedded in `digit_api.py`

**Before** (defined in the same file as Flask routes, with implicit `model` global):
```python
def extract_layer_activations(image):
    activation_model = Model(inputs=model.input, ...)  # implicit global
    ...
```

**After** (standalone module, model injected):
```python
# visualization.py
def extract_layer_activations(image, model) -> list:
    input_data = image.reshape(1, 28, 28, 1)
    activation_model = Model(inputs=model.input, outputs=outputs_to_extract)
    activations = activation_model.predict(input_data, verbose=0)
    ...
    return visualizations
```

**Why this enforces SRP:** visualization logic is fully decoupled from Flask. The function can be called from a notebook or CLI with no HTTP context.

---

### `digit_api.py` — was: everything; now: routes only

**Before** — business logic inline in the route:
```python
@app.route('/api/predict', methods=['POST'])
def predict():
    # HTTP parsing + segmentation + preprocessing + inference + encoding all here
    components = find_connected_components(img_array)
    processed = advanced_preprocess_digit(img_array, bbox)
    predictions = predict_with_tta(processed, num_augmentations=8)
    ...
```

**After** — route only delegates:
```python
# digit_api.py
from model_loader import load_primary, load_ensemble
from segmentation import find_connected_components
from preprocessing import preprocess_digit
from inference import predict_with_tta
from visualization import extract_layer_activations

model = load_primary(MODEL_PATH)
ensemble_models = load_ensemble(count=5)

@app.route('/api/predict', methods=['POST'])
def predict():
    # Only HTTP concerns live here
    img_array = np.array(Image.open(io.BytesIO(base64.b64decode(image_data))).convert('L'))
    components = find_connected_components(img_array)
    processed_digits = [preprocess_digit(img_array, c['bbox']) for c in components]

    for component, processed in zip(components, processed_digits):
        predictions = predict_with_tta(processed, model, ensemble_models, num_augmentations=8)
        ...

    return jsonify({'success': True, 'digits': results, 'number': full_number, 'count': len(results)})
```

**Why this enforces SRP:** the route handler has exactly one reason to change — the HTTP API contract. All business logic changes happen in their own files.
