# SRP Analysis: Titanic Backend

## What is SRP?

The **Single Responsibility Principle** states that a class should have only one reason to change. If a class handles multiple concerns, a change to any one of them risks breaking the others — and the class becomes harder to test, reuse, and reason about.

---

## Original Violation

The original `TitanicModel` class held **four distinct responsibilities** in a single class:

```
TitanicModel (original)
├── Data loading       → sns.load_dataset('titanic')
├── Data cleaning      → _clean(): encoding, dropping columns, filling nulls
├── Model training     → _train(): fits LogisticRegression + DecisionTree
├── Inference          → predict(): encodes input, runs model
├── Feature importance → feature_weights(): reads decision tree importances
└── Singleton mgmt     → get_instance(): lazy initialization
```

### Why each responsibility is a separate reason to change

| Responsibility | What would force a change |
|---|---|
| Data loading | Switching from seaborn to a CSV or database |
| Data cleaning | Adding a new feature, changing encoding strategy |
| Model training | Swapping algorithms, adding cross-validation, tuning hyperparameters |
| Inference | Changing output format, adding confidence thresholds |
| Feature importance | Using SHAP values instead of tree importances |

Every one of these is an independent axis of change. A change to any one of them required opening the same `TitanicModel` class, risking unintended side effects on the others.

### Concrete example of the problem

Say you want to switch from seaborn to loading a CSV file. In the original code, you edit `TitanicModel.__init__` and `_clean()`. But those methods also touch the encoder initialization and feature list — both of which are used by `predict()`. A data-layer change now touches inference logic. That is a direct SRP violation.

---

## Refactored Design

The refactor splits `TitanicModel` into three classes, each with exactly one reason to change:

### `TitanicDataProcessor` — [model/titanic_data.py](model/titanic_data.py)

**Responsibility:** Know everything about the data — how to load it, clean it, and encode it for inference.

```python
processor = TitanicDataProcessor()
raw   = processor.load()                       # load raw dataset
clean = processor.clean(raw)                   # clean + encode for training
row   = processor.encode_passenger(passenger)  # encode for inference
```

- Owns the `OneHotEncoder` (fits it during `clean()`, reuses it in `encode_passenger()`)
- Owns the feature list — it knows which columns exist after encoding
- **One reason to change:** the data source or preprocessing logic changes

---

### `TitanicTrainer` — [model/titanic_trainer.py](model/titanic_trainer.py)

**Responsibility:** Given features and labels, train and return the models.

```python
trainer = TitanicTrainer()
lr, dt = trainer.train(X, y)
```

- Takes a feature matrix and target series
- Returns trained `LogisticRegression` and `DecisionTreeClassifier`
- Has no knowledge of data loading, encoding, or serving
- **One reason to change:** the training algorithm or procedure changes

---

### `TitanicModel` — [model/titanic.py](model/titanic.py)

**Responsibility:** Manage the singleton lifecycle and serve predictions.

```python
model = TitanicModel.get_instance()
model.predict(passenger)      # → {'die': 0.21, 'survive': 0.79}
model.feature_weights()       # → {'sex': 0.30, 'age': 0.26, ...}
```

- Delegates data work to `TitanicDataProcessor`
- Delegates training to `TitanicTrainer`
- Holds the trained models only to serve requests
- **One reason to change:** the prediction interface or singleton behavior changes

---

## Before vs. After

```
BEFORE                          AFTER
──────────────────────          ──────────────────────────────────────────
TitanicModel                    TitanicDataProcessor
  __init__ (load)    ──────────►  load()
  _clean()                        clean()
                                  encode_passenger()

  _train()           ──────────►  TitanicTrainer
                                    train(X, y)

  predict()          ──────────►  TitanicModel
  feature_weights()                 predict()
  get_instance()                    feature_weights()
                                    get_instance()
```

The public API (`get_instance`, `predict`, `feature_weights`) is unchanged — `api/titanic_api.py` and `main.py` required no modifications.

---

## Benefits of the Refactor

- **Isolated changes** — swapping seaborn for a CSV only touches `TitanicDataProcessor`
- **Easier testing** — each class can be unit-tested independently with mock inputs
- **Clearer ownership** — the class name tells you exactly what it does
- **Reduced risk** — a bug introduced in training logic cannot accidentally break the encoder
