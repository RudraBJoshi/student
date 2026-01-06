import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from PIL import Image, ImageDraw, ImageTk
import tkinter as tk
from tkinter import ttk
import os
from scipy import ndimage
import json
from datetime import datetime
from tkinter import messagebox

MODEL_PATH = 'mnist_model_enhanced.keras'
CORRECTIONS_PATH = 'user_corrections.json'

def create_augmented_training():
    """Load data with augmentation for better generalization"""
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    x_train, x_test = x_train / 255.0, x_test / 255.0
    
    # Data augmentation
    data_augmentation = keras.Sequential([
        layers.RandomRotation(0.1),  # Rotate up to 10 degrees
        layers.RandomTranslation(0.1, 0.1),  # Shift up to 10%
        layers.RandomZoom(0.1),  # Zoom in/out up to 10%
    ])
    
    return (x_train, y_train), (x_test, y_test), data_augmentation

def create_enhanced_model():
    """Create a deeper, more robust model"""
    model = keras.Sequential([
        # Input reshaping
        layers.Reshape((28, 28, 1), input_shape=(28, 28)),
        
        # Convolutional layers (better for spatial patterns)
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.Dropout(0.25),
        
        # Dense layers
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(10, activation='softmax')
    ])
    
    return model

# Load or train enhanced model
if os.path.exists(MODEL_PATH):
    print("Loading enhanced model...")
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded!")
else:
    print("Training enhanced model with data augmentation...")
    print("This will take longer but produce better results!")
    
    (x_train, y_train), (x_test, y_test), data_augmentation = create_augmented_training()
    
    model = create_enhanced_model()
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train with augmentation
    print("\nTraining enhanced CNN model...")
    history = model.fit(
        x_train.reshape(-1, 28, 28, 1),
        y_train,
        epochs=10,  # More epochs for better learning
        batch_size=128,
        validation_split=0.1,
        verbose=1
    )
    
    # Evaluate
    test_loss, test_acc = model.evaluate(x_test.reshape(-1, 28, 28, 1), y_test, verbose=0)
    print(f"\nTest accuracy: {test_acc:.4f}")
    
    model.save(MODEL_PATH)
    print(f"Enhanced model saved to {MODEL_PATH}")

def load_corrections():
    """Load user corrections from file"""
    if os.path.exists(CORRECTIONS_PATH):
        with open(CORRECTIONS_PATH, 'r') as f:
            return json.load(f)
    return []

def save_correction(digit_image, predicted, actual):
    """Save a correction for future fine-tuning"""
    corrections = load_corrections()
    
    correction = {
        'timestamp': datetime.now().isoformat(),
        'predicted': int(predicted),
        'actual': int(actual),
        'image': digit_image.flatten().tolist()
    }
    
    corrections.append(correction)
    
    with open(CORRECTIONS_PATH, 'w') as f:
        json.dump(corrections, f)
    
    print(f"Correction saved: {predicted} → {actual}")

def find_connected_components(img_array, threshold=250):
    """Find separate digits in the image using connected components"""
    binary = img_array < threshold
    labeled, num_features = ndimage.label(binary)
    
    components = []
    for i in range(1, num_features + 1):
        rows, cols = np.where(labeled == i)
        
        if len(rows) < 20:
            continue
        
        rmin, rmax = rows.min(), rows.max()
        cmin, cmax = cols.min(), cols.max()
        
        width = cmax - cmin
        height = rmax - rmin
        if width < 15 or height < 15:
            continue
        
        padding = max(int(0.15 * max(width, height)), 10)
        rmin = max(0, rmin - padding)
        rmax = min(img_array.shape[0], rmax + padding)
        cmin = max(0, cmin - padding)
        cmax = min(img_array.shape[1], cmax + padding)
        
        components.append({
            'bbox': (rmin, rmax, cmin, cmax),
            'center_x': (cmin + cmax) // 2,
            'width': width,
            'height': height
        })
    
    components.sort(key=lambda x: x['center_x'])
    return components

