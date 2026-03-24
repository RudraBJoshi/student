#!/usr/bin/env python3
"""
Optimized MNIST Digit Recognizer Training Script
Produces best accuracy/time ratio model
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, mixed_precision
import numpy as np
from datetime import datetime
import time
import os
import json

# Enable mixed precision for faster training
policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_global_policy(policy)

# Configuration
CONFIG = {
    'model_path': 'mnist_model_enhanced.keras',
    'batch_size': 256,
    'epochs': 15,
    'initial_lr': 0.001,
    'validation_split': 5000,
}

def print_header(text, char="="):
    """Pretty print section headers"""
    width = 70
    print("\n" + char*width)
    print(f"  {text}")
    print(char*width)

def create_enhanced_model():
    """
    Optimized CNN architecture with BatchNormalization
    ~300K parameters for best accuracy/efficiency ratio
    """
    model = keras.Sequential([
        # Input
        layers.Input(shape=(28, 28, 1)),
        
        # Block 1: Initial feature detection
        layers.Conv2D(32, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Conv2D(32, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Block 2: Mid-level features
        layers.Conv2D(64, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Conv2D(64, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Block 3: High-level features
        layers.Conv2D(128, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Conv2D(128, (3, 3), padding='same', use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Dropout(0.3),
        
        # Classification head
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Dropout(0.5),
        layers.Dense(128, use_bias=False),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Dropout(0.4),
        
        # Output (float32 for mixed precision)
        layers.Dense(10, activation='softmax', dtype='float32')
    ], name='DigitRecognizer')
    
    return model

def get_augmentation_layer():
    """Smart data augmentation for MNIST"""
    return keras.Sequential([
        layers.RandomRotation(0.12),
        layers.RandomTranslation(0.12, 0.12),
        layers.RandomZoom(0.12),
    ], name='augmentation')

def prepare_dataset(x, y, batch_size, augmentation=None, is_training=True):
    """
    Create optimized tf.data pipeline
    Uses prefetching and caching for maximum speed
    """
    dataset = tf.data.Dataset.from_tensor_slices((x, y))
    
    if is_training:
        dataset = dataset.shuffle(buffer_size=10000, reshuffle_each_iteration=True)
    
    dataset = dataset.batch(batch_size)
    
    # Apply augmentation if provided
    if augmentation and is_training:
        dataset = dataset.map(
            lambda x, y: (augmentation(x, training=True), y),
            num_parallel_calls=tf.data.AUTOTUNE
        )
    
    # Cache and prefetch
    dataset = dataset.cache()
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset

class TrainingProgressCallback(keras.callbacks.Callback):
    """Enhanced progress display with time estimation"""
    
    def on_train_begin(self, logs=None):
        self.start_time = time.time()
        self.epoch_times = []
        self.best_val_acc = 0
        print_header("🚀 Training Started", "-")
    
    def on_epoch_begin(self, epoch, logs=None):
        self.epoch_start = time.time()
    
    def on_epoch_end(self, epoch, logs=None):
        epoch_time = time.time() - self.epoch_start
        self.epoch_times.append(epoch_time)
        
        # Calculate ETA
        avg_time = np.mean(self.epoch_times)
        remaining = (self.params['epochs'] - epoch - 1) * avg_time
        
        # Progress bar
        progress = (epoch + 1) / self.params['epochs']
        bar_length = 40
        filled = int(bar_length * progress)
        bar = '█' * filled + '░' * (bar_length - filled)
        
        # Track best
        val_acc = logs['val_accuracy']
        if val_acc > self.best_val_acc:
            self.best_val_acc = val_acc
            improvement = "⬆️ NEW BEST"
        else:
            improvement = ""
        
        print(f"\n📊 Epoch {epoch + 1}/{self.params['epochs']} [{bar}] {progress*100:.0f}%")
        print(f"├─ Loss: {logs['loss']:.4f} │ Acc: {logs['accuracy']:.4f}")
        print(f"├─ Val Loss: {logs['val_loss']:.4f} │ Val Acc: {logs['val_accuracy']:.4f} {improvement}")
        print(f"├─ Time: {epoch_time:.1f}s │ ETA: {remaining:.0f}s ({remaining/60:.1f}m)")
        print(f"└─ LR: {float(self.model.optimizer.learning_rate):.6f}")
    
    def on_train_end(self, logs=None):
        total_time = time.time() - self.start_time
        print_header(f"✅ Training Complete - {total_time/60:.1f}m", "-")
        print(f"Best validation accuracy: {self.best_val_acc*100:.2f}%")

def get_callbacks(model_path):
    """Smart callbacks for optimal training"""
    return [
        # Early stopping
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        ),
        
        # Learning rate reduction
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            verbose=1,
            min_lr=1e-7,
            cooldown=1
        ),
        
        # Model checkpoint
        keras.callbacks.ModelCheckpoint(
            model_path,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
            mode='max'
        ),
        
        # Progress display
        TrainingProgressCallback()
    ]

def analyze_model_performance(model, x_test, y_test):
    """Detailed performance analysis"""
    print_header("📊 Performance Analysis")
    
    # Get predictions
    predictions = model.predict(x_test, verbose=0)
    predicted_labels = np.argmax(predictions, axis=1)
    confidences = np.max(predictions, axis=1)
    
    # Overall stats
    correct = predicted_labels == y_test
    accuracy = np.mean(correct) * 100
    
    print(f"\n🎯 Overall Performance:")
    print(f"├─ Accuracy: {accuracy:.2f}%")
    print(f"├─ Correct: {np.sum(correct):,}/{len(y_test):,}")
    print(f"├─ Wrong: {np.sum(~correct):,}/{len(y_test):,}")
    print(f"└─ Avg Confidence: {np.mean(confidences)*100:.2f}%")
    
    # Per-digit accuracy
    print(f"\n📊 Per-Digit Accuracy:")
    digit_stats = []
    for digit in range(10):
        mask = y_test == digit
        digit_acc = np.mean(predicted_labels[mask] == digit) * 100
        digit_conf = np.mean(confidences[mask]) * 100
        digit_stats.append({
            'digit': digit,
            'accuracy': digit_acc,
            'confidence': digit_conf,
            'count': np.sum(mask)
        })
        
        bar = '█' * int(digit_acc / 2.5)  # Scale to ~40 chars
        print(f"  {digit}: {bar} {digit_acc:.2f}% (conf: {digit_conf:.1f}%)")
    
    # Worst performing digits
    worst_digits = sorted(digit_stats, key=lambda x: x['accuracy'])[:3]
    print(f"\n⚠️  Digits Needing Attention:")
    for d in worst_digits:
        print(f"  {d['digit']}: {d['accuracy']:.2f}% accuracy")
    
    # Confidence analysis
    print(f"\n🎲 Confidence Distribution:")
    low_conf = np.sum(confidences < 0.9)
    med_conf = np.sum((confidences >= 0.9) & (confidences < 0.99))
    high_conf = np.sum(confidences >= 0.99)
    
    print(f"  Low (<90%):  {low_conf:,} ({low_conf/len(y_test)*100:.1f}%)")
    print(f"  Med (90-99%): {med_conf:,} ({med_conf/len(y_test)*100:.1f}%)")
    print(f"  High (>99%):  {high_conf:,} ({high_conf/len(y_test)*100:.1f}%)")
    
    # Error analysis
    if np.sum(~correct) > 0:
        print(f"\n❌ Error Analysis:")
        wrong_conf = np.mean(confidences[~correct]) * 100
        print(f"  Avg confidence on errors: {wrong_conf:.1f}%")
        
        # Most common misclassifications
        errors = np.where(~correct)[0]
        if len(errors) > 0:
            print(f"  Most common misclassifications:")
            from collections import Counter
            error_pairs = [(y_test[i], predicted_labels[i]) for i in errors[:100]]
            common = Counter(error_pairs).most_common(5)
            for (true, pred), count in common:
                print(f"    {true} → {pred}: {count} times")
    
    return digit_stats

def save_training_info(model, history, test_results, training_time):
    """Save comprehensive training information"""
    info = {
        'timestamp': datetime.now().isoformat(),
        'training_time_seconds': float(training_time),
        'training_time_minutes': float(training_time / 60),
        'config': CONFIG,
        'architecture': {
            'total_parameters': int(model.count_params()),
            'trainable_parameters': int(sum([tf.size(w).numpy() for w in model.trainable_weights])),
        },
        'final_metrics': {
            'test_accuracy': float(test_results['accuracy']),
            'test_loss': float(test_results['loss']),
        },
        'history': {
            'train_accuracy': [float(x) for x in history.history['accuracy']],
            'val_accuracy': [float(x) for x in history.history['val_accuracy']],
            'train_loss': [float(x) for x in history.history['loss']],
            'val_loss': [float(x) for x in history.history['val_loss']],
        }
    }
    
    with open('training_info.json', 'w') as f:
        json.dump(info, f, indent=2)
    
    print(f"\n💾 Training info saved: training_info.json")

def main():
    """Main training function"""
    
    print_header("🤖 MNIST DIGIT RECOGNIZER TRAINING")
    print(f"Version: Enhanced CNN with BatchNorm")
    print(f"Mixed Precision: Enabled")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Set random seeds
    np.random.seed(42)
    tf.random.set_seed(42)
    
    # ============================================
    # 1. LOAD DATA
    # ============================================
    print_header("📂 Loading MNIST Dataset")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    print(f"✓ Training samples: {len(x_train):,}")
    print(f"✓ Test samples: {len(x_test):,}")
    
    # Normalize
    x_train = x_train.astype(np.float32) / 255.0
    x_test = x_test.astype(np.float32) / 255.0
    
    # Reshape for CNN
    x_train = x_train.reshape(-1, 28, 28, 1)
    x_test = x_test.reshape(-1, 28, 28, 1)
    
    # Split validation set
    val_size = CONFIG['validation_split']
    x_val = x_train[-val_size:]
    y_val = y_train[-val_size:]
    x_train = x_train[:-val_size]
    y_train = y_train[:-val_size]
    
    print(f"✓ Validation samples: {len(x_val):,}")
    
    # ============================================
    # 2. PREPARE DATASETS
    # ============================================
    print_header("⚙️  Preparing Data Pipelines")
    
    augmentation = get_augmentation_layer()
    batch_size = CONFIG['batch_size']
    
    train_dataset = prepare_dataset(x_train, y_train, batch_size, augmentation, True)
    val_dataset = prepare_dataset(x_val, y_val, batch_size, None, False)
    test_dataset = prepare_dataset(x_test, y_test, batch_size, None, False)
    
    print(f"✓ Batch size: {batch_size}")
    print(f"✓ Augmentation: Enabled (rotation, translation, zoom)")
    print(f"✓ Steps per epoch: {len(x_train) // batch_size}")
    
    # ============================================
    # 3. BUILD MODEL
    # ============================================
    print_header("🏗️  Building Model")
    
    model = create_enhanced_model()
    
    total_params = model.count_params()
    trainable_params = sum([tf.size(w).numpy() for w in model.trainable_weights])
    
    print(f"✓ Total parameters: {total_params:,}")
    print(f"✓ Trainable parameters: {trainable_params:,}")
    print(f"✓ Model size: ~{total_params * 4 / 1024 / 1024:.1f} MB")
    
    # Print architecture
    print("\n" + "─"*70)
    model.summary(line_length=70)
    print("─"*70)
    
    # ============================================
    # 4. COMPILE MODEL
    # ============================================
    print_header("🔧 Compiling Model")
    
    optimizer = keras.optimizers.Adam(
        learning_rate=CONFIG['initial_lr'],
        beta_1=0.9,
        beta_2=0.999,
        epsilon=1e-7
    )
    
    model.compile(
        optimizer=optimizer,
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"✓ Optimizer: Adam (lr={CONFIG['initial_lr']})")
    print(f"✓ Loss: Sparse Categorical Crossentropy")
    print(f"✓ Metrics: Accuracy")
    
    # ============================================
    # 5. TRAIN MODEL
    # ============================================
    print_header("🎯 Training Model")
    print(f"Target: 99%+ test accuracy")
    print(f"Epochs: {CONFIG['epochs']}")
    
    training_start = time.time()
    
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=CONFIG['epochs'],
        callbacks=get_callbacks(CONFIG['model_path']),
        verbose=0  # Use custom callback
    )
    
    training_time = time.time() - training_start
    
    # ============================================
    # 6. EVALUATE MODEL
    # ============================================
    print_header("🎯 Final Evaluation")
    
    # Load best model
    print("Loading best model from checkpoint...")
    model = keras.models.load_model(CONFIG['model_path'])
    
    # Evaluate on test set
    print("Evaluating on test set...")
    test_loss, test_accuracy = model.evaluate(test_dataset, verbose=0)
    
    test_results = {
        'accuracy': test_accuracy,
        'loss': test_loss
    }
    
    print(f"\n🎯 Test Results:")
    print(f"├─ Accuracy: {test_accuracy*100:.2f}%")
    print(f"├─ Loss: {test_loss:.4f}")
    print(f"├─ Training time: {training_time/60:.1f}m")
    print(f"└─ Time per epoch: {training_time/len(history.history['loss']):.1f}s")
    
    # Detailed analysis
    analyze_model_performance(model, x_test, y_test)
    
    # ============================================
    # 7. SAVE TRAINING INFO
    # ============================================
    save_training_info(model, history, test_results, training_time)
    
    # ============================================
    # 8. FINAL SUMMARY
    # ============================================
    print_header("✅ TRAINING COMPLETE")
    
    print(f"\n📁 Model saved: {CONFIG['model_path']}")
    print(f"📊 Final accuracy: {test_accuracy*100:.2f}%")
    print(f"⏱️  Total time: {training_time/60:.1f} minutes")
    
    if test_accuracy >= 0.99:
        print("\n🏆 EXCELLENT! Achieved 99%+ accuracy!")
        print("   This model is production-ready!")
    elif test_accuracy >= 0.985:
        print("\n✨ GREAT! Achieved 98.5%+ accuracy!")
        print("   This model performs very well!")
    else:
        print("\n💡 Good progress! For higher accuracy:")
        print("   - Increase epochs to 20-25")
        print("   - Try ensemble of 3-5 models")
        print("   - Add more aggressive augmentation")
    
    print("\n" + "="*70)
    print("Ready to use in your application!")
    print("="*70 + "\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()