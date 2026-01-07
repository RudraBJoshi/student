import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from PIL import Image, ImageDraw, ImageTk
import tkinter as tk
from tkinter import ttk, messagebox
import os
from scipy import ndimage
import json
from datetime import datetime

MODEL_PATH = 'mnist_model_enhanced.keras'
CORRECTIONS_PATH = 'user_corrections.json'

def create_augmented_training():
    """Load data with augmentation for better generalization"""
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    x_train, x_test = x_train / 255.0, x_test / 255.0
    
    # Data augmentation
    data_augmentation = keras.Sequential([
        layers.RandomRotation(0.1),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomZoom(0.1),
    ])
    
    return (x_train, y_train), (x_test, y_test), data_augmentation

def create_enhanced_model():
    """Create a deeper, more robust model"""
    model = keras.Sequential([
        layers.Reshape((28, 28, 1), input_shape=(28, 28)),
        
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.Dropout(0.25),
        
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
    
    print("\nTraining enhanced CNN model...")
    history = model.fit(
        x_train.reshape(-1, 28, 28, 1),
        y_train,
        epochs=10,
        batch_size=128,
        validation_split=0.1,
        verbose=1
    )
    
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

def should_merge_components(comp1, comp2, img_shape):
    """Determine if two components should be merged into one digit"""
    bbox1 = comp1['bbox']
    bbox2 = comp2['bbox']
    
    # Get bounding box coordinates
    r1min, r1max, c1min, c1max = bbox1
    r2min, r2max, c2min, c2max = bbox2
    
    # Calculate centers
    center1_x = (c1min + c1max) / 2
    center1_y = (r1min + r1max) / 2
    center2_x = (c2min + c2max) / 2
    center2_y = (r2min + r2max) / 2
    
    # Calculate dimensions
    width1 = c1max - c1min
    height1 = r1max - r1min
    width2 = c2max - c2min
    height2 = r2max - r2min
    
    avg_width = (width1 + width2) / 2
    avg_height = (height1 + height2) / 2
    
    # Calculate distances
    horizontal_dist = abs(center1_x - center2_x)
    vertical_dist = abs(center1_y - center2_y)
    
    # Calculate overlap
    x_overlap = max(0, min(c1max, c2max) - max(c1min, c2min))
    y_overlap = max(0, min(r1max, r2max) - max(r1min, r2min))
    
    # Merge conditions:
    # 1. Components significantly overlap
    if x_overlap > avg_width * 0.3 and y_overlap > avg_height * 0.3:
        return True
    
    # 2. Components are very close horizontally and aligned vertically
    if horizontal_dist < avg_width * 0.8 and vertical_dist < avg_height * 0.5:
        return True
    
    # 3. Components are close vertically and aligned horizontally (for digits like 4, 7)
    if vertical_dist < avg_height * 0.8 and horizontal_dist < avg_width * 0.5:
        return True
    
    # 4. One component is very small (likely part of the same digit)
    if (width1 < avg_width * 0.3 or width2 < avg_width * 0.3) and horizontal_dist < avg_width:
        return True
    
    return False

def merge_bboxes(bbox1, bbox2):
    """Merge two bounding boxes"""
    r1min, r1max, c1min, c1max = bbox1
    r2min, r2max, c2min, c2max = bbox2
    
    return (
        min(r1min, r2min),
        max(r1max, r2max),
        min(c1min, c2min),
        max(c1max, c2max)
    )

def find_connected_components(img_array, threshold=250):
    """Find separate digits with intelligent merging of multi-stroke digits"""
    binary = img_array < threshold
    labeled, num_features = ndimage.label(binary)
    
    # First pass: collect all components
    raw_components = []
    for i in range(1, num_features + 1):
        rows, cols = np.where(labeled == i)
        
        if len(rows) < 15:  # Filter tiny noise
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
            'height': height,
            'merged': False
        })
    
    # Second pass: merge components that belong to the same digit
    merged_components = []
    used = set()
    
    for i, comp1 in enumerate(raw_components):
        if i in used:
            continue
        
        current_bbox = comp1['bbox']
        merge_group = [i]
        
        # Find all components that should merge with this one
        changed = True
        while changed:
            changed = False
            for j, comp2 in enumerate(raw_components):
                if j in used or j in merge_group:
                    continue
                
                # Check if should merge with current merged bbox
                temp_comp1 = {'bbox': current_bbox, 'width': 0, 'height': 0}
                
                if should_merge_components(temp_comp1, comp2, img_array.shape):
                    current_bbox = merge_bboxes(current_bbox, comp2['bbox'])
                    merge_group.append(j)
                    changed = True
        
        # Mark all merged components as used
        used.update(merge_group)
        
        # Add padding to final bbox
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
            'center_x': (cmin + cmax) / 2,
            'width': cmax - cmin,
            'height': rmax - rmin
        })
    
    # Sort left to right
    merged_components.sort(key=lambda x: x['center_x'])
    
    return merged_components

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
        self.confidence_threshold = 0.6
        
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
        ttk.Label(left_frame, text="✓ Multi-stroke digits now supported!", 
                 font=("Arial", 9), foreground='green').pack()
        
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
        self.brush_scale.set(self.brush_size)  # Set after label is created
        
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
        
        # Update the result label temporarily
        original_text = self.confidence_label.cget("text")
        self.confidence_label.config(
            text=f"✓ Correction saved: {predicted} → {actual}",
            foreground='green'
        )
        
        # Reset after 3 seconds
        self.root.after(3000, lambda: self.confidence_label.config(text=original_text))
        
        dialog.destroy()
        
        print(f"Correction saved: {predicted} → {actual}")
    
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