def preprocess_digit(img_array, bbox):
    """Preprocess a single digit to MNIST format"""
    rmin, rmax, cmin, cmax = bbox
    cropped = img_array[rmin:rmax, cmin:cmax]
    
    height, width = cropped.shape
    max_dim = int(max(height, width) * 1.1)
    square = np.full((max_dim, max_dim), 255, dtype=np.uint8)
    
    y_offset = (max_dim - height) // 2
    x_offset = (max_dim - width) // 2
    square[y_offset:y_offset+height, x_offset:x_offset+width] = cropped
    
    img_square = Image.fromarray(square)
    img_resized = img_square.resize((20, 20), Image.LANCZOS)
    resized_array = np.array(img_resized)
    
    final = np.full((28, 28), 255, dtype=np.uint8)
    final[4:24, 4:24] = resized_array
    
    final = 255 - final
    final = final / 255.0
    
    return final

class EnhancedDigitRecognizerApp:
    def __init__(self, root, model):
        self.root = root
        self.model = model
        self.root.title("Enhanced Multi-Digit Recognizer")
        
        self.canvas_size = 500
        self.brush_size = 12
        self.confidence_threshold = 0.6  # Flag predictions below 60%
        
        # Main container
        main_container = ttk.Frame(root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left frame
        left_frame = ttk.Frame(main_container)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        
        # Right frame
        right_frame = ttk.Frame(main_container)
        right_frame.grid(row=0, column=1, sticky="nsew")
        
        main_container.grid_columnconfigure(0, weight=1)
        main_container.grid_columnconfigure(1, weight=1)
        
        # Drawing canvas
        ttk.Label(left_frame, text="Draw multiple digits:", font=("Arial", 14, "bold")).pack()
        ttk.Label(left_frame, text="Space digits apart for best results", 
                 font=("Arial", 9), foreground='gray').pack()
        
        self.canvas = tk.Canvas(left_frame, width=self.canvas_size, height=self.canvas_size, 
                                bg='white', cursor='cross', relief=tk.SUNKEN, borderwidth=2)
        self.canvas.pack(pady=10)
        
        self.image = Image.new('RGB', (self.canvas_size, self.canvas_size), 'white')
        self.draw = ImageDraw.Draw(self.image)
        
        # Control buttons
        button_frame = ttk.Frame(left_frame)
        button_frame.pack(pady=5)
        
        ttk.Button(button_frame, text="Clear Canvas", command=self.clear_canvas).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="🔍 Recognize Digits", command=self.predict_all).pack(side=tk.LEFT, padx=5)
        
        # Brush size control
        brush_frame = ttk.Frame(left_frame)
        brush_frame.pack(pady=5)
        ttk.Label(brush_frame, text="Brush size:").pack(side=tk.LEFT, padx=5)
        self.brush_scale = ttk.Scale(brush_frame, from_=5, to=20, orient=tk.HORIZONTAL,
                             command=self.update_brush_size)
        self.brush_scale.pack(side=tk.LEFT, padx=5)
        self.brush_label = ttk.Label(brush_frame, text=f"{self.brush_size}")
        self.brush_label.pack(side=tk.LEFT)
        self.brush_scale.set(self.brush_size)  # ← MOVED HERE, AFTER label is created
        
        # Stats
        stats_frame = ttk.LabelFrame(left_frame, text="Statistics", padding=10)
        stats_frame.pack(pady=10, fill=tk.X)
        
        corrections = load_corrections()
        ttk.Label(stats_frame, text=f"User corrections logged: {len(corrections)}").pack()
        
        # Results area
        ttk.Label(right_frame, text="Recognition Results:", font=("Arial", 14, "bold")).pack(pady=5)
        
        self.result_label = ttk.Label(right_frame, text="", 
                                      font=("Arial", 28, "bold"), foreground='blue')
        self.result_label.pack(pady=10)
        
        self.confidence_label = ttk.Label(right_frame, text="", font=("Arial", 10))
        self.confidence_label.pack()
        
        ttk.Separator(right_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=10)
        
        ttk.Label(right_frame, text="Individual Digits:", font=("Arial", 12, "bold")).pack(pady=5)
        
        # Scrollable frame
        canvas_scroll = tk.Canvas(right_frame, width=380, height=450)
        scrollbar = ttk.Scrollbar(right_frame, orient="vertical", command=canvas_scroll.yview)
        self.scrollable_frame = ttk.Frame(canvas_scroll)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas_scroll.configure(scrollregion=canvas_scroll.bbox("all"))
        )
        
        canvas_scroll.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas_scroll.configure(yscrollcommand=scrollbar.set)
        
        canvas_scroll.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Mouse events
        self.canvas.bind('<Button-1>', self.start_draw)
        self.canvas.bind('<B1-Motion>', self.draw_line)
        self.canvas.bind('<ButtonRelease-1>', self.stop_draw)
        
        self.last_x = None
        self.last_y = None
        self.current_predictions = []
    
    def update_brush_size(self, value):
        self.brush_size = int(float(value))
        self.brush_label.config(text=f"{self.brush_size}")
    
    def start_draw(self, event):
        self.last_x = event.x
        self.last_y = event.y
    
    def draw_line(self, event):
        if self.last_x and self.last_y:
            self.canvas.create_line(self.last_x, self.last_y, event.x, event.y,
                                   width=self.brush_size*2, fill='black', 
                                   capstyle=tk.ROUND, smooth=tk.TRUE)
            
            self.draw.line([self.last_x, self.last_y, event.x, event.y], 
                          fill='black', width=self.brush_size*2)
            
            self.last_x = event.x
            self.last_y = event.y
    
    def stop_draw(self, event):
        self.last_x = None
        self.last_y = None
    
    def clear_canvas(self):
        self.canvas.delete('all')
        self.image = Image.new('RGB', (self.canvas_size, self.canvas_size), 'white')
        self.draw = ImageDraw.Draw(self.image)
        
        self.result_label.config(text="")
        self.confidence_label.config(text="")
        
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        self.current_predictions = []
    
    def show_correction_dialog(self, digit_idx, processed_img, predicted_digit):
        """Show dialog to correct a prediction"""
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Correct Digit #{digit_idx + 1}")
        dialog.geometry("300x250")
        
        ttk.Label(dialog, text=f"Model predicted: {predicted_digit}", 
                 font=("Arial", 12)).pack(pady=10)
        ttk.Label(dialog, text="What is the actual digit?", 
                 font=("Arial", 10)).pack(pady=5)
        
        # Number buttons
        button_frame = ttk.Frame(dialog)
        button_frame.pack(pady=10)
        
        for i in range(10):
            row = i // 5
            col = i % 5
            btn = ttk.Button(button_frame, text=str(i), width=5,
                           command=lambda digit=i: self.submit_correction(
                               dialog, processed_img, predicted_digit, digit))
            btn.grid(row=row, column=col, padx=2, pady=2)
        
        ttk.Button(dialog, text="Cancel", command=dialog.destroy).pack(pady=10)
    
    def submit_correction(self, dialog, processed_img, predicted, actual):
        """Submit a correction"""
        save_correction(processed_img, predicted, actual)
        dialog.destroy()
        
        # Show confirmation
        messagebox.showinfo("Correction Saved", 
                              f"Thanks! Correction saved: {predicted} → {actual}\n"
                              f"This will help improve the model.")
    
    def predict_all(self):
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        img_array = np.array(self.image.convert('L'))
        components = find_connected_components(img_array)
        
        if not components:
            self.result_label.config(text="No digits found!")
            self.confidence_label.config(text="")
            return
        
        self.canvas.delete('bbox')
        
        recognized_digits = []
        low_confidence_count = 0
        self.current_predictions = []
        
        for idx, component in enumerate(components):
            bbox = component['bbox']
            rmin, rmax, cmin, cmax = bbox
            
            self.canvas.create_rectangle(cmin, rmin, cmax, rmax, 
                                        outline='red', width=2, tags='bbox')
            
            processed = preprocess_digit(img_array, bbox)
            
            # Predict with model
            img_input = processed.reshape(1, 28, 28, 1)
            predictions = self.model.predict(img_input, verbose=0)[0]
            
            top_3_idx = np.argsort(predictions)[-3:][::-1]
            predicted_digit = top_3_idx[0]
            confidence = predictions[predicted_digit]
            
            recognized_digits.append(str(predicted_digit))
            
            # Check if low confidence
            is_uncertain = confidence < self.confidence_threshold
            if is_uncertain:
                low_confidence_count += 1
            
            # Store prediction info
            self.current_predictions.append({
                'processed': processed,
                'predicted': predicted_digit,
                'confidence': confidence,
                'predictions': predictions
            })
            
            # Create result frame
            digit_frame = ttk.Frame(self.scrollable_frame, relief=tk.RIDGE, padding=10)
            digit_frame.pack(fill=tk.X, pady=5)
            
            if is_uncertain:
                digit_frame.config(relief=tk.SOLID, borderwidth=2)
            
            # Show processed image
            processed_display = ((1 - processed) * 255).astype(np.uint8)
            processed_img = Image.fromarray(processed_display)
            processed_img = processed_img.resize((70, 70), Image.NEAREST)
            photo = ImageTk.PhotoImage(processed_img)
            
            img_label = tk.Label(digit_frame, image=photo, relief=tk.SUNKEN)
            img_label.image = photo
            img_label.pack(side=tk.LEFT, padx=10)
            
            # Prediction info
            text_frame = ttk.Frame(digit_frame)
            text_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            
            ttk.Label(text_frame, text=f"Digit #{idx+1}", 
                     font=("Arial", 10, "bold")).pack(anchor=tk.W)
            
            pred_label = ttk.Label(text_frame, text=f"Prediction: {predicted_digit}", 
                                  font=("Arial", 16, "bold"))
            if is_uncertain:
                pred_label.config(foreground='orange')
            else:
                pred_label.config(foreground='blue')
            pred_label.pack(anchor=tk.W)
            
            conf_text = f"Confidence: {confidence*100:.1f}%"
            if is_uncertain:
                conf_text += " ⚠️ LOW"
            ttk.Label(text_frame, text=conf_text, 
                     font=("Arial", 10)).pack(anchor=tk.W)
            
            # Top 3
            top3_text = "Top 3: " + ", ".join([f"{top_3_idx[i]} ({predictions[top_3_idx[i]]*100:.1f}%)" 
                                               for i in range(3)])
            ttk.Label(text_frame, text=top3_text, 
                     font=("Arial", 8), foreground='gray').pack(anchor=tk.W)
            
            # Correction button
            if is_uncertain:
                ttk.Button(text_frame, text="✏️ Correct This", 
                          command=lambda i=idx, p=processed, pd=predicted_digit: 
                          self.show_correction_dialog(i, p, pd)).pack(anchor=tk.W, pady=5)
        
        # Show final result
        full_number = ''.join(recognized_digits)
        self.result_label.config(text=f"Number: {full_number}")
        
        if low_confidence_count > 0:
            self.confidence_label.config(
                text=f"⚠️ {low_confidence_count} digit(s) have low confidence",
                foreground='orange'
            )
        else:
            self.confidence_label.config(
                text="✓ All digits recognized with high confidence",
                foreground='green'
            )
        
        print(f"\nRecognized: {full_number}")

# Run the app
root = tk.Tk()
app = EnhancedDigitRecognizerApp(root, model)
root.mainloop()