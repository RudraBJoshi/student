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

## Proposed Refactor

Split into focused modules, each with one reason to change:

### `model_loader.py`
**Responsibility:** Load and expose the primary model and ensemble.
- `load_primary(path)` → returns Keras model
- `load_ensemble(pattern)` → returns list of Keras models
- **One reason to change:** model format or loading strategy changes

### `segmentation.py`
**Responsibility:** Find digit bounding boxes in an image.
- `find_connected_components(img_array)` → list of `{bbox, center_x}`
- **One reason to change:** segmentation algorithm or tuning changes

### `preprocessing.py`
**Responsibility:** Prepare a cropped digit region for model input.
- `preprocess_digit(img_array, bbox)` → 28×28 float32 numpy array
- **One reason to change:** preprocessing pipeline or MNIST alignment changes

### `inference.py`
**Responsibility:** Run predictions given a preprocessed image.
- `predict_with_tta(image, model, ensemble, num_augmentations)` → probability array
- **One reason to change:** augmentation strategy or ensemble logic changes

### `visualization.py`
**Responsibility:** Extract and encode layer activations for display.
- `extract_layer_activations(image, model)` → list of layer dicts with base64 images
- **One reason to change:** visualization format or layer selection changes

### `digit_api.py` (routes only)
**Responsibility:** Parse HTTP requests and delegate to the above modules.
- `/api/health`, `/api/predict`, `/api/visualize`
- No business logic — only request parsing, delegation, and response formatting
- **One reason to change:** API contract or HTTP handling changes

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
